import { 
  AgentRunResponse, 
  ToolExecutionTrace, 
  WorkBriefDraft, 
  PolicyNotice,
  HybridExtractionSchema,
  HybridExtraction,
  VerifiedFacts,
  UnknownFieldItem,
  SmartQuestion,
  PipelineStage,
  ModelSuggestion
} from '@/types/agent';
import { executeExtractBrief } from './tools/extract-brief';
import { executeIdentifyMissingFields } from './tools/identify-missing';
import { executeRiskCheck } from './tools/risk-check';
import { executeReadinessCheck } from './tools/readiness-check';
import { executeProposeNextAction } from './tools/propose-action';
import { executeCreateWorkBriefDraft, registerPendingSuggestions } from './tools/create-draft';
import { ConstructionPolicyGuard } from './policy/policy-guard';
import { 
  calculateConstructionQuantities, 
  generateEngineeringSolutions, 
  generateWorkBreakdown, 
  generateAgentLoopSteps,
  generateSkepticVerdicts,
  generateMarketScrapedMaterials,
  generateProjectBlueprints,
  generateSpecializedAgentStages
} from './tools/engineering-engine';

export interface RunAgentOptions {
  query: string;
  createDraft?: boolean;
  idempotencyKey?: string;
  userAnswers?: Record<string, string>;
  llmExtractor?: (query: string) => Promise<unknown>;
}

export class AgentOrchestrator {
  public static async run(options: RunAgentOptions): Promise<AgentRunResponse> {
    const { 
      query, 
      createDraft = true, 
      idempotencyKey = `demo-${Date.now()}`, 
      userAnswers,
      llmExtractor
    } = options;
    
    const traces: ToolExecutionTrace[] = [];
    const timestamp = () => new Date().toISOString();

    // 1. ПРОВЕРКА POLICY GUARD НА ВХОДЕ: перехват запроса цены
    const priceCheck = ConstructionPolicyGuard.validatePriceSafety(query);
    let policyNotice: PolicyNotice | null = null;

    if (!priceCheck.allowed && priceCheck.notice) {
      policyNotice = priceCheck.notice;
    }

    // 2. ОПРЕДЕЛЕНИЕ РЕЖИМА ИСПОЛНЕНИЯ
    let engineMode: 'deterministic' | 'hybrid' | 'deterministic_fallback' = 'deterministic';
    let engineBadge = 'Demo mode · Rules + Safety Guard';

    const requestedMode = process.env.AGENT_ENGINE_MODE;
    const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);
    const shouldAttemptHybrid = (requestedMode === 'hybrid' && hasOpenAiKey) || Boolean(llmExtractor);

    let hybridExtractionResult: HybridExtraction | null = null;

    if (shouldAttemptHybrid) {
      try {
        const rawLlmOutput = llmExtractor 
          ? await llmExtractor(query) 
          : await this.callOpenAiAdapter(query);

        // А. Парсинг ответа
        let parsedJson: unknown;
        if (typeof rawLlmOutput === 'string') {
          parsedJson = JSON.parse(rawLlmOutput);
        } else if (typeof rawLlmOutput === 'object' && rawLlmOutput !== null) {
          parsedJson = rawLlmOutput;
        } else {
          throw new Error('LLM вернула пустой или некорректный тип данных');
        }

        // Б. Рекурсивный Policy Guard ДО применения
        const postLlmPriceCheck = ConstructionPolicyGuard.validatePriceSafety(parsedJson);
        if (!postLlmPriceCheck.allowed) {
          traces.push({
            step: 0,
            tool_name: 'llm_hybrid_adapter',
            description: 'Ответ LLM содержал запрещенные ценовые поля или смету',
            timestamp: timestamp(),
            status: 'GUARD_INTERCEPTED',
            input_summary: { requested_mode: 'hybrid' },
            output_summary: { violation: postLlmPriceCheck.notice?.rule },
            policy_decision: 'GUARD_INTERCEPTED: Попытка генерации цены заблокирована Policy Guard. Переход в безопасный fallback.',
          });
          throw new Error('Ответ LLM нарушил политику запрета цен');
        }

        // В. Валидация Zod: HybridExtractionSchema
        const zodValidation = HybridExtractionSchema.safeParse(parsedJson);
        if (!zodValidation.success) {
          throw new Error(`Ошибка валидации Zod: ${zodValidation.error.message}`);
        }

        const candidate = zodValidation.data;

        if (candidate.external_action || candidate.financial_advice) {
          traces.push({
            step: 0,
            tool_name: 'llm_hybrid_adapter',
            description: 'Ответ LLM содержал несанкционированные внешние действия',
            timestamp: timestamp(),
            status: 'GUARD_INTERCEPTED',
            input_summary: { requested_mode: 'hybrid' },
            output_summary: { external_action: candidate.external_action },
            policy_decision: 'GUARD_INTERCEPTED: Внешние действия запрещены. Переход в безопасный fallback.',
          });
          throw new Error('Ответ LLM содержал внешние действия');
        }

        hybridExtractionResult = candidate;
        engineMode = 'hybrid';
        engineBadge = 'Hybrid AI · LLM + Policy Guard';

        traces.push({
          step: 0,
          tool_name: 'llm_hybrid_adapter',
          description: 'Серверный LLM-разбор успешно проверен схемой Zod и Policy Guard',
          timestamp: timestamp(),
          status: 'SUCCESS',
          input_summary: { requested_mode: 'hybrid', model: 'gpt-4o-mini' },
          output_summary: {
            city_proposed: candidate.city,
            area_proposed: candidate.area_sqm,
            timeline_proposed: candidate.target_timeline_months,
            questions_count: candidate.questions?.length || 0,
            unknowns_count: candidate.unknown_fields?.length || 0,
          },
          policy_decision: 'HYBRID_VALIDATED: Структурированный JSON валидирован по Zod и проверен Policy Guard.',
        });
      } catch (err: any) {
        engineMode = 'deterministic_fallback';
        engineBadge = 'AI недоступен — показан безопасный demo fallback';

        if (!traces.some((t) => t.tool_name === 'llm_hybrid_adapter')) {
          traces.push({
            step: 0,
            tool_name: 'llm_hybrid_adapter',
            description: 'Вызов внешнего AI завершился ошибкой или таймаутом',
            timestamp: timestamp(),
            status: 'FALLBACK',
            input_summary: { requested_mode: 'hybrid' },
            output_summary: { error: err.message || 'Unknown error' },
            policy_decision: 'SAFE_FALLBACK: Система переключена на надёжное детерминированное ядро.',
          });
        }
      }
    }

    // ШАГ 1: extract_brief с жесткой изоляцией неподтверждённых значений
    const step1Start = timestamp();
    let facts: VerifiedFacts;
    let modelSuggestions: ModelSuggestion[] = [];

    // Базовое детерминированное извлечение проверенных фактов
    const deterministicExtract = executeExtractBrief({ raw_query: query });

    if (engineMode === 'hybrid' && hybridExtractionResult) {
      // Валидируем предложения модели по evidence spans
      const validated = this.validateLlmSuggestionsWithEvidence(
        hybridExtractionResult,
        query,
        deterministicExtract.facts
      );
      facts = validated.facts;
      modelSuggestions = validated.suggestions;

      traces.push({
        step: 1,
        tool_name: 'extract_brief',
        description: 'Верификация фактов модели по evidence spans: неподтвержденные вынесены в suggestions',
        timestamp: step1Start,
        status: 'SUCCESS',
        input_summary: { hybrid_used: true },
        output_summary: {
          verified_facts_count: Object.values(facts).filter((f) => typeof f === 'object' && f && 'value' in f && f.value !== null).length,
          model_suggestions_count: modelSuggestions.length,
        },
        policy_decision: 'STRICT_FACT_ISOLATION: В VerifiedFacts попали ТОЛЬКО подтверждённые пользователем данные.',
      });
    } else {
      facts = deterministicExtract.facts;
      traces.push({
        step: 1,
        tool_name: 'extract_brief',
        description: 'Детерминированное извлечение сущностей из сообщения пользователя',
        timestamp: step1Start,
        status: 'SUCCESS',
        input_summary: { query_length: query.length },
        output_summary: {
          city: facts.city.value,
          property_type: facts.property_type.value,
          area_sqm: facts.area_sqm.value,
          timeline_months: facts.target_timeline_months.value,
        },
        policy_decision: 'PROVENANCE_USER: Извлечены только параметры из сообщения, домысливание отключено.',
      });
    }

    // ШАГ 2: identify_missing_fields с объединением неизвестных от модели без дублей
    const step2Start = timestamp();
    const missingResult = executeIdentifyMissingFields({
      raw_query: query,
      facts,
    });

    let mergedUnknowns = [...missingResult.missing_fields];
    if (engineMode === 'hybrid' && hybridExtractionResult && hybridExtractionResult.unknown_fields) {
      for (const u of hybridExtractionResult.unknown_fields) {
        if (!mergedUnknowns.some((existing) => existing.id === u.id)) {
          mergedUnknowns.push({
            id: u.id,
            label: u.label,
            status: 'UNKNOWN',
            priority: u.priority || 'HIGH',
            explanation: u.explanation,
          });
        }
      }
    }

    traces.push({
      step: 2,
      tool_name: 'identify_missing_fields',
      description: 'Объединение неизвестных (базовые строительные пробелы + специфика от модели)',
      timestamp: step2Start,
      status: 'SUCCESS',
      input_summary: { extracted_facts: 4 },
      output_summary: {
        total_unknowns: mergedUnknowns.length,
        critical_count: mergedUnknowns.filter((m) => m.priority === 'CRITICAL').length,
      },
      policy_decision: 'STRICT_ISOLATION: Пробелы изолированы как UNKNOWN и не маркируются фактами.',
    });

    // ШАГ 3: risk_check (с учетом перехвата цены)
    const step3Start = timestamp();
    const riskResult = executeRiskCheck({
      facts,
      missing: mergedUnknowns,
    });

    const step3Status = policyNotice ? 'GUARD_INTERCEPTED' : 'SUCCESS';
    const step3PolicyDecision = policyNotice
      ? 'PRICE_GUARD_INTERCEPTED: Запрос на расчёт цены перехвачен. Поле сметы заблокировано.'
      : 'POLICY_ENFORCED: Смета до обмера специалистом не рассчитывается.';

    traces.push({
      step: 3,
      tool_name: 'risk_check',
      description: 'Аудит строительных рисков и проверка запрета ранней цены',
      timestamp: step3Start,
      status: step3Status,
      input_summary: { has_price_request: Boolean(policyNotice) },
      output_summary: {
        risks_count: riskResult.risks.length,
        price_blocked: true,
      },
      policy_decision: step3PolicyDecision,
    });

    // ШАГ 4: readiness_check
    const step4Start = timestamp();
    const readinessResult = executeReadinessCheck({
      facts,
      missing: mergedUnknowns,
    });

    traces.push({
      step: 4,
      tool_name: 'readiness_check',
      description: 'Двухконтурный скоринг готовности и блокировка внешних действий',
      timestamp: step4Start,
      status: 'SUCCESS',
      input_summary: { brief_score: readinessResult.brief_readiness_pct },
      output_summary: {
        brief_readiness: `${readinessResult.brief_readiness_pct}%`,
        rfq_readiness: `${readinessResult.rfq_readiness_pct}% (LOCKED)`,
      },
      policy_decision: 'EXTERNAL_ACTIONS_LOCKED: Тендер и контакт с подрядчиками заблокированы.',
    });

    // ШАГ 5: propose_next_action (вопросы от модели или детерминированные)
    const step5Start = timestamp();
    let questions: SmartQuestion[];
    const deterministicAction = executeProposeNextAction({
      facts,
      missing: mergedUnknowns,
    });
    const pipeline: PipelineStage[] = deterministicAction.pipeline;

    if (
      engineMode === 'hybrid' && 
      hybridExtractionResult && 
      hybridExtractionResult.questions && 
      hybridExtractionResult.questions.length > 0
    ) {
      questions = hybridExtractionResult.questions.slice(0, 3).map((q, idx) => ({
        id: q.id || `q_llm_${idx + 1}`,
        question: q.question,
        category: q.category || 'STATE',
        why_needed: q.why_needed || 'Уточнение для формирования безопасного технического задания',
        recommended_options: q.recommended_options && q.recommended_options.length > 0
          ? q.recommended_options
          : ['Да', 'Нет', 'Уточнить со специалистом'],
      }));
    } else {
      questions = deterministicAction.questions;
    }

    traces.push({
      step: 5,
      tool_name: 'propose_next_action',
      description: 'Формирование не более 3 вопросов и назначение обмера специалистом',
      timestamp: step5Start,
      status: 'SUCCESS',
      input_summary: { questions_limit: 3 },
      output_summary: {
        questions_count: questions.length,
        next_step: deterministicAction.recommended_next_step.title,
      },
      policy_decision: 'COGNITIVE_MINIMIZATION: Задано ровно 3 вопроса с быстрыми вариантами.',
    });

    // ШАГ 6: create_workbrief_draft (без выдуманных фактов)
    let workbrief_draft: WorkBriefDraft | null = null;
    if (createDraft) {
      const step6Start = timestamp();
      const unknownDescriptions = mergedUnknowns
        .filter((m) => m.status !== 'VERIFIED')
        .map((m) => `${m.label}: ${m.explanation}`);

      const draftResult = executeCreateWorkBriefDraft({
        idempotency_key: idempotencyKey,
        facts,
        assumptions: [],
        open_unknowns: unknownDescriptions,
        user_answers: userAnswers,
        pending_suggestions: modelSuggestions,
      });

      workbrief_draft = draftResult.draft;

      traces.push({
        step: 6,
        tool_name: 'create_workbrief_draft',
        description: 'Идемпотентная сборка черновика WorkBrief для специалиста',
        timestamp: step6Start,
        status: 'SUCCESS',
        input_summary: { idempotency_key: idempotencyKey, cached: draftResult.cached },
        output_summary: {
          brief_id: workbrief_draft.brief_id,
          status: workbrief_draft.status,
          human_approval_required: workbrief_draft.human_approval_required,
        },
        policy_decision: 'DRAFT_ONLY: Сформирован черновик без внешних действий.',
      });
    }

    const areaNum = typeof facts.area_sqm.value === 'number' ? facts.area_sqm.value : 58;
    const cityStr = String(facts.city.value || 'Астана');
    const propertyTypeStr = String(facts.property_type.value || 'квартира');

    // Определение типа исходного состояния объекта:
    let renovationType: 'rough' | 'whitebox' | 'secondary' = 'rough';
    if (/white\s*box|предчистов\w*/i.test(query)) {
      renovationType = 'whitebox';
    } else if (/вторичк\w*|старый\s+дом|демонтаж\w*/i.test(query)) {
      renovationType = 'secondary';
    }

    const quantities = calculateConstructionQuantities(areaNum, 2.7, renovationType);
    const solutions = generateEngineeringSolutions(areaNum, propertyTypeStr);
    const work_breakdown = generateWorkBreakdown(areaNum);
    const agent_loop_steps = generateAgentLoopSteps(areaNum, cityStr);
    const skeptic_verdicts = generateSkepticVerdicts(areaNum, propertyTypeStr);
    const market_materials = generateMarketScrapedMaterials(areaNum, 'optimal');
    const project_blueprints = generateProjectBlueprints(areaNum, renovationType);
    const specialized_agent_stages = generateSpecializedAgentStages(areaNum, cityStr);

    return {
      query,
      engine_mode: engineMode,
      engine_badge: engineBadge,
      policy_notice: policyNotice,
      facts,
      model_suggestions: modelSuggestions,
      unknowns: mergedUnknowns,
      questions,
      risks: riskResult.risks,
      pipeline,
      readiness: readinessResult,
      safety_notice: riskResult.safety_summary,
      tool_traces: traces,
      workbrief_draft,
      quantities,
      solutions,
      work_breakdown,
      agent_loop_steps,
      skeptic_verdicts,
      market_materials,
      project_blueprints,
      specialized_agent_stages,
    };
  }

  /**
   * Проверка предложений LLM по evidence spans:
   * 1. Значение попадает в VerifiedFacts (source: 'USER') ТОЛЬКО если evidence span присутствует в запросе
   *    и удовлетворяет семантическим правилам (не просто цифра).
   * 2. Все неподтверждённые значения переносятся в model_suggestions.
   * 3. Правило «квартира подтверждает 2-комнатную» удалено.
   */
  private static validateLlmSuggestionsWithEvidence(
    llm: HybridExtraction,
    rawQuery: string,
    deterministicFacts: VerifiedFacts
  ): { facts: VerifiedFacts; suggestions: ModelSuggestion[] } {
    const q = rawQuery.toLowerCase();
    const suggestions: ModelSuggestion[] = [];

    // 1. Город
    let verifiedCity = deterministicFacts.city;
    if (llm.city) {
      const cityLower = llm.city.toLowerCase();
      const evidence = (llm.city_evidence || llm.city).toLowerCase().trim();
      const isConfirmed = q.includes(evidence) && (
        (cityLower.startsWith('астан') && q.includes('астан')) ||
        (cityLower.startsWith('алмат') && q.includes('алмат')) ||
        (cityLower.startsWith('шымкент') && q.includes('шымкент')) ||
        (cityLower.startsWith('москв') && q.includes('москв')) ||
        (cityLower.startsWith('санкт-петербург') && (q.includes('санкт-петербург') || q.includes('питер'))) ||
        (cityLower.startsWith('казан') && q.includes('казан'))
      );

      if (isConfirmed) {
        verifiedCity = {
          value: llm.city,
          label: 'Город объекта',
          source: 'USER',
          raw_token: evidence,
        };
      } else {
        suggestions.push({
          suggestion_id: `sug-city-${Math.random().toString(36).substring(2, 9)}`,
          field: 'city',
          label: 'Город объекта',
          proposed_value: llm.city,
          reason: 'Город предложен моделью, но отсутствует в тексте запроса',
        });
      }
    }

    // 2. Тип объекта и планировка
    let verifiedProperty = deterministicFacts.property_type;
    if (llm.property_type) {
      const pLower = llm.property_type.toLowerCase();
      const evidence = (llm.property_type_evidence || llm.property_type).toLowerCase().trim();
      const hasEvidence = q.includes(evidence);

      // ВНИМАНИЕ: Слово «квартира» НЕ подтверждает «2-комнатную»!
      const isTwoRoom = /2-комнат|двухкомнат|2к\b|двушк/.test(q) && /2|двух/.test(pLower);
      const isOneRoom = /1-комнат|однокомнат|1к\b|студи/.test(q) && /1|одн|студи/.test(pLower);
      const isThreeRoom = /3-комнат|трехкомнат|трёхкомнат|3к\b/.test(q) && /3|трех|трёх/.test(pLower);
      const isGenericFlat = q.includes('квартир') && !/2|3|1|студи/.test(pLower);

      if (hasEvidence && (isTwoRoom || isOneRoom || isThreeRoom || isGenericFlat)) {
        verifiedProperty = {
          value: llm.property_type,
          label: 'Тип объекта',
          source: 'USER',
          raw_token: evidence,
        };
      } else {
        suggestions.push({
          suggestion_id: `sug-property_type-${Math.random().toString(36).substring(2, 9)}`,
          field: 'property_type',
          label: 'Тип и планировка',
          proposed_value: llm.property_type,
          reason: 'Планировка предложена моделью, но не подтверждена сообщением пользователя',
        });
      }
    }

    // 3. Площадь (area_sqm)
    let verifiedArea = deterministicFacts.area_sqm;
    if (typeof llm.area_sqm === 'number') {
      const evidence = (llm.area_sqm_evidence || `${llm.area_sqm}`).toLowerCase().trim();
      const hasEvidence = q.includes(evidence);
      // Проверяем, что это не просто цифра (например, кв. 58), а именно площадь с маркером м2/кв.м
      const areaRegex = /(\d+(?:[.,]\d+)?)\s*(?:м2|м²|кв\.?\s*м|кв\.?\s*метров|метров|квадратов)/i;
      const matchedArea = q.match(areaRegex);

      if (hasEvidence && matchedArea && parseFloat(matchedArea[1].replace(',', '.')) === llm.area_sqm) {
        verifiedArea = {
          value: llm.area_sqm,
          label: 'Площадь из сообщения',
          source: 'USER',
          raw_token: matchedArea[0],
        };
      } else {
        suggestions.push({
          suggestion_id: `sug-area_sqm-${Math.random().toString(36).substring(2, 9)}`,
          field: 'area_sqm',
          label: 'Площадь объекта',
          proposed_value: `${llm.area_sqm} м²`,
          reason: 'Число предложено моделью, но контекст площади не подтверждён текстом',
        });
      }
    }

    // 4. Срок въезда (target_timeline_months)
    let verifiedTimeline = deterministicFacts.target_timeline_months;
    if (typeof llm.target_timeline_months === 'number') {
      const evidence = (llm.target_timeline_months_evidence || `${llm.target_timeline_months}`).toLowerCase().trim();
      const hasEvidence = q.includes(evidence);
      const timelineRegex = /(?:заехать\s+через|срок\s*(?:до)?|готовность\s+через|через)\s*(\d+)\s*(месяц\w*|мес|нед\w*|дней|дня|год\w*)/i;
      const matchedTimeline = q.match(timelineRegex);

      let normalizedTimelineMonths: number | null = null;
      if (matchedTimeline) {
        const num = parseInt(matchedTimeline[1], 10);
        const unit = matchedTimeline[2].toLowerCase();
        if (unit.startsWith('мес')) normalizedTimelineMonths = num;
        else if (unit.startsWith('нед')) normalizedTimelineMonths = Math.max(1, Math.round(num / 4));
        else if (unit.startsWith('год')) normalizedTimelineMonths = num * 12;
      }

      // СТРОГОЕ СРАВНЕНИЕ: число из запроса обязано совпадать со значением модели
      if (hasEvidence && matchedTimeline && normalizedTimelineMonths === llm.target_timeline_months) {
        verifiedTimeline = {
          value: llm.target_timeline_months,
          label: 'Желаемый срок въезда',
          source: 'USER',
          raw_token: matchedTimeline[0],
        };
      } else {
        suggestions.push({
          suggestion_id: `sug-target_timeline_months-${Math.random().toString(36).substring(2, 9)}`,
          field: 'target_timeline_months',
          label: 'Желаемый срок въезда',
          proposed_value: `${llm.target_timeline_months} мес.`,
          reason: normalizedTimelineMonths !== null
            ? `Срок предложен моделью (${llm.target_timeline_months} мес.), но в запросе указано ${normalizedTimelineMonths} мес.`
            : 'Срок предложен моделью, но не подтверждён формулировкой пользователя',
        });
      }
    }

    // 5. Пожелания (special_requests):
    // Для подтверждённых пожеланий берем нормализованный результат детерминированного парсера.
    // Свободную формулировку модели оставляем в suggestions.
    const verifiedSpecial: string[] = [...deterministicFacts.special_requests];
    if (Array.isArray(llm.special_requests)) {
      for (const item of llm.special_requests) {
        const text = typeof item === 'string' ? item : item.request;
        const evidence = typeof item === 'object' && item.evidence_text ? item.evidence_text : text;
        const evidenceTrimmed = evidence.toLowerCase().trim();
        const hasEvidence = q.includes(evidenceTrimmed);

        if (hasEvidence) {
          const isExactOrKnown = deterministicFacts.special_requests.some(
            (detReq) => detReq.toLowerCase() === text.toLowerCase() || detReq.toLowerCase().includes(text.toLowerCase())
          );

          if (!isExactOrKnown) {
            // Модель семантически перефразировала («дорогой премиальный интерьер» вместо «современный ремонт»)
            suggestions.push({
              suggestion_id: `sug-special_request-${Math.random().toString(36).substring(2, 9)}`,
              field: 'special_request',
              label: 'Интерпретация AI',
              proposed_value: text,
              reason: `Свободная перефразировка модели («${text}») сохранена как предложение, в фактах зафиксирован нормализованный запрос пользователя`,
            });
          }
        } else {
          suggestions.push({
            suggestion_id: `sug-special_request-${Math.random().toString(36).substring(2, 9)}`,
            field: 'special_request',
            label: 'Пожелание по дизайну',
            proposed_value: text,
            reason: 'Пожелание предложено AI, но не озвучено пользователем',
          });
        }
      }
    }

    return {
      facts: {
        city: verifiedCity,
        property_type: verifiedProperty,
        area_sqm: verifiedArea,
        target_timeline_months: verifiedTimeline,
        special_requests: verifiedSpecial,
      },
      suggestions,
    };
  }

  private static async callOpenAiAdapter(query: string): Promise<unknown> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY отсутствует на сервере');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 
                'You are an AI assistant for a construction renovation project manager. ' +
                'Extract entities from the user renovation request into JSON conforming to this schema:\n' +
                '{\n' +
                '  "city": string | null,\n' +
                '  "city_evidence": string | null,\n' +
                '  "property_type": string | null,\n' +
                '  "property_type_evidence": string | null,\n' +
                '  "area_sqm": number | null,\n' +
                '  "area_sqm_evidence": string | null,\n' +
                '  "target_timeline_months": number | null,\n' +
                '  "target_timeline_months_evidence": string | null,\n' +
                '  "special_requests": [ { "request": string, "evidence_text": string } ],\n' +
                '  "unknown_fields": [ { "id": string, "label": string, "explanation": string, "priority": "CRITICAL" | "HIGH" | "MEDIUM" } ],\n' +
                '  "questions": [ { "id": string, "question": string, "category": "STATE" | "ACCESS" | "ENGINEERING" | "BUDGET", "why_needed": string, "recommended_options": string[] } ]\n' +
                '}\n' +
                'Strict Rules:\n' +
                '- Never estimate or promise prices, costs, budgets, or financial numbers in any field.\n' +
                '- Never output external actions, ordering, or contracts.\n' +
                '- Return at most 3 clarifying questions.\n' +
                '- Return ONLY valid JSON.',
            },
            { role: 'user', content: query },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Пустой ответ от OpenAI');
      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

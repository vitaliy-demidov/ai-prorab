import { 
  AgentRunResponse, 
  ToolExecutionTrace, 
  WorkBriefDraft, 
  PolicyNotice,
  HybridExtractionSchema,
  HybridExtraction,
  VerifiedFacts,
  FactSource,
  UnknownFieldItem,
  SmartQuestion,
  PipelineStage
} from '@/types/agent';
import { executeExtractBrief } from './tools/extract-brief';
import { executeIdentifyMissingFields } from './tools/identify-missing';
import { executeRiskCheck } from './tools/risk-check';
import { executeReadinessCheck } from './tools/readiness-check';
import { executeProposeNextAction } from './tools/propose-action';
import { executeCreateWorkBriefDraft } from './tools/create-draft';
import { ConstructionPolicyGuard } from './policy/policy-guard';

export interface RunAgentOptions {
  query: string;
  createDraft?: boolean;
  idempotencyKey?: string;
  userAnswers?: Record<string, string>;
  // Для тестирования и инжекции внешнего провайдера
  llmExtractor?: (query: string) => Promise<unknown>;
}

export class AgentOrchestrator {
  /**
   * Главный цикл запуска агента:
   * 1. Входная валидация Policy Guard (перехват запросов на цену).
   * 2. Выбор режима:
   *    - Если запрошен hybrid и есть ключ/экстрактор: вызов LLM -> парсинг -> Zod safeParse -> Policy Guard.
   *    - При успехе: факты получают source MODEL_EXTRACTION (USER только если подтверждены текстом).
   *    - При любой ошибке/нарушении: автоматический переход в deterministic_fallback.
   *    - По умолчанию: детерминированное ядро (Demo mode).
   * 3. Формирование аудируемого следа (Tool Traces).
   * 4. Идемпотентная сборка WorkBrief без выдуманных фактов.
   */
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

    // 1. ПРОВЕРКА POLICY GUARD НА ВХОДЕ: перехват запроса на точную/финальную цену
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

        // Б. Валидация Zod: HybridExtractionSchema
        const zodValidation = HybridExtractionSchema.safeParse(parsedJson);
        if (!zodValidation.success) {
          throw new Error(`Ошибка валидации Zod: ${zodValidation.error.message}`);
        }

        const candidate = zodValidation.data;

        // В. Policy Guard после LLM: запрет цены, сметы, фин. советов и внешних действий
        const postLlmPriceCheck = ConstructionPolicyGuard.validatePriceSafety(candidate);
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

        // Г. Успешная валидация
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
          },
          policy_decision: 'HYBRID_VALIDATED: Структурированный JSON валидирован по Zod и проверен Policy Guard.',
        });
      } catch (err: any) {
        // Безопасный fallback при ошибке, невалидном JSON или перехвате guard
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

    // ШАГ 1: extract_brief с учетом источника Provenance
    const step1Start = timestamp();
    let facts: VerifiedFacts;

    if (engineMode === 'hybrid' && hybridExtractionResult) {
      // ИСПОЛЬЗУЕМ РЕЗУЛЬТАТ LLM С ОБЯЗАТЕЛЬНОЙ ПРОВЕРКОЙ PROVENANCE
      facts = this.buildFactsFromLlm(hybridExtractionResult, query);

      traces.push({
        step: 1,
        tool_name: 'extract_brief',
        description: 'Сборка фактов из предложения LLM с проверкой текста пользователя',
        timestamp: step1Start,
        status: 'SUCCESS',
        input_summary: { hybrid_used: true },
        output_summary: {
          city: `${facts.city.value} [${facts.city.source}]`,
          property_type: `${facts.property_type.value} [${facts.property_type.source}]`,
          area_sqm: `${facts.area_sqm.value} [${facts.area_sqm.source}]`,
          timeline_months: `${facts.target_timeline_months.value} [${facts.target_timeline_months.source}]`,
        },
        policy_decision: 'FACT_PROVENANCE_ENFORCED: Факты маркированы MODEL_EXTRACTION; статус USER присвоен только при подтверждении в тексте.',
      });
    } else {
      // ДЕТЕРМИНИРОВАННОЕ ИЗВЛЕЧЕНИЕ (ПРАВИЛА И ЭВРИСТИКИ)
      const extractResult = executeExtractBrief({ raw_query: query });
      facts = extractResult.facts;

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

    // ШАГ 2: identify_missing_fields
    const step2Start = timestamp();
    const missingResult = executeIdentifyMissingFields({
      raw_query: query,
      facts,
    });
    
    traces.push({
      step: 2,
      tool_name: 'identify_missing_fields',
      description: 'Выявление критических неизвестных (состояние, бюджет, сети, доступ)',
      timestamp: step2Start,
      status: 'SUCCESS',
      input_summary: { extracted_facts: 4 },
      output_summary: {
        unknowns_count: missingResult.missing_fields.length,
        critical_unknowns: missingResult.critical_count,
      },
      policy_decision: 'STRICT_ISOLATION: Пробелы изолированы как UNKNOWN и не маркируются фактами.',
    });

    // ШАГ 3: risk_check (с учетом перехвата цены)
    const step3Start = timestamp();
    const riskResult = executeRiskCheck({
      facts,
      missing: missingResult.missing_fields,
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
      missing: missingResult.missing_fields,
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

    // ШАГ 5: propose_next_action (с поддержкой вопросов от LLM или детерминированных)
    const step5Start = timestamp();
    let questions: SmartQuestion[];
    let pipeline: PipelineStage[];

    const deterministicAction = executeProposeNextAction({
      facts,
      missing: missingResult.missing_fields,
    });
    pipeline = deterministicAction.pipeline;

    if (
      engineMode === 'hybrid' && 
      hybridExtractionResult && 
      hybridExtractionResult.questions && 
      hybridExtractionResult.questions.length > 0
    ) {
      // Используем вопросы, предложенные LLM (строго до 3 штук)
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
      const unknownDescriptions = missingResult.missing_fields
        .filter((m) => m.status !== 'VERIFIED')
        .map((m) => `${m.label}: ${m.explanation}`);

      const draftResult = executeCreateWorkBriefDraft({
        idempotency_key: idempotencyKey,
        facts,
        assumptions: [],
        open_unknowns: unknownDescriptions,
        user_answers: userAnswers,
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

    return {
      query,
      engine_mode: engineMode,
      engine_badge: engineBadge,
      policy_notice: policyNotice,
      facts,
      unknowns: missingResult.missing_fields,
      questions,
      risks: riskResult.risks,
      pipeline,
      readiness: readinessResult,
      safety_notice: riskResult.safety_summary,
      tool_traces: traces,
      workbrief_draft,
    };
  }

  /**
   * Сборка VerifiedFacts из предложения LLM с обязательной проверкой Provenance:
   * Факт обязан иметь source: MODEL_EXTRACTION; он становится USER ТОЛЬКО если явно подтверждён в тексте пользователя!
   */
  private static buildFactsFromLlm(llm: HybridExtraction, rawQuery: string): VerifiedFacts {
    const q = rawQuery.toLowerCase();

    // 1. Город
    let citySource: FactSource = 'MODEL_EXTRACTION';
    if (llm.city) {
      const cityLower = llm.city.toLowerCase();
      if (q.includes(cityLower) || (cityLower.startsWith('астан') && q.includes('астан')) || (cityLower.startsWith('алмат') && q.includes('алмат'))) {
        citySource = 'USER';
      }
    } else {
      citySource = 'UNKNOWN';
    }

    // 2. Тип объекта
    let propSource: FactSource = 'MODEL_EXTRACTION';
    if (llm.property_type) {
      const pLower = llm.property_type.toLowerCase();
      if (
        (/двухкомнат|2-комнат|2к|двушк/.test(q) && /2|двух/.test(pLower)) ||
        (/однокомнат|1-комнат|1к|студи/.test(q) && /1|одн|студи/.test(pLower)) ||
        (/трехкомнат|трёхкомнат|3-комнат|3к/.test(q) && /3|трех|трёх/.test(pLower)) ||
        (q.includes('квартир') && pLower.includes('квартир'))
      ) {
        propSource = 'USER';
      }
    } else {
      propSource = 'UNKNOWN';
    }

    // 3. Площадь
    let areaSource: FactSource = 'MODEL_EXTRACTION';
    if (typeof llm.area_sqm === 'number') {
      const numStr = String(llm.area_sqm);
      if (q.includes(numStr)) {
        areaSource = 'USER';
      }
    } else {
      areaSource = 'UNKNOWN';
    }

    // 4. Срок въезда
    let timeSource: FactSource = 'MODEL_EXTRACTION';
    if (typeof llm.target_timeline_months === 'number') {
      const timeStr = String(llm.target_timeline_months);
      if (q.includes(timeStr) && /месяц|мес|нед|год/.test(q)) {
        timeSource = 'USER';
      }
    } else {
      timeSource = 'UNKNOWN';
    }

    return {
      city: {
        value: llm.city || null,
        label: citySource === 'USER' ? 'Город объекта' : 'Город (предложено AI)',
        source: citySource,
      },
      property_type: {
        value: llm.property_type || null,
        label: propSource === 'USER' ? 'Тип объекта' : 'Тип (предложено AI)',
        source: propSource,
      },
      area_sqm: {
        value: typeof llm.area_sqm === 'number' ? llm.area_sqm : null,
        label: areaSource === 'USER' ? 'Площадь из сообщения' : 'Площадь (предложено AI)',
        source: areaSource,
      },
      target_timeline_months: {
        value: typeof llm.target_timeline_months === 'number' ? llm.target_timeline_months : null,
        label: timeSource === 'USER' ? 'Желаемый срок въезда' : 'Срок (предложено AI)',
        source: timeSource,
      },
      special_requests: Array.isArray(llm.special_requests) ? llm.special_requests : [],
    };
  }

  /**
   * Серверный вызов OpenAI с таймаутом и требованием чистого JSON.
   */
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
                '  "property_type": string | null,\n' +
                '  "area_sqm": number | null,\n' +
                '  "target_timeline_months": number | null,\n' +
                '  "special_requests": string[],\n' +
                '  "unknown_fields": [ { "id": string, "label": string, "explanation": string, "priority": "CRITICAL" | "HIGH" | "MEDIUM" } ],\n' +
                '  "questions": [ { "id": string, "question": string, "category": "STATE" | "ACCESS" | "ENGINEERING" | "BUDGET", "why_needed": string, "recommended_options": string[] } ]\n' +
                '}\n' +
                'Strict Rules:\n' +
                '- Never estimate or promise prices, costs, budgets, or financial numbers.\n' +
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

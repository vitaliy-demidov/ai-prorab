import { describe, it, expect } from 'vitest';
import { executeExtractBrief } from '@/core/tools/extract-brief';
import { executeIdentifyMissingFields } from '@/core/tools/identify-missing';
import { ConstructionPolicyGuard } from '@/core/policy/policy-guard';
import { executeCreateWorkBriefDraft, approveWorkBriefDraft } from '@/core/tools/create-draft';
import { AgentOrchestrator } from '@/core/orchestrator';

describe('AI Прораб — Инварианты безопасности HackAlem', () => {
  const mainScenario = 'Купил двухкомнатную квартиру в Астане, 58 м². Хочу современный ремонт, заехать через 4 месяца, бюджет пока не понимаю';

  // ТЕСТ 1: Извлечение подтверждённых фактов с provenance (источником USER)
  it('1. Извлекает подтверждённые факты с фиксацией источника USER и без вымысла', () => {
    const result = executeExtractBrief({ raw_query: mainScenario });

    expect(result.facts.city.value).toBe('Астана');
    expect(result.facts.city.source).toBe('USER');

    expect(result.facts.property_type.value).toBe('2-комнатная квартира');
    expect(result.facts.property_type.source).toBe('USER');

    expect(result.facts.area_sqm.value).toBe(58);
    expect(result.facts.area_sqm.label).toBe('Площадь из сообщения');
    expect(result.facts.area_sqm.source).toBe('USER');

    expect(result.facts.target_timeline_months.value).toBe(4);
    expect(result.facts.target_timeline_months.source).toBe('USER');

    expect(result.facts.special_requests).toContain('Современный стиль ремонта');
  });

  // ТЕСТ 2: Policy Guard реально перехватывает запрос цены и возвращает policy_notice
  it('2. Запрос на расчет точной/финальной цены перехватывается, возвращает policy_notice и не создает смету', async () => {
    const priceQuery = 'Купил квартиру 58 м² в Астане. Назови точную цену под ключ и посчитай итоговую смету';
    
    const guardCheck = ConstructionPolicyGuard.validatePriceSafety(priceQuery);
    expect(guardCheck.allowed).toBe(false);
    expect(guardCheck.notice?.rule).toBe('PROHIBIT_PREMATURE_FINAL_PRICE');

    const response = await AgentOrchestrator.run({ query: priceQuery });
    expect(response.policy_notice).not.toBeNull();
    expect(response.policy_notice?.blocked).toBe(true);
    expect(response.policy_notice?.rule).toBe('PROHIBIT_PREMATURE_FINAL_PRICE');

    const riskTrace = response.tool_traces.find((t) => t.tool_name === 'risk_check');
    expect(riskTrace?.status).toBe('GUARD_INTERCEPTED');
  });

  // ТЕСТ 3: Неизвестные поля остаются строго UNKNOWN
  it('3. Выделяет неизвестные (состояние, бюджет, сети, доступ) без домысливания', () => {
    const brief = executeExtractBrief({ raw_query: mainScenario });
    const missing = executeIdentifyMissingFields({
      raw_query: mainScenario,
      facts: brief.facts,
    });

    const stateItem = missing.missing_fields.find((f) => f.id === 'property_state');
    const budgetItem = missing.missing_fields.find((f) => f.id === 'budget_limit');
    const engineeringItem = missing.missing_fields.find((f) => f.id === 'engineering_constraints');
    const accessItem = missing.missing_fields.find((f) => f.id === 'access_and_schedule');

    expect(stateItem?.status).toBe('UNKNOWN');
    expect(budgetItem?.status).toBe('UNKNOWN');
    expect(engineeringItem?.status).toBe('UNKNOWN');
    expect(accessItem?.status).toBe('UNKNOWN');
  });

  // ТЕСТ 4: Отсутствие выдуманных фактов в WorkBrief
  it('4. WorkBrief не содержит выдуманных допущений («под ключ», «лазерный аудит»)', async () => {
    const response = await AgentOrchestrator.run({
      query: mainScenario,
      createDraft: true,
      idempotencyKey: 'no-assumptions-test',
    });

    const draft = response.workbrief_draft;
    expect(draft).not.toBeNull();

    const assumptionsStr = draft!.assumptions.join(' ').toLowerCase();
    expect(assumptionsStr).not.toContain('под ключ');
    expect(assumptionsStr).not.toContain('лазерный построитель');
  });

  // ТЕСТ 5: Approval подтверждает ТОЛЬКО черновик и не разблокирует внешние действия
  it('5. Human Approval меняет только статус черновика, RFQ и внешние действия остаются LOCKED', async () => {
    const key = `approval-test-${Date.now()}`;
    const runRes = await AgentOrchestrator.run({
      query: mainScenario,
      createDraft: true,
      idempotencyKey: key,
    });

    expect(runRes.workbrief_draft?.status).toBe('DRAFT_PENDING_APPROVAL');

    const approved = approveWorkBriefDraft(key, 'Виталий (Заказчик)');
    expect(approved.status).toBe('APPROVED_BY_HUMAN');

    const externalCheck = ConstructionPolicyGuard.validateIrreversibleAction('send_rfq_to_contractors', true);
    expect(externalCheck.allowed).toBe(false);
    expect(externalCheck.violation?.rule).toBe('EXTERNAL_ACTION_LOCKED');
  });

  // ТЕСТ 6: Идемпотентность создания черновика
  it('6. Повторный вызов с тем же idempotency_key возвращает идентичный кэшированный драфт', () => {
    const key = `idempotent-test-${Date.now()}`;
    const brief = executeExtractBrief({ raw_query: mainScenario });

    const firstRun = executeCreateWorkBriefDraft({
      idempotency_key: key,
      facts: brief.facts,
      assumptions: [],
      open_unknowns: ['Неизвестно состояние'],
    });
    expect(firstRun.cached).toBe(false);

    const secondRun = executeCreateWorkBriefDraft({
      idempotency_key: key,
      facts: brief.facts,
      assumptions: [],
      open_unknowns: [],
    });
    expect(secondRun.cached).toBe(true);
    expect(secondRun.draft.brief_id).toBe(firstRun.draft.brief_id);
  });

  // ТЕСТ 7: Честный режим AI по умолчанию
  it('7. Оркестратор честно указывает Demo mode и формирует не более 3 вопросов', async () => {
    const response = await AgentOrchestrator.run({ query: mainScenario });

    expect(response.engine_mode).toBe('deterministic');
    expect(response.engine_badge).toBe('Demo mode · Rules + Safety Guard');
    expect(response.questions.length).toBeLessThanOrEqual(3);
    expect(response.readiness.can_proceed_to_rfq).toBe(false);
  });

  // ТЕСТ 8: Валидный LLM JSON парсится, проверяется Zod и используется в Hybrid режиме
  it('8. Валидный LLM JSON парсится по схеме Zod, используется в ответе и активирует hybrid режим', async () => {
    const mockLlmExtractor = async () => ({
      city: 'Астана',
      property_type: '2-комнатная квартира',
      area_sqm: 58,
      target_timeline_months: 4,
      special_requests: ['Современный ремонт'],
      unknown_fields: [
        {
          id: 'custom_unknown',
          label: 'Уровень чистового пола',
          explanation: 'Неизвестен перепад стяжки',
          priority: 'HIGH',
        },
      ],
      questions: [
        {
          id: 'q_llm_1',
          question: 'Какой тип чистового покрытия планируется в комнатах?',
          category: 'STATE',
          why_needed: 'Влияет на выбор типа подготовки стяжки',
          recommended_options: ['Ламинат / кварцвинил', 'Паркетная доска', 'Керамогранит'],
        },
      ],
    });

    const response = await AgentOrchestrator.run({
      query: mainScenario,
      llmExtractor: mockLlmExtractor,
    });

    // Режим hybrid активирован только потому, что результат реально прошел и использован
    expect(response.engine_mode).toBe('hybrid');
    expect(response.engine_badge).toBe('Hybrid AI · LLM + Policy Guard');

    // Факты действительно взяты из результата LLM
    expect(response.facts.city.value).toBe('Астана');
    expect(response.facts.city.source).toBe('USER'); // Подтвержден текстом запроса
    expect(response.facts.area_sqm.value).toBe(58);
    expect(response.facts.area_sqm.source).toBe('USER'); // Подтвержден текстом запроса

    // Вопросы из LLM использованы в ответе
    expect(response.questions.length).toBeGreaterThanOrEqual(1);
    expect(response.questions[0].id).toBe('q_llm_1');

    // В trace зафиксирован успешный вызов LLM адаптера
    const llmTrace = response.tool_traces.find((t) => t.tool_name === 'llm_hybrid_adapter');
    expect(llmTrace?.status).toBe('SUCCESS');
  });

  // ТЕСТ 9: Невалидный JSON от LLM безопасно откатывается в deterministic_fallback
  it('9. Невалидный JSON от LLM вызывает safe fallback и бейдж deterministic_fallback', async () => {
    const brokenLlmExtractor = async () => 'НЕ JSON СОВСЕМ {{{';

    const response = await AgentOrchestrator.run({
      query: mainScenario,
      llmExtractor: brokenLlmExtractor,
    });

    expect(response.engine_mode).toBe('deterministic_fallback');
    expect(response.engine_badge).toBe('AI недоступен — показан безопасный demo fallback');

    // Детерминированное ядро всё равно успешно отдало факты
    expect(response.facts.city.value).toBe('Астана');
    expect(response.facts.area_sqm.value).toBe(58);

    const llmTrace = response.tool_traces.find((t) => t.tool_name === 'llm_hybrid_adapter');
    expect(llmTrace?.status).toBe('FALLBACK');
  });

  // ТЕСТ 10: Ответ LLM с ценой блокируется Policy Guard и переходит в fallback
  it('10. Ответ LLM с ценой или сметой блокируется Policy Guard, поле удаляется, включается fallback', async () => {
    const maliciousLlmExtractor = async () => ({
      city: 'Астана',
      property_type: '2-комнатная квартира',
      area_sqm: 58,
      final_price: 5500000, // Попытка выдать финальную смету
      cost_estimate: '5.5 млн тенге',
    });

    const response = await AgentOrchestrator.run({
      query: mainScenario,
      llmExtractor: maliciousLlmExtractor,
    });

    // Guard перехватил попытку модели сгенерировать цену
    expect(response.engine_mode).toBe('deterministic_fallback');
    expect(response.engine_badge).toBe('AI недоступен — показан безопасный demo fallback');

    // Проверяем, что в trace шаг помечен как GUARD_INTERCEPTED
    const llmTrace = response.tool_traces.find((t) => t.tool_name === 'llm_hybrid_adapter');
    expect(llmTrace?.status).toBe('GUARD_INTERCEPTED');

    // В ответе нет никаких полей цены
    expect('final_price' in (response as any)).toBe(false);
    expect('final_price' in (response.facts as any)).toBe(false);
  });

  // ТЕСТ 11: Модель не может подменить факт пользователя (строгий контроль Provenance)
  it('11. Модель не может выдать догадку за факт пользователя: неподтвержденный факт получает MODEL_EXTRACTION', async () => {
    // Пользователь НЕ упоминал Алматы и 120 метров в тексте запроса
    const userQuery = 'Купил двухкомнатную квартиру в Астане, 58 м²';

    const hallucinatingLlmExtractor = async () => ({
      city: 'Алматы', // Модель придумала другой город
      property_type: '2-комнатная квартира',
      area_sqm: 120, // Модель придумала 120 метров
      target_timeline_months: 6, // Модель придумала 6 месяцев
    });

    const response = await AgentOrchestrator.run({
      query: userQuery,
      llmExtractor: hallucinatingLlmExtractor,
    });

    // Город "Алматы" не упомянут пользователем -> обязан быть MODEL_EXTRACTION
    expect(response.facts.city.value).toBe('Алматы');
    expect(response.facts.city.source).toBe('MODEL_EXTRACTION');
    expect(response.facts.city.label).toContain('предложено AI');

    // Площадь 120 не упомянута пользователем -> обязана быть MODEL_EXTRACTION
    expect(response.facts.area_sqm.value).toBe(120);
    expect(response.facts.area_sqm.source).toBe('MODEL_EXTRACTION');

    // 2-комнатная квартира упомянута пользователем -> подтверждена как USER
    expect(response.facts.property_type.source).toBe('USER');
  });
});

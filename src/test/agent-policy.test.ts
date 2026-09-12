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

  // ТЕСТ 8: Валидный LLM JSON парсится по схеме Zod и используется в Hybrid режиме
  it('8. Валидный LLM JSON парсится по схеме Zod, используется в ответе и активирует hybrid режим', async () => {
    const mockLlmExtractor = async () => ({
      city: 'Астана',
      city_evidence: 'в Астане',
      property_type: '2-комнатная квартира',
      property_type_evidence: 'двухкомнатную квартиру',
      area_sqm: 58,
      area_sqm_evidence: '58 м²',
      target_timeline_months: 4,
      target_timeline_months_evidence: 'через 4 месяца',
      special_requests: [{ request: 'Современный ремонт', evidence_text: 'современный ремонт' }],
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

    expect(response.engine_mode).toBe('hybrid');
    expect(response.engine_badge).toBe('Hybrid AI · LLM + Policy Guard');
    expect(response.facts.city.value).toBe('Астана');
    expect(response.facts.city.source).toBe('USER');
    expect(response.facts.area_sqm.value).toBe(58);
    expect(response.facts.area_sqm.source).toBe('USER');
    expect(response.questions.length).toBeGreaterThanOrEqual(1);
    expect(response.questions[0].id).toBe('q_llm_1');

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
      final_price: 5500000,
      cost_estimate: '5.5 млн тенге',
    });

    const response = await AgentOrchestrator.run({
      query: mainScenario,
      llmExtractor: maliciousLlmExtractor,
    });

    expect(response.engine_mode).toBe('deterministic_fallback');
    expect(response.engine_badge).toBe('AI недоступен — показан безопасный demo fallback');

    const llmTrace = response.tool_traces.find((t) => t.tool_name === 'llm_hybrid_adapter');
    expect(llmTrace?.status).toBe('GUARD_INTERCEPTED');

    expect('final_price' in (response as any)).toBe(false);
    expect('final_price' in (response.facts as any)).toBe(false);
  });

  // ТЕСТ 11 (ПЕРЕПИСАН): Выдуманные Алматы / 120 м² НЕ попадают в facts или WorkBrief
  it('11. Выдуманные моделью Алматы / 120 м² НЕ попадают в facts и WorkBrief, а изолируются в model_suggestions', async () => {
    const userQuery = 'Купил двухкомнатную квартиру в Астане, 58 м²';

    const hallucinatingLlmExtractor = async () => ({
      city: 'Алматы', // Модель придумала другой город
      city_evidence: 'Алматы',
      property_type: '2-комнатная квартира',
      property_type_evidence: 'двухкомнатную квартиру',
      area_sqm: 120, // Модель придумала 120 метров
      area_sqm_evidence: '120 м²',
      target_timeline_months: 6,
    });

    const response = await AgentOrchestrator.run({
      query: userQuery,
      llmExtractor: hallucinatingLlmExtractor,
    });

    // 1. В facts.city НЕ должно быть Алматы! Там остаётся проверенная Астана из текста
    expect(response.facts.city.value).toBe('Астана');
    expect(response.facts.city.source).toBe('USER');

    // 2. В facts.area_sqm НЕ должно быть 120! Там остаются проверенные 58 м²
    expect(response.facts.area_sqm.value).toBe(58);
    expect(response.facts.area_sqm.source).toBe('USER');

    // 3. Выдуманные значения перенесены в model_suggestions
    const citySuggestion = response.model_suggestions.find((s) => s.field === 'city');
    const areaSuggestion = response.model_suggestions.find((s) => s.field === 'area_sqm');
    expect(citySuggestion).toBeDefined();
    expect(citySuggestion?.proposed_value).toBe('Алматы');
    expect(areaSuggestion).toBeDefined();
    expect(areaSuggestion?.proposed_value).toBe('120 м²');

    // 4. В WorkBrief черновике нет ни Алматы, ни 120 м²
    expect(response.workbrief_draft?.title).toContain('Астана');
    expect(response.workbrief_draft?.title).toContain('58 м²');
    expect(response.workbrief_draft?.title).not.toContain('Алматы');
    expect(response.workbrief_draft?.title).not.toContain('120');
  });

  // ТЕСТ 12: Ложное число (кв. 58 — это номер квартиры, а не площадь)
  it('12. Число без контекста площади (кв. 58) не подтверждается как площадь объекта', async () => {
    const aptNumberQuery = 'Живу в кв. 58, дом 4. Нужен косметический ремонт';

    const falseNumberLlmExtractor = async () => ({
      area_sqm: 58,
      area_sqm_evidence: 'кв. 58', // Попытка выдать номер квартиры за площадь
    });

    const response = await AgentOrchestrator.run({
      query: aptNumberQuery,
      llmExtractor: falseNumberLlmExtractor,
    });

    // В VerifiedFacts площадь НЕ должна стать 58!
    expect(response.facts.area_sqm.value).toBeNull();
    expect(response.facts.area_sqm.source).toBe('UNKNOWN');

    // Предложение изолировано в model_suggestions
    const areaSuggestion = response.model_suggestions.find((s) => s.field === 'area_sqm');
    expect(areaSuggestion).toBeDefined();
    expect(areaSuggestion?.reason).toContain('не подтверждён');
  });

  // ТЕСТ 13: Вложенная цена в вариантах ответа блокируется рекурсивным Policy Guard
  it('13. Вложенная цена внутри вариантов ответа вопроса блокируется рекурсивным Policy Guard', async () => {
    const hiddenPriceLlmExtractor = async () => ({
      city: 'Астана',
      city_evidence: 'в Астане',
      questions: [
        {
          id: 'q_sneaky',
          question: 'Какой пакет услуг выбираете?',
          why_needed: 'Для выбора тарифа',
          recommended_options: [
            'Базовый',
            'Фиксированная цена под ключ: 4 500 000 тг', // Вложенная запрещенная смета!
          ],
        },
      ],
    });

    const response = await AgentOrchestrator.run({
      query: mainScenario,
      llmExtractor: hiddenPriceLlmExtractor,
    });

    // Рекурсивный guard должен был перехватить скрытую цену
    expect(response.engine_mode).toBe('deterministic_fallback');
    const trace = response.tool_traces.find((t) => t.tool_name === 'llm_hybrid_adapter');
    expect(trace?.status).toBe('GUARD_INTERCEPTED');
  });

  // ТЕСТ 14: Неподтверждённые пожелания модели не попадают в WorkBrief
  it('14. Неподтверждённые пожелания модели не записываются как пожелания заказчика', async () => {
    const unconfirmedWishesLlmExtractor = async () => ({
      city: 'Астана',
      city_evidence: 'в Астане',
      special_requests: [
        'Умный дом с голосовым управлением', // Пользователь этого НЕ просил!
        'Премиальный штучный паркет',
      ],
    });

    const response = await AgentOrchestrator.run({
      query: mainScenario,
      llmExtractor: unconfirmedWishesLlmExtractor,
    });

    // В facts.special_requests только то, что просил пользователь
    expect(response.facts.special_requests).not.toContain('Умный дом с голосовым управлением');
    expect(response.facts.special_requests).not.toContain('Премиальный штучный паркет');

    // Неподтвержденные пожелания вынесены в model_suggestions
    const wishSuggestion = response.model_suggestions.find((s) => s.field === 'special_request');
    expect(wishSuggestion).toBeDefined();
  });

  // ТЕСТ 15: Объединение неизвестных от модели с детерминированными без дубликатов
  it('15. Валидные неизвестные от модели объединяются с детерминированными без дублей', async () => {
    const customUnknownsLlmExtractor = async () => ({
      city: 'Астана',
      city_evidence: 'в Астане',
      unknown_fields: [
        {
          id: 'ventilation_type', // Новое валидное неизвестное
          label: 'Тип вентиляции',
          explanation: 'Необходимо обследовать естественную вытяжку',
          priority: 'HIGH' as const,
        },
        {
          id: 'property_state', // Дубликат существующего id
          label: 'Состояние отделки',
          explanation: 'Черновая или White Box',
          priority: 'CRITICAL' as const,
        },
      ],
    });

    const response = await AgentOrchestrator.run({
      query: mainScenario,
      llmExtractor: customUnknownsLlmExtractor,
    });

    const ventItem = response.unknowns.find((u) => u.id === 'ventilation_type');
    expect(ventItem).toBeDefined();
    expect(ventItem?.label).toBe('Тип вентиляции');

    // Нет дубликатов по property_state
    const propertyStateItems = response.unknowns.filter((u) => u.id === 'property_state');
    expect(propertyStateItems.length).toBe(1);
  });

  // ТЕСТ 16: Слово «квартира» не подтверждает «2-комнатную квартиру»
  it('16. Слово «квартира» без указания комнатности не подтверждает 2-комнатную квартиру', async () => {
    const genericFlatQuery = 'Купил квартиру в Астане, 58 м²'; // Нет слова «2-комнатная»

    const guessingLlmExtractor = async () => ({
      city: 'Астана',
      city_evidence: 'в Астане',
      property_type: '2-комнатная квартира', // Модель наугад предположила 2 комнаты
      property_type_evidence: 'квартиру',
    });

    const response = await AgentOrchestrator.run({
      query: genericFlatQuery,
      llmExtractor: guessingLlmExtractor,
    });

    // 2-комнатная НЕ подтверждена!
    expect(response.facts.property_type.value).not.toBe('2-комнатная квартира');

    // Предположение ушло в model_suggestions
    const propSuggestion = response.model_suggestions.find((s) => s.field === 'property_type');
    expect(propSuggestion).toBeDefined();
    expect(propSuggestion?.proposed_value).toBe('2-комнатная квартира');
  });
});

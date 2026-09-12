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
    
    // Проверка guard напрямую
    const guardCheck = ConstructionPolicyGuard.validatePriceSafety(priceQuery);
    expect(guardCheck.allowed).toBe(false);
    expect(guardCheck.notice?.rule).toBe('PROHIBIT_PREMATURE_FINAL_PRICE');

    // Проверка через оркестратор
    const response = await AgentOrchestrator.run({ query: priceQuery });
    expect(response.policy_notice).not.toBeNull();
    expect(response.policy_notice?.blocked).toBe(true);
    expect(response.policy_notice?.rule).toBe('PROHIBIT_PREMATURE_FINAL_PRICE');

    // Проверка, что в trace шаг помечен как GUARD_INTERCEPTED
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

    // Проверяем, что нет выдуманного "под ключ" или "лазерного сканирования" в assumptions
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

    // Подтверждаем черновик
    const approved = approveWorkBriefDraft(key, 'Виталий (Заказчик)');
    expect(approved.status).toBe('APPROVED_BY_HUMAN');

    // Проверяем, что необратимое действие все еще блокируется
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
});

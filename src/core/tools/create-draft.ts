import { VerifiedFacts, WorkBriefDraft } from '@/types/agent';
import { ConstructionPolicyGuard } from '../policy/policy-guard';

export interface CreateDraftInput {
  idempotency_key: string;
  facts: VerifiedFacts;
  assumptions: string[];
  open_unknowns: string[];
  user_answers?: Record<string, string>;
}

// Демонстрационный in-memory кэш (после рестарта сервера сбрасывается)
const demoDraftCache = new Map<string, WorkBriefDraft>();

export function executeCreateWorkBriefDraft(input: CreateDraftInput): { draft: WorkBriefDraft; cached: boolean } {
  const { idempotency_key, facts, assumptions, open_unknowns, user_answers } = input;

  // Идемпотентность: повторный запрос с тем же ключом возвращает тот же драфт
  if (demoDraftCache.has(idempotency_key)) {
    const cachedDraft = demoDraftCache.get(idempotency_key)!;
    return { draft: { ...cachedDraft, cached: true }, cached: true };
  }

  // Защита от попыток передать цену
  const safetyCheck = ConstructionPolicyGuard.validatePriceSafety(facts);
  if (!safetyCheck.allowed) {
    throw new Error(safetyCheck.notice?.message || 'Нарушение политики безопасности');
  }

  const brief_id = `WB-${Date.now().toString(36).toUpperCase()}`;

  const preMeasurementGuardrails = [
    'Финальная стоимость не формируется до инструментального обмера специалистом и согласованного WorkBrief.',
    'Внешние действия (тендер, отправка подрядчикам, закупка материалов) отключены и остаются заблокированными.',
    'Черновик фиксирует вводные для специалиста и не является обязательством по оплате.',
  ];

  // Никаких выдуманных фактов или домыслов («под ключ», «лазерный аудит»).
  // В допущения входят ТОЛЬКО подтверждённые ответы пользователя и особые пожелания из сообщения.
  const cleanedAssumptions: string[] = [];
  if (facts.special_requests.length > 0) {
    facts.special_requests.forEach((req) => cleanedAssumptions.push(`Пожелание заказчика: ${req}`));
  }

  if (user_answers) {
    Object.entries(user_answers).forEach(([key, value]) => {
      cleanedAssumptions.push(`Уточнение заказчика [${key}]: ${value}`);
    });
  }

  const cityVal = facts.city.value || 'Уточняется';
  const typeVal = facts.property_type.value || 'Объект';
  const areaVal = facts.area_sqm.value ? `${facts.area_sqm.value} м²` : '';

  const draft: WorkBriefDraft = {
    idempotency_key,
    brief_id,
    created_at: new Date().toISOString(),
    title: `Черновик WorkBrief: ${typeVal}, г. ${cityVal} ${areaVal}`.trim(),
    status: 'DRAFT_PENDING_APPROVAL',
    facts,
    assumptions: cleanedAssumptions,
    open_unknowns,
    pre_measurement_guardrails: preMeasurementGuardrails,
    recommended_next_step: 'Инструментальный обмер специалистом',
    human_approval_required: true,
    cached: false,
  };

  demoDraftCache.set(idempotency_key, draft);

  return { draft, cached: false };
}

export function getCachedDraft(idempotency_key: string): WorkBriefDraft | null {
  return demoDraftCache.get(idempotency_key) || null;
}

export function approveWorkBriefDraft(idempotency_key: string, userSignature: string): WorkBriefDraft {
  const draft = demoDraftCache.get(idempotency_key);
  if (!draft) {
    throw new Error(`Черновик с ключом ${idempotency_key} не найден в демо-кэше.`);
  }

  // Обновляется ТОЛЬКО статус черновика WorkBrief. Внешние действия НЕ разблокируются.
  const approvedDraft: WorkBriefDraft = {
    ...draft,
    status: 'APPROVED_BY_HUMAN',
    assumptions: [...draft.assumptions, `Подтверждено заказчиком: ${userSignature}`],
  };

  demoDraftCache.set(idempotency_key, approvedDraft);
  return approvedDraft;
}

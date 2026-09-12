import { VerifiedFacts, WorkBriefDraft, ModelSuggestion, ToolExecutionTrace } from '@/types/agent';
import { ConstructionPolicyGuard } from '../policy/policy-guard';

export interface CreateDraftInput {
  idempotency_key: string;
  facts: VerifiedFacts;
  assumptions: string[];
  open_unknowns: string[];
  user_answers?: Record<string, string>;
  pending_suggestions?: ModelSuggestion[];
}

export interface ConfirmSuggestionInput {
  idempotency_key: string;
  suggestion_id: string;
  confirmed_by_human: true;
}

export interface ConfirmSuggestionResult {
  updatedFacts: VerifiedFacts;
  updatedDraft: WorkBriefDraft;
  auditTrace: ToolExecutionTrace;
  confirmedSuggestionId: string;
}

// ==============================================================================
// DEMO-ONLY STORAGE:
// Для локального хакатона HackAlem используется in-memory хранилище.
// Внимание: для публичного serverless-деплоя (Vercel/Cloudflare)
// замените DEMO_IN_MEMORY_DRAFT_CACHE на Vercel KV / Redis / PostgreSQL,
// либо используйте подписанный JWT-токен черновика (stateless session pattern).
// ==============================================================================
const DEMO_IN_MEMORY_DRAFT_CACHE = new Map<string, WorkBriefDraft>();
const DEMO_IN_MEMORY_PENDING_SUGGESTIONS = new Map<string, Map<string, ModelSuggestion>>();

export function clearDraftCacheForTests(): void {
  DEMO_IN_MEMORY_DRAFT_CACHE.clear();
  DEMO_IN_MEMORY_PENDING_SUGGESTIONS.clear();
}

export function registerPendingSuggestions(idempotency_key: string, suggestions: ModelSuggestion[]): void {
  let sessionMap = DEMO_IN_MEMORY_PENDING_SUGGESTIONS.get(idempotency_key);
  if (!sessionMap) {
    sessionMap = new Map<string, ModelSuggestion>();
    DEMO_IN_MEMORY_PENDING_SUGGESTIONS.set(idempotency_key, sessionMap);
  }
  for (const s of suggestions) {
    sessionMap.set(s.suggestion_id, s);
  }
}

export function getPendingSuggestions(idempotency_key: string): ModelSuggestion[] {
  const sessionMap = DEMO_IN_MEMORY_PENDING_SUGGESTIONS.get(idempotency_key);
  return sessionMap ? Array.from(sessionMap.values()) : [];
}

export function executeCreateWorkBriefDraft(input: CreateDraftInput): { draft: WorkBriefDraft; cached: boolean } {
  const { idempotency_key, facts, assumptions, open_unknowns, user_answers, pending_suggestions } = input;

  if (pending_suggestions && pending_suggestions.length > 0) {
    registerPendingSuggestions(idempotency_key, pending_suggestions);
  }

  // Защита от попыток передать цену
  const safetyCheck = ConstructionPolicyGuard.validatePriceSafety(facts);
  if (!safetyCheck.allowed) {
    throw new Error(safetyCheck.notice?.message || 'Нарушение политики безопасности');
  }

  const preMeasurementGuardrails = [
    'Финальная стоимость не формируется до инструментального обмера специалистом и согласованного WorkBrief.',
    'Внешние действия (тендер, отправка подрядчикам, закупка материалов) отключены и остаются заблокированными.',
    'Черновик фиксирует вводные для специалиста и не является обязательством по оплате.',
  ];

  // В WorkBrief допускаются ТОЛЬКО подтверждённые ответы пользователя и подтверждённые пожелания.
  const cleanedAssumptions: string[] = [...assumptions];
  if (facts.special_requests.length > 0) {
    facts.special_requests.forEach((req) => cleanedAssumptions.push(`Пожелание заказчика: ${req}`));
  }

  if (user_answers) {
    Object.entries(user_answers).forEach(([key, value]) => {
      cleanedAssumptions.push(`Уточнение заказчика [${key}]: ${value}`);
    });
  }

  // В заголовке WorkBrief используются только подтверждённые факты (source === 'USER')
  const cityVal = facts.city.source === 'USER' && facts.city.value ? facts.city.value : 'Уточняется';
  const typeVal = facts.property_type.source === 'USER' && facts.property_type.value ? facts.property_type.value : 'Объект';
  const areaVal = facts.area_sqm.source === 'USER' && facts.area_sqm.value ? `${facts.area_sqm.value} м²` : '';
  const title = `Черновик WorkBrief: ${typeVal}, г. ${cityVal} ${areaVal}`.trim();

  // Идемпотентность и версионирование при повторном анализе
  if (DEMO_IN_MEMORY_DRAFT_CACHE.has(idempotency_key)) {
    const existingDraft = DEMO_IN_MEMORY_DRAFT_CACHE.get(idempotency_key)!;

    // Извлечение ответов пользователя из допущений для сравнения
    const prevAnswers = existingDraft.assumptions.filter((a) => a.startsWith('Уточнение заказчика'));
    const newAnswers = cleanedAssumptions.filter((a) => a.startsWith('Уточнение заказчика'));

    const factsChanged = JSON.stringify(existingDraft.facts) !== JSON.stringify(facts);
    const answersChanged = JSON.stringify(prevAnswers) !== JSON.stringify(newAnswers);
    const hasContentChanged = factsChanged || answersChanged;

    if (!hasContentChanged) {
      // Истинный сетевой повтор с теми же данными: возвращаем кэшированный драфт
      return { draft: { ...existingDraft, cached: true }, cached: true };
    }

    // Данные изменились (пользователь ответил на вопрос или изменились факты)
    // Инвариант: после APPROVED_BY_HUMAN молчаливое изменение запрещено.
    // Создаем новую revision со статусом DRAFT_PENDING_APPROVAL!
    const nextRevision = (existingDraft.revision || 1) + 1;
    const updatedDraft: WorkBriefDraft = {
      ...existingDraft,
      revision: nextRevision,
      created_at: new Date().toISOString(),
      title,
      status: 'DRAFT_PENDING_APPROVAL',
      facts,
      assumptions: cleanedAssumptions,
      open_unknowns,
      cached: false,
    };

    DEMO_IN_MEMORY_DRAFT_CACHE.set(idempotency_key, updatedDraft);
    return { draft: updatedDraft, cached: false };
  }

  const brief_id = `WB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const draft: WorkBriefDraft = {
    idempotency_key,
    brief_id,
    revision: 1,
    created_at: new Date().toISOString(),
    title,
    status: 'DRAFT_PENDING_APPROVAL',
    facts,
    assumptions: cleanedAssumptions,
    open_unknowns,
    pre_measurement_guardrails: preMeasurementGuardrails,
    recommended_next_step: 'Инструментальный обмер специалистом',
    human_approval_required: true,
    cached: false,
  };

  DEMO_IN_MEMORY_DRAFT_CACHE.set(idempotency_key, draft);

  return { draft, cached: false };
}

export function getCachedDraft(idempotency_key: string): WorkBriefDraft | null {
  return DEMO_IN_MEMORY_DRAFT_CACHE.get(idempotency_key) || null;
}

export function approveWorkBriefDraft(idempotency_key: string, userSignature: string): WorkBriefDraft {
  const draft = DEMO_IN_MEMORY_DRAFT_CACHE.get(idempotency_key);
  if (!draft) {
    throw new Error(`Черновик с ключом ${idempotency_key} не найден в демо-кэше.`);
  }

  // Обновляется ТОЛЬКО статус черновика WorkBrief. Внешние действия НЕ разблокируются.
  const approvedDraft: WorkBriefDraft = {
    ...draft,
    status: 'APPROVED_BY_HUMAN',
    assumptions: [...draft.assumptions, `Подтверждено заказчиком (ревизия v${draft.revision || 1}): ${userSignature}`],
  };

  DEMO_IN_MEMORY_DRAFT_CACHE.set(idempotency_key, approvedDraft);
  return approvedDraft;
}

export function executeConfirmSuggestionInDraft(input: ConfirmSuggestionInput): ConfirmSuggestionResult {
  const { idempotency_key, suggestion_id, confirmed_by_human } = input;

  if (!confirmed_by_human) {
    throw new Error('Подтверждение предложения требует confirmed_by_human: true');
  }

  const sessionSuggestions = DEMO_IN_MEMORY_PENDING_SUGGESTIONS.get(idempotency_key);
  const suggestion = sessionSuggestions?.get(suggestion_id);

  if (!suggestion) {
    throw new Error(`Предложение с ID "${suggestion_id}" не найдено среди актуальных предложений для сессии "${idempotency_key}".`);
  }

  // Проверка через Policy Guard
  const priceSafety = ConstructionPolicyGuard.validatePriceSafety(suggestion.proposed_value);
  if (!priceSafety.allowed) {
    throw new Error(priceSafety.notice?.message || 'Попытка зафиксировать стоимость отклонена политикой безопасности');
  }

  // Валидация разумных границ значений (Sanity Bounds)
  const field = suggestion.field;
  const val = suggestion.proposed_value;

  if (field === 'area_sqm') {
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num) || num < 5 || num > 10000) {
      throw new Error(`Недопустимое значение площади: ${val}. Допустимый диапазон от 5 до 10 000 м².`);
    }
  } else if (field === 'target_timeline_months') {
    const num = typeof val === 'number' ? val : parseInt(String(val), 10);
    if (isNaN(num) || num < 1 || num > 120) {
      throw new Error(`Недопустимый срок въезда: ${val}. Допустимый диапазон от 1 до 120 месяцев.`);
    }
  } else if (field === 'city') {
    const str = String(val).trim();
    if (str.length < 2 || str.length > 100) {
      throw new Error('Название города должно содержать от 2 до 100 символов.');
    }
  } else if (field === 'property_type') {
    const str = String(val).trim();
    if (str.length < 2 || str.length > 100) {
      throw new Error('Тип объекта должен содержать от 2 до 100 символов.');
    }
  } else if (field === 'special_request') {
    const str = String(val).trim();
    if (str.length < 2 || str.length > 500) {
      throw new Error('Пожелание заказчика должно содержать от 2 до 500 символов.');
    }
  }

  const currentDraft = DEMO_IN_MEMORY_DRAFT_CACHE.get(idempotency_key);
  if (!currentDraft) {
    throw new Error(`Черновик с ключом ${idempotency_key} не найден. Сначала выполните анализ объекта.`);
  }

  // Обновление VerifiedFacts на сервере с присвоением source: 'USER'
  const updatedFacts: VerifiedFacts = JSON.parse(JSON.stringify(currentDraft.facts));

  if (field === 'special_request') {
    const strVal = String(val).trim();
    if (!updatedFacts.special_requests.includes(strVal)) {
      updatedFacts.special_requests.push(strVal);
    }
  } else if (field === 'target_timeline_months') {
    const num = typeof val === 'number' ? val : parseInt(String(val), 10);
    updatedFacts.target_timeline_months = {
      value: num,
      label: suggestion.label || 'Желаемый срок въезда',
      source: 'USER',
    };
  } else if (field === 'city') {
    updatedFacts.city = {
      value: String(val).trim(),
      label: suggestion.label || 'Город объекта',
      source: 'USER',
    };
  } else if (field === 'property_type') {
    updatedFacts.property_type = {
      value: String(val).trim(),
      label: suggestion.label || 'Тип объекта',
      source: 'USER',
    };
  } else if (field === 'area_sqm') {
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    updatedFacts.area_sqm = {
      value: num,
      label: suggestion.label || 'Площадь из сообщения',
      source: 'USER',
    };
  }

  // Обновляем допущения черновика
  const updatedAssumptions = [
    ...currentDraft.assumptions,
    `Подтверждено заказчиком предложение AI [${suggestion.label}]: ${val}`,
  ];

  // Пересчитываем заголовок
  const cityVal = updatedFacts.city.source === 'USER' && updatedFacts.city.value ? updatedFacts.city.value : 'Уточняется';
  const typeVal = updatedFacts.property_type.source === 'USER' && updatedFacts.property_type.value ? updatedFacts.property_type.value : 'Объект';
  const areaVal = updatedFacts.area_sqm.source === 'USER' && updatedFacts.area_sqm.value ? `${updatedFacts.area_sqm.value} м²` : '';
  const updatedTitle = `Черновик WorkBrief: ${typeVal}, г. ${cityVal} ${areaVal}`.trim();

  // Инкремент ревизии. Если был APPROVED_BY_HUMAN, сбрасываем в DRAFT_PENDING_APPROVAL!
  const nextRevision = (currentDraft.revision || 1) + 1;

  const updatedDraft: WorkBriefDraft = {
    ...currentDraft,
    revision: nextRevision,
    status: 'DRAFT_PENDING_APPROVAL',
    title: updatedTitle,
    facts: updatedFacts,
    assumptions: updatedAssumptions,
    created_at: new Date().toISOString(),
    cached: false,
  };

  DEMO_IN_MEMORY_DRAFT_CACHE.set(idempotency_key, updatedDraft);

  // Удаляем подтвержденное предложение из реестра актуальных предложений
  sessionSuggestions?.delete(suggestion_id);

  const auditTrace: ToolExecutionTrace = {
    step: 7,
    tool_name: 'confirm_model_suggestion',
    description: `Пользователь явно подтвердил AI-предложение (${suggestion_id}): ${suggestion.label} = ${val}`,
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    input_summary: {
      idempotency_key,
      suggestion_id,
      field: suggestion.field,
      proposed_value: suggestion.proposed_value,
      confirmed_by_human: true,
    },
    output_summary: {
      revision: updatedDraft.revision,
      status: updatedDraft.status,
      source_assigned: 'USER',
    },
    policy_decision: 'HUMAN_CONFIRMED: Предложение переведено в факты со статусом USER по явному действию человека.',
  };

  return {
    updatedFacts,
    updatedDraft,
    auditTrace,
    confirmedSuggestionId: suggestion_id,
  };
}



import { UnknownFieldItem, VerifiedFacts } from '@/types/agent';

export interface ReadinessCheckInput {
  facts: VerifiedFacts;
  missing: UnknownFieldItem[];
}

export interface ReadinessCheckOutput {
  brief_readiness_pct: number;
  rfq_readiness_pct: number;
  can_create_draft: boolean;
  can_proceed_to_rfq: boolean;
  rfq_block_reason: string;
  summary: string;
}

export function executeReadinessCheck(input: ReadinessCheckInput): ReadinessCheckOutput {
  const { facts, missing } = input;

  let briefScore = 0;
  if (facts.city.value) briefScore += 15;
  if (facts.property_type.value) briefScore += 15;
  if (facts.area_sqm.value) briefScore += 20;
  if (facts.target_timeline_months.value) briefScore += 15;

  const verifiedUnknowns = missing.filter((m) => m.status === 'VERIFIED').length;
  briefScore += verifiedUnknowns * 10;

  const brief_readiness_pct = Math.min(briefScore, 70);

  // Выход на тендер (RFQ) строго заблокирован до инструментального обмера
  const rfq_readiness_pct = 0;
  const can_create_draft = facts.area_sqm.value !== null && facts.city.value !== null;
  const can_proceed_to_rfq = false;

  const rfq_block_reason =
    'Тендер и выбор подрядчиков заблокированы: формирование заявки без согласованного WorkBrief и инструментального обмера не производится.';

  return {
    brief_readiness_pct,
    rfq_readiness_pct,
    can_create_draft,
    can_proceed_to_rfq,
    rfq_block_reason,
    summary: `Готовность черновика WorkBrief: ${brief_readiness_pct}%. Внешние действия заблокированы.`,
  };
}

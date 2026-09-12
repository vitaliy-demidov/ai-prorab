import { RiskItem, UnknownFieldItem, VerifiedFacts } from '@/types/agent';

export interface RiskCheckInput {
  facts: VerifiedFacts;
  missing: UnknownFieldItem[];
}

export interface RiskCheckOutput {
  risks: RiskItem[];
  overall_risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  safety_summary: {
    title: string;
    summary: string;
    points: string[];
  };
}

export function executeRiskCheck(input: RiskCheckInput): RiskCheckOutput {
  const { facts, missing } = input;
  const risks: RiskItem[] = [];

  // Риск 1: Оценка бюджета до обмера
  risks.push({
    id: 'risk_premature_pricing',
    title: 'Расчёт сметы до обмера вводит в заблуждение',
    description: 'Без инструментального обмера неизвестны фактические отклонения стен по вертикали, толщина необходимой стяжки и состояние перекрытий.',
    severity: 'CRITICAL',
    policy_rationale: 'Финальная стоимость не формируется до инструментального обмера специалистом и согласованного WorkBrief.',
  });

  // Риск 2: Сроки
  const timelineMonths = typeof facts.target_timeline_months.value === 'number' ? facts.target_timeline_months.value : null;
  if (timelineMonths && timelineMonths <= 4) {
    risks.push({
      id: 'risk_tight_timeline',
      title: 'Сжатый срок реализации (4 месяца)',
      description: 'Технологические циклы высыхания строительных смесей и заказ заказных позиций требуют ранней фиксации технического задания.',
      severity: 'HIGH',
      policy_rationale: 'Технологические перерывы для штукатурных и стяжечных работ являются обязательными.',
    });
  }

  // Риск 3: Неопределенность исходного состояния
  const stateUnknown = missing.find((m) => m.id === 'property_state' && m.status !== 'VERIFIED');
  if (stateUnknown) {
    risks.push({
      id: 'risk_state_ambiguity',
      title: 'Неизвестный объем подготовительных работ',
      description: 'Перечень работ принципиально отличается для черновой новостройки, предчистовой отделки или вторичного жилья с демонтажем.',
      severity: 'HIGH',
      policy_rationale: 'Определение исходного состояния необходимо до составления перечня работ.',
    });
  }

  // Риск 4: Неопределенность бюджета
  const budgetUnknown = missing.find((m) => m.id === 'budget_limit' && m.status !== 'VERIFIED');
  if (budgetUnknown) {
    risks.push({
      id: 'risk_unbounded_budget',
      title: 'Отсутствие финансового ориентира',
      description: 'Без определения бюджета невозможно сформировать техническое задание с подходящим классом материалов и инженерных решений.',
      severity: 'MEDIUM',
      policy_rationale: 'Требуется фиксация ценового ориентира заказчиком в WorkBrief.',
    });
  }

  const safety_summary = {
    title: 'Почему цена пока не формируется',
    summary: 'Чтобы не обещать цифру, которую объект не подтвердил.',
    points: [
      'Фактическая геометрия: перепады высот, плоскости стен и углы под мебель проверяются только лазерным нивелиром на объекте.',
      'Инженерные выводы: расположение стояков канализации, вводов воды и электрического щитка требует осмотра по месту.',
      'Скрытые слои: состояние перекрытий и оснований под стяжку невозможно оценить по тексту.',
      'Защита заказчика: агент не участвует в искусственном занижении сметы при первом контакте.',
    ],
  };

  return {
    risks,
    overall_risk_level: 'HIGH',
    safety_summary,
  };
}

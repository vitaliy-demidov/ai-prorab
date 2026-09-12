import { UnknownFieldItem, VerifiedFacts } from '@/types/agent';

export interface IdentifyMissingInput {
  raw_query: string;
  facts: VerifiedFacts;
}

export interface IdentifyMissingOutput {
  missing_fields: UnknownFieldItem[];
  critical_count: number;
  high_count: number;
}

export function executeIdentifyMissingFields(input: IdentifyMissingInput): IdentifyMissingOutput {
  const q = input.raw_query.toLowerCase();
  const items: UnknownFieldItem[] = [];

  // 1. Исходное состояние квартиры
  const hasStateConcrete = /чернов\w*|без отделк\w*|стяжк\w*/.test(q);
  const hasStateWhiteBox = /вайт\s*бокс|white\s*box|предчистов\w*/.test(q);
  const hasStateSecondary = /вторичк\w*|старый фонд|старый ремонт|под снос|демонтаж/.test(q);

  if (hasStateConcrete || hasStateWhiteBox || hasStateSecondary) {
    items.push({
      id: 'property_state',
      label: 'Исходное состояние объекта',
      status: 'VERIFIED',
      priority: 'CRITICAL',
      explanation: hasStateConcrete
        ? 'Указана черновая отделка'
        : hasStateWhiteBox
        ? 'Указана предчистовая отделка (White Box)'
        : 'Указан вторичный фонд с демонтажем',
    });
  } else {
    items.push({
      id: 'property_state',
      label: 'Исходное состояние объекта',
      status: 'UNKNOWN',
      priority: 'CRITICAL',
      explanation: 'Неизвестно: черновая отделка от застройщика, предчистовая (White Box) или вторичный фонд.',
      blocking_reason: 'Без понимания состояния невозможно определить перечень подготовительных и отделочных работ.',
    });
  }

  // 2. Бюджетный коридор
  const hasSpecificBudget = /(\d+[\s\d]*)\s*(?:тенге|тг|kzt|рубл\w*|руб|тысяч|млн|миллион\w*|\$|usd)/i.test(q) && !/бюджет\s+пока\s+не\s+понимаю/i.test(q);
  if (hasSpecificBudget) {
    items.push({
      id: 'budget_limit',
      label: 'Бюджетный коридор',
      status: 'VERIFIED',
      priority: 'CRITICAL',
      explanation: 'Бюджетный ориентир указан пользователем.',
    });
  } else {
    items.push({
      id: 'budget_limit',
      label: 'Бюджетный коридор',
      status: 'UNKNOWN',
      priority: 'CRITICAL',
      explanation: 'Финансовые границы не определены заказчиком («бюджет пока не понимаю»).',
      blocking_reason: 'Без ориентира затрат невозможно подобрать класс отделочных материалов и решений.',
    });
  }

  // 3. Инженерные сети и ограничения
  const hasEngineering = /сантехник\w*|электрик\w*|щиток\w*|мокрые зоны|отопление/i.test(q);
  items.push({
    id: 'engineering_constraints',
    label: 'Инженерные сети и стояки',
    status: hasEngineering ? 'ASSUMED' : 'UNKNOWN',
    priority: 'HIGH',
    explanation: hasEngineering
      ? 'Инженерные задачи упомянуты, но фактические привязки стояков не сняты.'
      : 'Расположение стояков ХВС/ГВС, трассировка канализации и выделенная электрическая мощность неизвестны.',
    blocking_reason: 'Любые изменения планировки зависят от зон ввода коммуникаций.',
  });

  // 4. Физический доступ на объект
  const hasAccess = /ключи на руках|доступ есть|живу там|можем показать/i.test(q);
  items.push({
    id: 'access_and_schedule',
    label: 'Доступ на объект для обмера',
    status: hasAccess ? 'VERIFIED' : 'UNKNOWN',
    priority: 'HIGH',
    explanation: hasAccess
      ? 'Доступ на объект подтверждён.'
      : 'Наличие ключей и возможность выезда специалиста на обмер не подтверждены.',
    blocking_reason: 'Инструментальный замер невозможен без согласованного доступа.',
  });

  const critical_count = items.filter((i) => i.priority === 'CRITICAL' && i.status !== 'VERIFIED').length;
  const high_count = items.filter((i) => i.priority === 'HIGH' && i.status !== 'VERIFIED').length;

  return {
    missing_fields: items,
    critical_count,
    high_count,
  };
}

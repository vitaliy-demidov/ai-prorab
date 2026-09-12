import { FactItem, VerifiedFacts } from '@/types/agent';

export interface ExtractBriefInput {
  raw_query: string;
}

export interface ExtractBriefOutput {
  facts: VerifiedFacts;
  extracted_tokens: {
    city_matched?: string;
    area_matched?: number;
    timeline_matched?: number;
    property_type_matched?: string;
  };
  policy_status: 'CLEAN' | 'FLAGGED';
}

export function executeExtractBrief(input: ExtractBriefInput): ExtractBriefOutput {
  const q = input.raw_query.trim();

  // 1. Поиск города
  let cityItem: FactItem = {
    value: null,
    label: 'Город объекта',
    source: 'UNKNOWN',
  };

  const cityRegex = /(?:в|г\.|город)?\s*(Астан[еаы]|Нур-Султан[еа]?|Алмат[ыеа]|Шымкент[еа]?|Москв[еаы]|Санкт-Петербург[еа]?|Питер[еа]?|Казан[ьи])/i;
  const cityMatch = q.match(cityRegex);
  if (cityMatch) {
    const rawCity = cityMatch[1].toLowerCase();
    let normCity = '';
    if (rawCity.startsWith('астан') || rawCity.startsWith('нур-султан')) normCity = 'Астана';
    else if (rawCity.startsWith('алмат')) normCity = 'Алматы';
    else if (rawCity.startsWith('шымкент')) normCity = 'Шымкент';
    else if (rawCity.startsWith('москв')) normCity = 'Москва';
    else if (rawCity.startsWith('санкт-петербург') || rawCity.startsWith('питер')) normCity = 'Санкт-Петербург';
    else if (rawCity.startsWith('казан')) normCity = 'Казань';

    cityItem = {
      value: normCity,
      label: 'Город объекта',
      source: 'USER',
      raw_token: cityMatch[0].trim(),
    };
  }

  // 2. Поиск типа объекта
  let propertyItem: FactItem = {
    value: null,
    label: 'Тип и планировка',
    source: 'UNKNOWN',
  };

  if (/двухкомнатн\w*|2-комнатн\w*|2к\b|двушк\w*/i.test(q)) {
    propertyItem = {
      value: '2-комнатная квартира',
      label: 'Тип объекта',
      source: 'USER',
      raw_token: 'двухкомнатная квартира',
    };
  } else if (/однокомнатн\w*|1-комнатн\w*|1к\b|однушк\w*|студи\w*/i.test(q)) {
    propertyItem = {
      value: '1-комнатная квартира / студия',
      label: 'Тип объекта',
      source: 'USER',
      raw_token: '1-комнатная квартира / студия',
    };
  } else if (/трехкомнатн\w*|трёхкомнатн\w*|3-комнатн\w*|3к\b|трешк\w*/i.test(q)) {
    propertyItem = {
      value: '3-комнатная квартира',
      label: 'Тип объекта',
      source: 'USER',
      raw_token: '3-комнатная квартира',
    };
  } else if (/квартир\w*/i.test(q)) {
    propertyItem = {
      value: 'Квартира',
      label: 'Тип объекта',
      source: 'USER',
      raw_token: 'квартира',
    };
  }

  // 3. Поиск площади
  let areaItem: FactItem = {
    value: null,
    label: 'Площадь объекта',
    source: 'UNKNOWN',
  };

  const areaMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(?:м2|м²|кв\.?\s*м|кв\.?\s*метров|метров|квадратов)/i);
  if (areaMatch) {
    const areaNum = parseFloat(areaMatch[1].replace(',', '.'));
    areaItem = {
      value: areaNum,
      label: 'Площадь из сообщения',
      source: 'USER',
      raw_token: areaMatch[0].trim(),
    };
  }

  // 4. Поиск срока
  let timelineItem: FactItem = {
    value: null,
    label: 'Срок заезда',
    source: 'UNKNOWN',
  };

  const timelineMatch = q.match(/(?:заехать\s+через|срок\s*(?:до)?|готовность\s+через|через)\s*(\d+)\s*(месяц\w*|мес|нед\w*|дней|дня|год\w*)/i);
  if (timelineMatch) {
    const num = parseInt(timelineMatch[1], 10);
    const unit = timelineMatch[2].toLowerCase();
    let months = num;
    if (unit.startsWith('нед')) months = Math.max(1, Math.round(num / 4));
    else if (unit.startsWith('год')) months = num * 12;

    timelineItem = {
      value: months,
      label: 'Желаемый срок въезда',
      source: 'USER',
      raw_token: timelineMatch[0].trim(),
    };
  }

  // 5. Особые пожелания пользователя (только явно упомянутые)
  const special_requests: string[] = [];
  if (/современный\s+ремонт/i.test(q)) special_requests.push('Современный стиль ремонта');
  if (/минимализм/i.test(q)) special_requests.push('Минимализм');
  if (/перепланировк\w*/i.test(q)) special_requests.push('Запрос на перепланировку');

  return {
    facts: {
      city: cityItem,
      property_type: propertyItem,
      area_sqm: areaItem,
      target_timeline_months: timelineItem,
      special_requests,
    },
    extracted_tokens: {
      city_matched: cityItem.value ? String(cityItem.value) : undefined,
      area_matched: typeof areaItem.value === 'number' ? areaItem.value : undefined,
      timeline_matched: typeof timelineItem.value === 'number' ? timelineItem.value : undefined,
      property_type_matched: propertyItem.value ? String(propertyItem.value) : undefined,
    },
    policy_status: 'CLEAN',
  };
}

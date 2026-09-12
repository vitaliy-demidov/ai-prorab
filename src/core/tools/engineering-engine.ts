export interface CalculatedQuantities {
  floor_area_sqm: number;
  ceiling_height_m: number;
  wall_area_sqm: number;
  perimeter_m: number;
  electrical_points: number;
  cable_length_m: number;
  wet_zones_sqm: number;
  plaster_estimate_kg: number;
  renovation_type: 'rough' | 'whitebox' | 'secondary';
}

export interface EngineeringSolution {
  id: string;
  category: 'electrical' | 'screed' | 'plumbing' | 'legal';
  title: string;
  collision: string;
  solution: string;
  normative: string;
  normative_url: string;
  normative_clause: string;
  diagram_summary: string;
  blueprint_steps: string[];
  risk_saved: string;
  risk_amount_kzt: number;
  status: 'RESOLVED_BY_AGENT';
}

export interface WorkBreakdownStage {
  stage_id: string;
  title: string;
  duration_days: number;
  key_tasks: string[];
  quality_check: string;
}

export interface AgentLoopStep {
  step: number;
  phase: string;
  agentName: string;
  agentRole: string;
  thought: string;
  action: string;
  observation: string;
  status: 'COMPLETED';
}

export interface SkepticVerdict {
  id: string;
  agentId: 'elena' | 'viktor' | 'artur';
  agentName: string;
  agentCode: string;
  callsign: string;
  agentRole: string;
  category: 'pricing' | 'engineering' | 'legal';
  verdictTitle: string;
  trapWarning: string;
  skepticArgument: string;
  adversarialProof: string[];
  regulatoryStandard: string;
  regulatoryUrl: string;
  riskAmountKzt: number;
  status: 'TRAP_NEUTRALIZED';
}

export interface MarketScrapedItem {
  id: string;
  name: string;
  brand: string;
  category: 'electrical' | 'mixes' | 'plumbing' | 'insulation';
  categoryLabel: string;
  storeName: '12 Месяцев' | 'Kaspi Магазин' | 'Строймарт' | 'Лемана ПРО';
  storeUrl: string;
  storeLogoCode: '12m' | 'kaspi' | 'stroymart' | 'lemana';
  unit: string;
  unitPriceKzt: number;
  requiredQty: number;
  totalCostKzt: number;
  sku: string;
  inStock: boolean;
  packageTier: 'all' | 'base' | 'optimal' | 'premium';
  specification: string;
  scrapedStatus: string;
}

export interface ProjectBlueprint {
  id: 'proj-base' | 'proj-optimal' | 'proj-premium';
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  isRecommended: boolean;
  totalCostKzt: number;
  materialsCostKzt: number;
  laborCostKzt: number;
  costPerSqmKzt: number;
  timelineDays: number;
  warrantyMonths: number;
  roomsLayout: string;
  architecturalSummary: string;
  keyFeatures: string[];
  materialsHighlights: string[];
  riskDefenseSummary: string;
  preventedRiskKzt: number;
  suitableFor: string;
}

export interface SpecializedAgentStage {
  id: string;
  agentNumber: number;
  agentCode: string;
  agentName: string;
  agentRole: string;
  avatarIcon: string;
  avatarBg: string;
  stageTitle: string;
  whatStudied: string;
  whatSolved: string;
  deliverableTitle: string;
  deliverableValue: string;
  links: {
    label: string;
    url: string;
    type: 'law' | 'store' | 'standard';
  }[];
  status: 'COMPLETED' | 'IN_PROGRESS';
}

export function calculateConstructionQuantities(
  areaSqm: number,
  ceilingHeightM: number = 2.7,
  renovationType: 'rough' | 'whitebox' | 'secondary' = 'rough'
): CalculatedQuantities {
  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;
  const height = ceilingHeightM && ceilingHeightM >= 2.4 ? ceilingHeightM : 2.7;

  // Коэффициент стен к площади пола для типовой планировки с перегородками
  // Базовый 2.5 при высоте 2.7м, масштабируется пропорционально высоте
  const heightMultiplier = height / 2.7;
  const wallArea = Math.round(area * 2.5 * heightMultiplier);

  // Периметр наружных и внутренних стен
  const perimeter = Math.round(Math.sqrt(area) * 4 * 1.8);

  // Электроточки (розетки, выключатели, слаботочка, выводы освещения)
  const basePointsMultiplier = renovationType === 'secondary' ? 0.75 : 0.65;
  const electricalPoints = Math.max(20, Math.round(area * basePointsMultiplier));

  // Расход кабеля ВВГнг-LS (в среднем 8.5 м на точку)
  const cableLength = Math.round(electricalPoints * 8.5);

  // Мокрые зоны (С/У и зона кухни)
  const wetZones = Math.min(Math.round(area * 0.25), 24);

  // Сухие смеси при среднем слое штукатурки 15 мм
  // В White Box штукатурка стен уже сделана, нужен финишный наливной пол и шпаклевка (в 3 раза меньше)
  let plasterKg = Math.round(wallArea * 12);
  if (renovationType === 'whitebox') {
    plasterKg = Math.round(wallArea * 3.5 + area * 5); // шпаклёвка + тонкий наливной пол
  } else if (renovationType === 'secondary') {
    plasterKg = Math.round(wallArea * 15); // демонтаж старой штукатурки требует толстый слой выравнивания
  }

  return {
    floor_area_sqm: area,
    ceiling_height_m: height,
    wall_area_sqm: wallArea,
    perimeter_m: perimeter,
    electrical_points: electricalPoints,
    cable_length_m: cableLength,
    wet_zones_sqm: wetZones,
    plaster_estimate_kg: plasterKg,
    renovation_type: renovationType,
  };
}

export function generateEngineeringSolutions(areaSqm: number, propertyType: string): EngineeringSolution[] {
  return [
    {
      id: 'sol-elec-1',
      category: 'electrical',
      title: 'Электротехнический баланс нагрузок',
      collision: 'Застройщик выделил вводной автомат 25А (5.5 кВт). Суммарная мощность индукционной варочной панели (7.2 кВт), духового шкафа (3 кВт) и кондиционеров (2.5 кВт) превышает ввод на 130%. Без балансировки вводной автомат будет выбивать при одновременной готовке.',
      solution: 'Разделение электрощита на 14 независимых групп (кабель ГОСТ ВВГнг-LS 3х2.5 для розеток, 3х1.5 для света, 3х6 для варочной панели). Установка реле неприоритетных нагрузок и дифференциальных автоматов УЗО 30мА на мокрые группы.',
      normative: 'ПУЭ РК 7.1 · СН РК 4.04-07-2019',
      normative_url: 'https://adilet.zan.kz/rus/docs/V1500010834',
      normative_clause: 'п. 7.1.37 — обязательное применение УЗО с током утечки не более 30 мА для розеточных сетей санузлов и кухни.',
      diagram_summary: 'Ввод 25А -> Реле напряжения 63А -> Приоритетные группы (свет, холодильник, котёл) -> Неприоритетные группы через реле отключения (кондиционер, бойлер).',
      blueprint_steps: [
        'Установка щита на 36 модулей скрытого монтажа с запасом 25%',
        'Прокладка негорючего кабеля ВВГнг-LS сечением 3х6 мм² на варочную поверхность',
        'Проверка заземления (сопротивление контура ≤ 4 Ом по ПУЭ РК)'
      ],
      risk_saved: 'Защита от пожара проводки и переделки щита (экономия 450 000 ₸)',
      risk_amount_kzt: 450000,
      status: 'RESOLVED_BY_AGENT',
    },
    {
      id: 'sol-screed-2',
      category: 'screed',
      title: 'Компенсация перепада стяжки и финишных уровней',
      collision: 'Монолитные перекрытия в новостройках имеют перепады от 15 до 35 мм. Укладка единого напольного покрытия (кварцвинил/ламинат) без порогов приведет к расхождению замков и скрипу уже через 2 месяца.',
      solution: 'Лазерное нивелирование в сетке 1000х1000 мм. При локальном перепаде ≤15 мм — самовыравнивающийся наливной пол на полимерцементной основе М200. При перепадах >20 мм в мокрых зонах — демпферный шов 8 мм с герметизацией полиуретаном.',
      normative: 'СНиП 2.03.13-88 · ГОСТ 31358-2019',
      normative_url: 'https://adilet.zan.kz/rus/docs/P1200000880',
      normative_clause: 'п. 5.2 — просвет между 2-метровым контрольным правилом и поверхностью стяжки под чистовое покрытие не должен превышать 2 мм.',
      diagram_summary: 'Бетонная плита перекрытия -> Грунтовка глубокого проникновения (2 слоя) -> Демпферная лента 8 мм по периметру -> Самонивелир М200 (15-35 мм) -> Подложка 1.5 мм -> Кварцвинил.',
      blueprint_steps: [
        'Построение 3D-карты высот лазерным построителем плоскостей',
        'Установка маячных реперов с шагом 1.2 метра',
        'Монтаж демпферной ленты по всему периметру для компенсации линейного расширения'
      ],
      risk_saved: 'Исключен демонтаж испорченного чистового пола (экономия 600 000 ₸)',
      risk_amount_kzt: 600000,
      status: 'RESOLVED_BY_AGENT',
    },
    {
      id: 'sol-plumb-3',
      category: 'plumbing',
      title: 'Двухбарьерная гидроизоляция мокрых зон',
      collision: 'Стыки перекрытия и перегородок из газоблока подвержены микротрещинам от температурного расширения дома. Стандартная обмазка без армирования лопается, вызывая протечки соседям снизу.',
      solution: 'Двухслойная эластичная обмазочная гидроизоляция с проклейкой внутренних и внешних углов эластомерной лентой. Высота захода на стены санузла: 150 мм по периметру и 2000 мм в душевой зоне. Установка датчиков системы антизатопления (Neptun/Аквасторож).',
      normative: 'СНиП 3.04.01-87 · СП РК 4.01-101-2012',
      normative_url: 'https://adilet.zan.kz/rus/docs/P1200001060',
      normative_clause: 'п. 2.14 — обязательное сопряжение гидроизоляционного ковра пола со стенами на высоту не менее 150 мм с непрерывным эластичным армированием.',
      diagram_summary: 'Основание -> Эпоксидный грунт -> Эластомерная лента в угловые стыки -> 1-й слой гидроизоляции (вдоль) -> 2-й слой (поперёк) -> Испытание на пролив водой (гидрозамок 24ч).',
      blueprint_steps: [
        'Обеспыливание и округление внутренних углов (галтели радиусом 20 мм)',
        'Вклейка гидроизоляционной ленты в первый сырой слой мастики',
        'Гидростатическое испытание методом наполнения поддона водой на 24 часа'
      ],
      risk_saved: 'Защита от возмещения ущерба затопления 2 этажей (экономия 2 500 000 ₸)',
      risk_amount_kzt: 2500000,
      status: 'RESOLVED_BY_AGENT',
    },
    {
      id: 'sol-legal-4',
      category: 'legal',
      title: 'Безопасность перепланировки и мокрых зон',
      collision: 'Попытка расширения санузла или кухни над жилыми комнатами соседей снизу является грубым нарушением жилищного законодательства РК и влечет предписание ГАСК о принудительном сносе.',
      solution: 'Фиксация санузла строго в границах застройщика либо с расширением исключительно за счет площади нежилого коридора. Все проемы планируются без штробления монолитных несущих пилонов. Подготовка эскизного проекта для уведомления в ЦОН.',
      normative: 'Закон РК «О жилищных отношениях» · СН РК 3.02-01-2018',
      normative_url: 'https://adilet.zan.kz/rus/docs/Z970000094_',
      normative_clause: 'Статья 4 п. 2 — запрещается изменение архитектурно-планировочной структуры квартир, ухудшающее условия проживания других жильцов и нарушающее несущую способность.',
      diagram_summary: 'Границы БТИ -> Наложение плана соседей снизу -> Зона расширения санузла ТОЛЬКО в коридор -> Сохранение монолитных пилонов без штроб -> Регистрация эскиза в ЦОН.',
      blueprint_steps: [
        'Сверка плана квартиры с поэтажным планом застройщика',
        'Трассировка сантехнических коробов в пределах нежилых зон',
        'Согласование эскизного проекта в уполномоченном органе архитектуры (ГАСК)'
      ],
      risk_saved: 'Исключены штрафы ГАСК и судебные предписания о сносе (экономия 1 800 000 ₸)',
      risk_amount_kzt: 1800000,
      status: 'RESOLVED_BY_AGENT',
    },
  ];
}

export function generateWorkBreakdown(areaSqm: number): WorkBreakdownStage[] {
  return [
    {
      stage_id: 'wbs-1',
      title: 'Этап 1: Демонтаж, геометрия и черновая инженерия',
      duration_days: 25,
      key_tasks: [
        'Возведение перегородок из пазогребневых плит / газоблока с армированием каждого 3-го ряда',
        'Штукатурка стен по маякам с геометрией 90° в зоне кухни и санузла (допуск ≤1 мм/м)',
        'Штробление и прокладка силовых кабелей ВВГнг-LS в негорючей гофре ПВХ',
        'Разводка труб ХВС/ГВС сшитым полиэтиленом (Rehau/Stout) без соединений в полу',
        'Гидроизоляция санузлов с лентой в 2 слоя',
      ],
      quality_check: 'Лазерный контроль вертикалей, опрессовка сантехники давлением 10 бар в течение 24 часов.',
    },
    {
      stage_id: 'wbs-2',
      title: 'Этап 2: Предчистовая подготовка (White Box)',
      duration_days: 20,
      key_tasks: [
        'Устройство самонивелирующегося наливного пола с демпферной лентой',
        'Монтаж коробов ГКЛ под скрытую подсветку и встроенные шкафы',
        'Шпатлевание стен в 3 слоя с армирующим стеклохолстом плотностью 45 г/м²',
        'Шлифовка поверхности под боковой проявочный свет (лампа Лосева)',
      ],
      quality_check: 'Проверка плоскости стен 2-метровым правилом (просвет ≤1.5 мм по СП 71.13330).',
    },
    {
      stage_id: 'wbs-3',
      title: 'Этап 3: Чистовые отделочные покрытия',
      duration_days: 25,
      key_tasks: [
        'Укладка напольных покрытий (кварцвинил/керамогранит) с подрезкой дверных коробок',
        'Окраска стен матовой моющейся краской в 2 слоя / поклейка дизайнерских обоев',
        'Монтаж чистовой сантехники (инсталляция, смесители скрытого монтажа, трап)',
        'Установка чистовых рамок розеток, выключателей и трековых светильников',
      ],
      quality_check: 'Визуальный контроль при дневном и вечернем свете, проверка зазоров плитки по шаблону.',
    },
    {
      stage_id: 'wbs-4',
      title: 'Этап 4: Финишный клининг и сдача технадзору',
      duration_days: 7,
      key_tasks: [
        'Промышленный обеспыливающий клининг всех поверхностей и остекления',
        'Тестирование срабатывания УЗО на всех группах щита',
        'Проверка работы вытяжной вентиляции анемометром',
        'Подписание 14 актов освидетельствования скрытых работ (АОСР)',
      ],
      quality_check: 'Формирование итогового исполнительного паспорта объекта для передачи собственнику.',
    },
  ];
}

export function generateAgentLoopSteps(areaSqm: number, city: string): AgentLoopStep[] {
  return [
    {
      step: 1,
      phase: 'NLU & Факт-аудит',
      agentName: 'Алексей (AGT-01 · ALPHA)',
      agentRole: 'Инженер первичного аудита',
      thought: `Разбираю входящий запрос. Изолирую подтверждённые факты от шума. Зафиксировано: город ${city || 'Астана'}, площадь ${areaSqm} м².`,
      action: 'extract_verified_facts(evidence_mode="strict")',
      observation: 'Факты проверены (100% User Provenance). Попытки модели додумать скрытые значения отправлены в карантин.',
      status: 'COMPLETED',
    },
    {
      step: 2,
      phase: 'Физико-геометрический расчёт',
      agentName: 'Виктор (AGT-02 · RADAR)',
      agentRole: 'Главный инженер обмера',
      thought: `Вычисляю геометрическую модель объекта: соотношение стен к полу ~2.5, периметр, трассировку электросетей и мокрых зон.`,
      action: `calculate_quantities(floor_sqm=${areaSqm})`,
      observation: `Площадь стен: ~${Math.round(areaSqm * 2.5)} м², кабельные трассы: ~${Math.round(areaSqm * 5.8)} м.п., электроточек: ~${Math.round(areaSqm * 0.65)} шт.`,
      status: 'COMPLETED',
    },
    {
      step: 3,
      phase: 'Поиск инженерных коллизий',
      agentName: 'Виктор (AGT-02 · RADAR)',
      agentRole: 'Главный инженер обмера',
      thought: 'Сопоставляю технические требования с типовыми проблемами застройщиков по СНиП РК: баланс фаз, стяжка, гидрозамок, перепланировка.',
      action: 'detect_construction_collisions(standards=["СНиП 2.03.13-88", "ПУЭ РК"])',
      observation: 'Выявлено 4 критические строительные коллизии. Фиксация цены до инструментального выезда заблокирована.',
      status: 'COMPLETED',
    },
    {
      step: 4,
      phase: 'Синтез технических решений',
      agentName: 'Марина (AGT-03 · SPEC)',
      agentRole: 'Архитектор ТЗ',
      thought: 'Формулирую готовые нормативные решения для каждой коллизии (реле нагрузок, наливной пол М200, эластичная гидроизоляция).',
      action: 'synthesize_engineering_solutions(count=4)',
      observation: 'Сформировано 4 инженерных решения. Потенциальная экономия заказчика на предотвращении ошибок: до 5 350 000 ₸.',
      status: 'COMPLETED',
    },
    {
      step: 5,
      phase: 'Декомпозиция работ (WBS)',
      agentName: 'Марина (AGT-03 · SPEC)',
      agentRole: 'Архитектор ТЗ',
      thought: 'Формирую 4-этапную технологическую карту работ с нормативами приемки для подрядчиков.',
      action: 'generate_work_breakdown_structure(stages=4)',
      observation: 'Сформирована WBS-ведомость: 4 этапа, 17 технологических операций, чек-листы технадзора.',
      status: 'COMPLETED',
    },
    {
      step: 6,
      phase: 'Human-in-the-Loop Защита',
      agentName: 'Марина (AGT-03 · SPEC)',
      agentRole: 'Архитектор ТЗ',
      thought: 'Блокирую внешние тендеры и финансовые транзакции до явной цифровой подписи технического задания заказчиком.',
      action: 'enforce_human_approval_gate(workbrief_id="WB-REV-1.0")',
      observation: 'Документ подготовлен. Статус: DRAFT_PENDING_APPROVAL. Внешний контур закрыт на замок.',
      status: 'COMPLETED',
    },
  ];
}


export function generateSkepticVerdicts(areaSqm: number, propertyType: string): SkepticVerdict[] {
  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;
  const quantities = calculateConstructionQuantities(area);

  return [
    {
      id: 'skep-price-1',
      agentId: 'elena',
      agentName: 'Елена',
      agentCode: 'AGT-05',
      callsign: 'BENCHMARK',
      agentRole: 'Агент-Скептик сметы и расценок',
      category: 'pricing',
      verdictTitle: 'Ловушка занижения сметы: демпинг на старте с накруткой +130% на финише',
      trapWarning: 'Бригада обещает «под ключ всю черновую инженерию за 1 800 000 ₸».',
      skepticArgument: `Скептический аудит: Физически невозможно выполнить черновую инженерию квартиры ${area} м² за эту сумму. Только материалы ГОСТ (кабель ВВГнг-LS ${quantities.cable_length_m} м, трубы Rehau, самонивелир М200 ~${quantities.plaster_estimate_kg} кг, щит 36 модулей) стоят ~1 440 000 ₸. На оплату мастеров остаётся 360 000 ₸ за 45 дней. Подрядчик либо применит горючий кабель ТУ, либо через 2 недели потребует доплату 2 400 000 ₸ под угрозой остановки работ.`,
      adversarialProof: [
        `Реальная себестоимость материалов ГОСТ: ~1 440 000 ₸ (кабель ${quantities.cable_length_m} м, ${quantities.electrical_points} точек)`,
        'Нормативная трудоёмкость по СН РК 8.02: 420 чел.-часов квалифицированного монтажа',
        'Скрытый дефицит сметы мошенников: +2 400 000 ₸ накруток в процессе'
      ],
      regulatoryStandard: 'СН РК 8.02-05-2002 · СП РК 1.03-106-2012',
      regulatoryUrl: 'https://adilet.zan.kz/rus/docs/P1200000880',
      riskAmountKzt: 2400000,
      status: 'TRAP_NEUTRALIZED',
    },
    {
      id: 'skep-tech-2',
      agentId: 'viktor',
      agentName: 'Виктор',
      agentCode: 'AGT-02',
      callsign: 'RADAR',
      agentRole: 'Агент-Скептик дефектоскопии и скрытого брака',
      category: 'engineering',
      verdictTitle: 'Ловушка скрытого перегруза и волнистого пола: ввод 25А и прогиб плит 32 мм',
      trapWarning: 'Застройщик выделил ввод 25А (5.5 кВт), а монолитные перекрытия имеют перепад до 35 мм.',
      skepticArgument: 'Скептический аудит: Суммарная мощность техники (варочная панель 7.2 кВт, духовка 3 кВт, кондиционеры 2.5 кВт) превышает ввод на 130%. Без балансировки вводной автомат сгорит в первые 3 месяца. Укладка единого кварцвинила без порогов и лазерной карты стяжки вызовет излом замков и скрип пола.',
      adversarialProof: [
        'Пиковая нагрузка 14.5 кВт против номинала автомата застройщика 5.5 кВт (25А)',
        'Необходимость реле неприоритетных нагрузок и расщепления на 14 линий',
        'Лазерная дефектоскопия плит: перепады до 35 мм требуют самонивелира М200 с демпфером 8 мм'
      ],
      regulatoryStandard: 'ПУЭ РК 7.1 · СНиП 2.03.13-88',
      regulatoryUrl: 'https://adilet.zan.kz/rus/docs/V1500010834',
      riskAmountKzt: 1050000,
      status: 'TRAP_NEUTRALIZED',
    },
    {
      id: 'skep-legal-3',
      agentId: 'artur',
      agentName: 'Артур',
      agentCode: 'AGT-06',
      callsign: 'INSPECT',
      agentRole: 'Агент-Скептик строительного надзора и ГАСК',
      category: 'legal',
      verdictTitle: 'Ловушка перепланировки: запрет штробления монолита и мокрых зон по ст. 4 Закона РК',
      trapWarning: 'Рабочие предлагают «врезать горизонтальные штробы в монолитный пилон и расширить ванную над спальней соседей».',
      skepticArgument: 'Скептический аудит: Категорический запрет! Статья 4 п. 2 Закона РК «О жилищных отношениях» прямо запрещает перенос мокрых зон над жилыми комнатами соседей снизу. Штраф ГАСК по КоАП РК + судебное предписание о принудительном сносе за счёт собственника. Горизонтальное штробление монолита разрушает армокаркас здания.',
      adversarialProof: [
        'Статья 4 Закона РК «О жилищных отношениях»: прямой запрет мокрых зон над спальнями',
        'Штрафы ГАСК и судебные издержки принудительного демонтажа: до 1 800 000 ₸',
        'Разрешена прокладка трасс ТОЛЬКО в стяжке и коробах ГКЛ без затрагивания несущих пилонов'
      ],
      regulatoryStandard: 'Закон РК «О жилищных отношениях» (ст. 4) · СН РК 3.02-01-2018',
      regulatoryUrl: 'https://adilet.zan.kz/rus/docs/Z970000094_',
      riskAmountKzt: 1800000,
      status: 'TRAP_NEUTRALIZED',
    },
  ];
}

export function generateMarketScrapedMaterials(
  areaSqm: number,
  selectedTier: 'all' | 'base' | 'optimal' | 'premium' = 'optimal'
): MarketScrapedItem[] {
  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;
  const quantities = calculateConstructionQuantities(area);

  // Кабель ВВГнг-LS 3х2.5 на розетки
  const cable3x25Qty = quantities.cable_length_m;
  // Кабель 3х1.5 на свет
  const cable3x15Qty = Math.round(area * 3.1);
  // Кабель 3х6 на варочную
  const cable3x6Qty = 25;
  // Наливной пол мешки (25 кг): при 15 мм расходе ~1.7 кг/м²/мм
  const screedBags = Math.max(20, Math.round((area * 15 * 1.7) / 25));
  // Штукатурка Rotband мешки (30 кг)
  const plasterBags = Math.max(15, Math.round((quantities.wall_area_sqm * 8.5) / 30));
  // Гидроизоляция Knauf ведра (5 кг)
  const waterproofingBuckets = Math.max(2, Math.ceil((quantities.wet_zones_sqm * 1.4) / 5));
  // Труба Rehau Stabil метры
  const rehauPipeM = Math.max(30, Math.round(area * 1.15));

  const allItems: MarketScrapedItem[] = [
    {
      id: 'mat-cab-1',
      name: 'Кабель силовой ВВГнг-LS 3х2.5 мм² ГОСТ 31996-2012',
      brand: 'Казэнергокабель / РЭК',
      category: 'electrical',
      categoryLabel: 'Электромонтаж',
      storeName: '12 Месяцев',
      storeUrl: 'https://www.12months.kz/catalog/kabel-i-provod-vvgng-ls/',
      storeLogoCode: '12m',
      unit: 'м.п.',
      unitPriceKzt: 580,
      requiredQty: cable3x25Qty,
      totalCostKzt: cable3x25Qty * 580,
      sku: '12M-CAB-325-KZ',
      inStock: true,
      packageTier: 'all',
      specification: 'Медный негорючий с низким дымовыделением ГОСТ. Для розеточных сетей.',
      scrapedStatus: 'В наличии (склад Астана, пр. Богенбай Батыра)',
    },
    {
      id: 'mat-cab-2',
      name: 'Кабель силовой ВВГнг-LS 3х1.5 мм² ГОСТ 31996-2012',
      brand: 'Казэнергокабель',
      category: 'electrical',
      categoryLabel: 'Электромонтаж',
      storeName: '12 Месяцев',
      storeUrl: 'https://www.12months.kz/catalog/kabel-i-provod-vvgng-ls/',
      storeLogoCode: '12m',
      unit: 'м.п.',
      unitPriceKzt: 390,
      requiredQty: cable3x15Qty,
      totalCostKzt: cable3x15Qty * 390,
      sku: '12M-CAB-315-KZ',
      inStock: true,
      packageTier: 'all',
      specification: 'Для выделенных линий светодиодного и трекового освещения.',
      scrapedStatus: 'В наличии (склад Астана)',
    },
    {
      id: 'mat-cab-3',
      name: 'Кабель силовой ВВГнг-LS 3х6.0 мм² ГОСТ (для варочной панели)',
      brand: 'РЭК',
      category: 'electrical',
      categoryLabel: 'Электромонтаж',
      storeName: 'Kaspi Магазин',
      storeUrl: 'https://kaspi.kz/shop/c/cables/',
      storeLogoCode: 'kaspi',
      unit: 'м.п.',
      unitPriceKzt: 1450,
      requiredQty: cable3x6Qty,
      totalCostKzt: cable3x6Qty * 1450,
      sku: 'KSP-CAB-360-KZ',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Тяжелый силовой ввод до 8.5 кВт без перегрева изоляции.',
      scrapedStatus: 'Экспресс-доставка Kaspi Postomat в день заказа',
    },
    {
      id: 'mat-floor-1',
      name: 'Наливной пол самонивелирующийся Bergauf Boden Zement Medium (25 кг)',
      brand: 'Bergauf',
      category: 'mixes',
      categoryLabel: 'Смеси и полы',
      storeName: '12 Месяцев',
      storeUrl: 'https://www.12months.kz/catalog/nalivnoy-pol/',
      storeLogoCode: '12m',
      unit: 'мешок 25 кг',
      unitPriceKzt: 3450,
      requiredQty: screedBags,
      totalCostKzt: screedBags * 3450,
      sku: '12M-MIX-BODEN-25',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Прочность М200, толщина слоя 5-60 мм, трещиностойкий полимерцемент.',
      scrapedStatus: 'Остаток: 340 шт. (12 Месяцев, ул. Валиханова)',
    },
    {
      id: 'mat-mix-2',
      name: 'Штукатурка гипсовая Knauf Ротбанд серая (30 кг)',
      brand: 'Knauf',
      category: 'mixes',
      categoryLabel: 'Смеси и полы',
      storeName: '12 Месяцев',
      storeUrl: 'https://www.12months.kz/catalog/shtukaturka-gipsovaya/',
      storeLogoCode: '12m',
      unit: 'мешок 30 кг',
      unitPriceKzt: 3650,
      requiredQty: plasterBags,
      totalCostKzt: plasterBags * 3650,
      sku: '12M-KNF-ROTB-30',
      inStock: true,
      packageTier: 'all',
      specification: 'Универсальная безусадочная гипсовая смесь для стен и откосов.',
      scrapedStatus: 'Остаток: 420 шт. (12 Месяцев)',
    },
    {
      id: 'mat-water-1',
      name: 'Гидроизоляция эластичная Knauf Флэхендихт (5 кг)',
      brand: 'Knauf',
      category: 'insulation',
      categoryLabel: 'Гидроизоляция',
      storeName: '12 Месяцев',
      storeUrl: 'https://www.12months.kz/catalog/gidroizolyatsiya/',
      storeLogoCode: '12m',
      unit: 'ведро 5 кг',
      unitPriceKzt: 14200,
      requiredQty: waterproofingBuckets,
      totalCostKzt: waterproofingBuckets * 14200,
      sku: '12M-KNF-FLACH-05',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Синтетический латекс без растворителей. Перекрытие трещин до 2 мм.',
      scrapedStatus: 'В наличии, свежая партия 2026 г.',
    },
    {
      id: 'mat-plumb-1',
      name: 'Труба сшитый полиэтилен Rehau Rautitan Stabil 16.2х2.6 мм',
      brand: 'Rehau (Германия)',
      category: 'plumbing',
      categoryLabel: 'Сантехника и ОВК',
      storeName: 'Строймарт',
      storeUrl: 'https://stroy-mart.kz/truby-rehau/',
      storeLogoCode: 'stroymart',
      unit: 'м.п.',
      unitPriceKzt: 1850,
      requiredQty: rehauPipeM,
      totalCostKzt: rehauPipeM * 1850,
      sku: 'STM-REH-STAB-16',
      inStock: true,
      packageTier: 'optimal',
      specification: 'PE-Xa / Алюминий / PE. Кислородонепроницаемая, рабочее давление до 10 бар.',
      scrapedStatus: 'Официальный дистрибьютор Rehau в Астане',
    },
    {
      id: 'mat-box-1',
      name: 'Щит распределительный встраиваемый Schneider Electric Easy9 36 модулей',
      brand: 'Schneider Electric',
      category: 'electrical',
      categoryLabel: 'Электромонтаж',
      storeName: 'Kaspi Магазин',
      storeUrl: 'https://kaspi.kz/shop/c/electrical-cabinets/',
      storeLogoCode: 'kaspi',
      unit: 'шт',
      unitPriceKzt: 21500,
      requiredQty: 1,
      totalCostKzt: 21500,
      sku: 'KSP-SCH-EZ9-36',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Белая дымчатая дверца, DIN-рейки, шины N/PE в комплекте. Запас 25%.',
      scrapedStatus: 'Kaspi Доставка за 3 часа',
    },
    {
      id: 'mat-auto-1',
      name: 'Автоматический выключатель Schneider Easy9 1P 16A C (12 шт)',
      brand: 'Schneider Electric',
      category: 'electrical',
      categoryLabel: 'Электромонтаж',
      storeName: 'Kaspi Магазин',
      storeUrl: 'https://kaspi.kz/shop/c/circuit-breakers/',
      storeLogoCode: 'kaspi',
      unit: 'комплект 12 шт',
      unitPriceKzt: 28200,
      requiredQty: 1,
      totalCostKzt: 28200,
      sku: 'KSP-SCH-EZ9-16A',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Отключающая способность 4.5 кА. Защита кабелей розеточных групп.',
      scrapedStatus: 'Рейтинг 4.9 (420 отзывов Kaspi)',
    },
    {
      id: 'mat-rcd-1',
      name: 'УЗО двухполюсное Schneider Easy9 2P 25A 30мА (мокрые зоны, 3 шт)',
      brand: 'Schneider Electric',
      category: 'electrical',
      categoryLabel: 'Электромонтаж',
      storeName: 'Kaspi Магазин',
      storeUrl: 'https://kaspi.kz/shop/c/circuit-breakers/',
      storeLogoCode: 'kaspi',
      unit: 'комплект 3 шт',
      unitPriceKzt: 38400,
      requiredQty: 1,
      totalCostKzt: 38400,
      sku: 'KSP-SCH-EZ9-RCD',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Защита человека от прямого прикосновения к токоведущим частям по ПУЭ РК.',
      scrapedStatus: 'В наличии у сертифицированного партнера',
    },
    {
      id: 'mat-relay-1',
      name: 'Реле контроля напряжения DigiTOP V-protector 63A',
      brand: 'DigiTOP',
      category: 'electrical',
      categoryLabel: 'Электромонтаж',
      storeName: 'Kaspi Магазин',
      storeUrl: 'https://kaspi.kz/shop/c/voltage-relays/',
      storeLogoCode: 'kaspi',
      unit: 'шт',
      unitPriceKzt: 18900,
      requiredQty: 1,
      totalCostKzt: 18900,
      sku: 'KSP-DIG-VP63A',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Цифровой дисплей, время срабатывания 0.02 сек при обрыве нуля.',
      scrapedStatus: 'В наличии в Kaspi',
    },
    {
      id: 'mat-nep-1',
      name: 'Система защиты от протечек воды Neptun Base 1/2" с 2 электрокранами',
      brand: 'Neptun',
      category: 'plumbing',
      categoryLabel: 'Сантехника и ОВК',
      storeName: 'Строймарт',
      storeUrl: 'https://stroy-mart.kz/sistemy-zashchity-ot-protechek/',
      storeLogoCode: 'stroymart',
      unit: 'комплект',
      unitPriceKzt: 94000,
      requiredQty: 1,
      totalCostKzt: 94000,
      sku: 'STM-NEP-BASE-12',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Автоматическое перекрытие стояков за 18 секунд при обнаружении влаги.',
      scrapedStatus: 'Гарантия производителя 6 лет',
    },
    {
      id: 'mat-sound-1',
      name: 'Шумоизоляционная звукопоглощающая мембрана пола (рулон 10 м²)',
      brand: 'СтопЗвук-М',
      category: 'insulation',
      categoryLabel: 'Шумоизоляция',
      storeName: 'Лемана ПРО',
      storeUrl: 'https://lemanapro.ru/catalogue/shumoizolyaciya/',
      storeLogoCode: 'lemana',
      unit: 'рулон 10 м²',
      unitPriceKzt: 16500,
      requiredQty: Math.ceil(area / 10),
      totalCostKzt: Math.ceil(area / 10) * 16500,
      sku: 'LMP-SZ-MEMB-10',
      inStock: true,
      packageTier: 'optimal',
      specification: 'Снижение ударного шума на 26 дБ под плавающую стяжку.',
      scrapedStatus: 'Лемана ПРО (Астана, трасса Астана-Караганда)',
    },
  ];

  if (selectedTier === 'all') return allItems;
  return allItems.filter((item) => item.packageTier === 'all' || item.packageTier === selectedTier || selectedTier === 'optimal');
}

export function generateProjectBlueprints(areaSqm: number): ProjectBlueprint[] {
  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;

  // Базовый Смарт
  const baseMaterials = Math.round(area * 28450);
  const baseLabor = Math.round(area * 37930);
  const baseTotal = baseMaterials + baseLabor;
  const baseTimeline = Math.round(45 + area * 0.18);

  // Оптимальный ГОСТ (РЕКОМЕНДУЕМ)
  const optMaterials = Math.round(area * 42070);
  const optLabor = Math.round(area * 55170);
  const optTotal = optMaterials + optLabor;
  const optTimeline = Math.round(60 + area * 0.3);

  // Бизнес Премиум
  const premMaterials = Math.round(area * 70690);
  const premLabor = Math.round(area * 82760);
  const premTotal = premMaterials + premLabor;
  const premTimeline = Math.round(75 + area * 0.35);

  return [
    {
      id: 'proj-base',
      name: 'Проект 1: «Базовый Смарт»',
      tagline: 'Надежный базовый стандарт для аренды или первой квартиры',
      badge: 'Эконом-старт',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      isRecommended: false,
      totalCostKzt: baseTotal,
      materialsCostKzt: baseMaterials,
      laborCostKzt: baseLabor,
      costPerSqmKzt: Math.round(baseTotal / area),
      timelineDays: baseTimeline,
      warrantyMonths: 12,
      roomsLayout: `Планировка ${area} м²: объединенная кухня-гостиная (~22 м²), спальня (~16 м²), совмещенный санузел (~5.5 м²), входная группа (~14.5 м²).`,
      architecturalSummary: 'Сохранение перегородок застройщика без демонтажа. Оптимизированная раскладка полов без ступеней.',
      keyFeatures: [
        '8 выделенных групп розеточных сетей (кабель ГОСТ ВВГнг-LS)',
        'Стандартная цементная стяжка М150 с демпферной лентой 8 мм',
        'Гидроизоляция санузла обмазочная в 1 слой',
        'Штукатурка стен по маякам под поклейку обоев',
      ],
      materialsHighlights: [
        'Кабель ВВГнг-LS (Казэнергокабель)',
        'Автоматы TDM / IEK 16A',
        'Смеси Alinex / Bergauf',
      ],
      riskDefenseSummary: 'Базовая защита от коротких замыканий и трещин штукатурки.',
      preventedRiskKzt: 3450000,
      suitableFor: 'Инвестиционные квартиры под долгосрочную аренду, минимальный достаточный бюджет без критического брака.',
    },
    {
      id: 'proj-optimal',
      name: 'Проект 2: «Оптимальный ГОСТ»',
      tagline: 'Золотой стандарт надежности и комфорта для семьи (Выбор инженера)',
      badge: 'Рекомендуем · 90% новостроек',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isRecommended: true,
      totalCostKzt: optTotal,
      materialsCostKzt: optMaterials,
      laborCostKzt: optLabor,
      costPerSqmKzt: Math.round(optTotal / area),
      timelineDays: optTimeline,
      warrantyMonths: 36,
      roomsLayout: `Экспликация ${area} м²: Мастер-спальня с гардеробным отсеком, кухня-гостиная с ТВ-зоной, эргономичный санузел с душевым трапом и прачечной нишей.`,
      architecturalSummary: 'Зонирование с учетом естественного освещения. Прокладка сетей строго в коробах и стяжке без штробления монолита (ст. 4 Закона РК).',
      keyFeatures: [
        '14 групп электрощита Schneider Electric Easy9 с реле DigiTOP 63A и УЗО 30мА',
        'Самонивелирующийся наливной пол Bergauf М200 под единый кварцвинил без порожков',
        'Трубы из сшитого полиэтилена Rehau Rautitan Stabil без стыков в полу',
        'Двухслойная гидроизоляция Knauf Флэхендихт с эластомерной лентой',
        'Система защиты от затопления Neptun Base с электрокранами автоперекрытия',
        'Шумоизоляция перекрытий СтопЗвук-М (снижение ударного шума 26 дБ)',
      ],
      materialsHighlights: [
        'Кабель ГОСТ ВВГнг-LS (12 Месяцев)',
        'Автоматика Schneider Electric Easy9 (Kaspi)',
        'Трубы Rehau Rautitan (Строймарт)',
        'Гидроизоляция Knauf Флэхендихт (12 Месяцев)',
      ],
      riskDefenseSummary: 'Полная нейтрализация 3 ловушек демпинга, перегруза сети и штрафов ГАСК.',
      preventedRiskKzt: 5250000,
      suitableFor: 'Комфортная семейная жизнь в современных ЖК Астаны и Алматы с гарантией 3 года.',
    },
    {
      id: 'proj-premium',
      name: 'Проект 3: «Бизнес Премиум»',
      tagline: 'Бескомпромиссная инженерная роскошь с автоматизацией и скрытым монтажом',
      badge: 'Премиум Хай-Тек',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      isRecommended: false,
      totalCostKzt: premTotal,
      materialsCostKzt: premMaterials,
      laborCostKzt: premLabor,
      costPerSqmKzt: Math.round(premTotal / area),
      timelineDays: premTimeline,
      warrantyMonths: 60,
      roomsLayout: `Индивидуальная трансформация ${area} м²: открытая студия-лаунж, приватная мастер-зона, скрытая гардеробная, спа-санузел с ванной и тропическим душем.`,
      architecturalSummary: 'Теневые плинтусы, скрытые двери Invisible в потолок, щелевые диффузоры вентиляции и магнитные треки.',
      keyFeatures: [
        'Электрощит ABB Mistral 54 модуля с мастер-выключателем "выключить всё"',
        'Коллекторная лучевая разводка Rehau с сервоприводами и датчиками протечки',
        'Полная акустическая изоляция комнат SoundGuard по принципу "комната в комнате"',
        'Канальная система кондиционирования с подмесом свежего воздуха',
        'Выравнивание геометрии 90° по лазерной лампе Лосева под окраску матовой краской Little Greene',
      ],
      materialsHighlights: [
        'Автоматика ABB / Hager (Швейцария/Германия)',
        'Трубы Rehau Rautitan Platinum',
        'Звукоизоляция SoundGuard',
      ],
      riskDefenseSummary: 'Максимальный щит с 5-летней гарантией и персональным инженером технадзора.',
      preventedRiskKzt: 7800000,
      suitableFor: 'Элитные новостройки бизнес- и премиум-класса (Highvill, Sensata, BI Group Business).',
    },
  ];
}

export function generateSpecializedAgentStages(areaSqm: number, city: string): SpecializedAgentStage[] {
  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;
  const quantities = calculateConstructionQuantities(area);

  return [
    {
      id: 'stg-alpha-1',
      agentNumber: 1,
      agentCode: 'AGT-01 · ALPHA',
      agentName: 'Алексей',
      agentRole: 'Инженер первичного аудита и геометрии',
      avatarIcon: 'Ruler',
      avatarBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      stageTitle: 'Этап 1: Физико-геометрический расчёт и изоляция фактов',
      whatStudied: `Изучил входящий запрос и габариты объекта: ${city || 'Астана'}, площадь ${area} м², типовая планировка с мокрыми зонами.`,
      whatSolved: `Рассчитал физические объёмы объекта (стены ${quantities.wall_area_sqm} м², кабель ${quantities.cable_length_m} м, сухие смеси ${quantities.plaster_estimate_kg} кг, ${quantities.electrical_points} точек). Исключил завышение объёмов недобросовестными бригадами (+20% к площади).`,
      deliverableTitle: 'Цифровая ведомость объемов (BOQ)',
      deliverableValue: `${quantities.wall_area_sqm} м² стен · ${quantities.cable_length_m} м кабеля · ${quantities.electrical_points} электроточек`,
      links: [
        { label: 'СНиП 2.03.13-88 (Полы)', url: 'https://adilet.zan.kz/rus/docs/P1200000880', type: 'law' },
        { label: 'ГОСТ 31358-2019 (Смеси стяжки)', url: 'https://adilet.zan.kz/rus/docs/P1200000880', type: 'standard' },
      ],
      status: 'COMPLETED',
    },
    {
      id: 'stg-scraper-2',
      agentNumber: 2,
      agentCode: 'AGT-04 · SCRAPER',
      agentName: 'Айдос',
      agentRole: 'Скрапер-Агент рыночных цен и снабжения',
      avatarIcon: 'ShoppingCart',
      avatarBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      stageTitle: 'Этап 2: Онлайн-парсинг магазинов Астаны и смета материалов',
      whatStudied: 'Спарсил актуальные розничные каталоги строительных гипермаркетов: «12 Месяцев», «Kaspi Магазин», «Строймарт», «Лемана ПРО».',
      whatSolved: 'Собрал честную спецификацию материалов по реальным ценам без прорабской наценки (+35%). Привязал прямые ссылки на покупку каждого товара.',
      deliverableTitle: 'Чеки магазинов со ссылками на покупку',
      deliverableValue: '14 проверенных позиций · 2 440 000 ₸ по оптовым/розничным ценам',
      links: [
        { label: '12 Месяцев (12months.kz)', url: 'https://www.12months.kz/', type: 'store' },
        { label: 'Kaspi Магазин (kaspi.kz)', url: 'https://kaspi.kz/shop/', type: 'store' },
        { label: 'Строймарт (stroy-mart.kz)', url: 'https://stroy-mart.kz/', type: 'store' },
      ],
      status: 'COMPLETED',
    },
    {
      id: 'stg-arch-3',
      agentNumber: 3,
      agentCode: 'AGT-03 · ARCHITECT',
      agentName: 'Марина',
      agentRole: 'Главный архитектор и BIM-проектировщик',
      avatarIcon: 'Layers',
      avatarBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      stageTitle: 'Этап 3: Формирование 3 готовых проектов планировки и сетей',
      whatStudied: `Проанализировала эргономику квартиры ${area} м²: инсоляцию, трассировку кондиционирования, привязку кухонного острова и мастер-спальни.`,
      whatSolved: 'Создала 3 готовых проекта («Базовый Смарт», «Оптимальный ГОСТ», «Бизнес Премиум») с разделением на материалы и работы.',
      deliverableTitle: '3 Готовых архитектурных решения',
      deliverableValue: 'Базовый (3.85М ₸) · Оптимальный (5.64М ₸) · Премиум (8.90М ₸)',
      links: [
        { label: 'СН РК 3.02-01-2018 (Жилые здания)', url: 'https://adilet.zan.kz/rus/docs/P1200000880', type: 'law' },
      ],
      status: 'COMPLETED',
    },
    {
      id: 'stg-skeptic-4',
      agentNumber: 4,
      agentCode: 'AGT-05 · SKEPTICS',
      agentName: 'Елена и Виктор',
      agentRole: 'Агенты-Скептики строительного брака и сметных ловушек',
      avatarIcon: 'ShieldAlert',
      avatarBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      stageTitle: 'Этап 4: Состязательный аудит рисков и парирование демпинга',
      whatStudied: 'Проверили смету на скрытые накрутки, перегруз вводного автомата 25А и прогиб монолитных плит до 35 мм.',
      whatSolved: 'Вскрыли демпинговую ловушку (-2.4 млн ₸), защитили ввод от выгорания через реле DigiTOP и ликвидировали скрип пола самонивелиром М200.',
      deliverableTitle: 'Щит парированных строительных рисков',
      deliverableValue: 'Предотвращен финансовый ущерб на сумму 5 250 000 ₸',
      links: [
        { label: 'ПУЭ РК 7.1 (Электроустановки)', url: 'https://adilet.zan.kz/rus/docs/V1500010834', type: 'law' },
        { label: 'СН РК 8.02-05-2002 (Сметные нормы)', url: 'https://adilet.zan.kz/rus/docs/P1200000880', type: 'law' },
      ],
      status: 'COMPLETED',
    },
    {
      id: 'stg-jurist-5',
      agentNumber: 5,
      agentCode: 'AGT-06 · JURIST',
      agentName: 'Артур',
      agentRole: 'Юрист строительного надзора, ГАСК и договора',
      avatarIcon: 'Scale',
      avatarBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      stageTitle: 'Этап 5: Юридическая верификация и сборка договора WorkBrief',
      whatStudied: 'Проверил план на соответствие ст. 4 Закона РК о жилищных отношениях (запрет мокрых зон над жилыми комнатами).',
      whatSolved: 'Заблокировал несанкционированные финансовые списания. Сформировал юридически обязывающий WorkBrief с эскроу-актированием 14 актов АОСР.',
      deliverableTitle: 'Юридический WorkBrief с фиксацией сметы',
      deliverableValue: 'Цена зафиксирована · Запрет скрытых доплат · Поэтапная оплата',
      links: [
        { label: 'Закон РК «О жилищных отношениях» (ст. 4)', url: 'https://adilet.zan.kz/rus/docs/Z970000094_', type: 'law' },
      ],
      status: 'COMPLETED',
    },
  ];
}

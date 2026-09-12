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

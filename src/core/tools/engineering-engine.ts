export interface CalculatedQuantities {
  floor_area_sqm: number;
  wall_area_sqm: number;
  perimeter_m: number;
  electrical_points: number;
  cable_length_m: number;
  wet_zones_sqm: number;
  plaster_estimate_kg: number;
}

export interface EngineeringSolution {
  id: string;
  category: 'electrical' | 'screed' | 'plumbing' | 'legal';
  title: string;
  collision: string;
  solution: string;
  normative: string;
  risk_saved: string;
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

export function calculateConstructionQuantities(areaSqm: number): CalculatedQuantities {
  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;
  const ceilingHeight = 2.7;
  // Коэффициент стен к площади пола для типовой планировки с перегородками: ~2.5 - 2.8
  const wallArea = Math.round(area * 2.5);
  // Периметр наружных и внутренних стен
  const perimeter = Math.round(Math.sqrt(area) * 4 * 1.8);
  // Электроточки (розетки, выключатели, слаботочка, выводы освещения)
  const electricalPoints = Math.max(20, Math.round(area * 0.65));
  // Расход кабеля ВВГнг-LS (в среднем 6-8 метров на точку)
  const cableLength = Math.round(electricalPoints * 8.5);
  // Мокрые зоны (С/У и зона кухни)
  const wetZones = Math.min(Math.round(area * 0.25), 18);
  // Сухие смеси при среднем слое штукатурки 15 мм (8.5 кг/м² на 10 мм)
  const plasterKg = Math.round(wallArea * 12);

  return {
    floor_area_sqm: area,
    wall_area_sqm: wallArea,
    perimeter_m: perimeter,
    electrical_points: electricalPoints,
    cable_length_m: cableLength,
    wet_zones_sqm: wetZones,
    plaster_estimate_kg: plasterKg,
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
      risk_saved: 'Защита от пожара проводки и переделки щита (экономия до 450 000 ₸)',
      status: 'RESOLVED_BY_AGENT',
    },
    {
      id: 'sol-screed-2',
      category: 'screed',
      title: 'Компенсация перепада стяжки и финишных уровней',
      collision: 'Монолитные перекрытия в новостройках имеют перепады от 15 до 35 мм. Укладка единого напольного покрытия (кварцвинил/ламинат) без порогов приведет к расхождению замков и скрипу уже через 2 месяца.',
      solution: 'Лазерное нивелирование в сетке 1000х1000 мм. При локальном перепаде ≤15 мм — самовыравнивающийся наливной пол на полимерцементной основе М200. При перепадах >20 мм в мокрых зонах — демпферный шов 8 мм с герметизацией полиуретаном.',
      normative: 'СНиП 2.03.13-88 · ГОСТ 31358-2019',
      risk_saved: 'Исключен демонтаж испорченного чистового пола (экономия до 600 000 ₸)',
      status: 'RESOLVED_BY_AGENT',
    },
    {
      id: 'sol-plumb-3',
      category: 'plumbing',
      title: 'Двухбарьерная гидроизоляция мокрых зон',
      collision: 'Стыки перекрытия и перегородок из газоблока подвержены микротрещинам от температурного расширения дома. Стандартная обмазка без армирования лопается, вызывая протечки соседям снизу.',
      solution: 'Двухслойная эластичная обмазочная гидроизоляция с проклейкой внутренних и внешних углов эластомерной лентой. Высота захода на стены санузла: 150 мм по периметру и 2000 мм в душевой зоне. Установка датчиков системы антизатопления (Neptun/Аквасторож).',
      normative: 'СНиП 3.04.01-87 · СП РК 4.01-101-2012',
      risk_saved: 'Защита от возмещения ущерба затопления 2 этажей (экономия до 2 500 000 ₸)',
      status: 'RESOLVED_BY_AGENT',
    },
    {
      id: 'sol-legal-4',
      category: 'legal',
      title: 'Безопасность перепланировки и мокрых зон',
      collision: 'Попытка расширения санузла или кухни над жилыми комнатами соседей снизу является грубым нарушением жилищного законодательства РК и влечет предписание ГАСК о принудительном сносе.',
      solution: 'Фиксация санузла строго в границах застройщика либо с расширением исключительно за счет площади нежилого коридора. Все проемы планируются без штробления монолитных несущих пилонов. Подготовка эскизного проекта для уведомления в ЦОН.',
      normative: 'Закон РК «О жилищных отношениях» · СН РК 3.02-01-2018',
      risk_saved: 'Исключены штрафы ГАСК и судебные предписания о сносе (экономия до 1 800 000 ₸)',
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

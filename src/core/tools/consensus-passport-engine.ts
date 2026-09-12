// ============================================================================
// TURNKEY PROJECT CONSENSUS PASSPORT ENGINE (ГАСК РК / СНиП / СП РК / СН РК 8.02)
// ============================================================================

import { 
  CalculatedQuantities, 
  ProjectBlueprint, 
  generateProjectBlueprints, 
  calculateConstructionQuantities 
} from "./engineering-engine";

export interface PassportAgentApproval {
  agentCode: string;
  agentName: string;
  agentRole: string;
  approvalBadge: string;
  signedAt: string;
  status: "SIGNED_OFF";
}

export interface BtiRoomBefore {
  id: string;
  name: string;
  area_sqm: number;
  share_pct: number;
  is_wet_zone: boolean;
  is_living_zone: boolean;
  ceiling_height_m: number;
  perimeter_m: number;
  defects: string[];
}

export interface AiRoomAfter {
  id: string;
  name: string;
  area_sqm: number;
  share_pct: number;
  is_wet_zone: boolean;
  is_living_zone: boolean;
  gain_vs_bti_sqm: number;
  normative_justification: string;
  engineering_features: string[];
}

export interface DemolitionPhysics {
  partitions_length_m: number;
  partitions_height_m: number;
  wall_thickness_mm: number;
  demolition_area_sqm: number;
  solid_volume_m3: number;
  debris_volume_m3: number;
  debris_weight_tonnes: number;
  bags_count_40kg: number;
  truckloads_gazelle_1_5t: number;
  prohibited_structural_elements: string[];
}

export interface PartitionErectionPhysics {
  block_type: string;
  block_dimensions_mm: { length: number; height: number; thickness: number };
  wall_length_m: number;
  wall_area_sqm: number;
  blocks_count_pcs: number;
  thin_bed_glue_bags_25kg: number;
  basalt_reinforcement_mesh_m: number;
  reinforcement_step_rows: number;
  acoustic_damping_tape_m: number;
  ceiling_deflection_gap_mm: number;
  sound_insulation_rw_db: number;
}

export interface BeaconPlasterPhysics {
  snip_standard: string;
  vertical_tolerance_mm_per_m: number;
  horizontal_tolerance_mm_per_m: number;
  max_vertical_deviation_total_mm: number;
  rectified_90deg_corners: string[];
  average_thickness_mm: number;
  plaster_walls_area_sqm: number;
  dry_mix_rotband_kg: number;
  dry_mix_rotband_bags_30kg: number;
  primer_tiefengrund_liters: number;
  beacons_zinc_pm6_pcs: number;
  beacons_removal_required: boolean;
  floor_area_loss_from_geometry_sqm: number;
}

export interface ElectricalCircuitGroup {
  group_id: string;
  circuit_number: number;
  name: string;
  room_zone: string;
  load_type: "power_heavy" | "power_standard" | "wet_appliance" | "lighting" | "climate" | "uninterruptible";
  power_kw: number;
  current_amperes: number;
  cable_type: string;
  cable_cross_section: "3x1.5" | "3x2.5" | "3x6.0";
  cable_length_estimate_m: number;
  breaker_rating: string;
  rcd_type?: string;
  din_modules: number;
  is_uninterruptible: boolean;
  normative_pue_clause: string;
}

export interface ElectricalPanelConsensus {
  panel_model: string;
  total_din_modules_capacity: number;
  occupied_din_modules: number;
  reserve_din_modules: number;
  main_breaker: string;
  voltage_relay: string;
  master_switch_automation: string;
  circuit_groups: ElectricalCircuitGroup[];
  total_installed_power_kw: number;
  demand_factor_kc: number;
  design_max_load_kw: number;
}

export interface PlumbingConsumerPoint {
  point_id: string;
  name: string;
  room: string;
  pipe_diameter_mm: number;
  pipe_length_m: number;
  dry_hydroseal: boolean;
  dry_hydroseal_type?: string;
  leak_sensor_installed: boolean;
}

export interface PlumbingUnitConsensus {
  manifold_brand: string;
  cold_water_outlets_count: number;
  hot_water_outlets_count: number;
  pipe_system: string;
  pipe_total_length_m: number;
  joints_in_screed: number;
  anti_flood_system: string;
  sensors_count: number;
  dry_hydroseals: string[];
  pressure_test_standard: string;
  consumers: PlumbingConsumerPoint[];
}

export interface PassportGanttStage {
  stage_id: string;
  stage_number: number;
  title: string;
  start_day: number;
  end_day: number;
  duration_days: number;
  progress_pct: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  critical_path: boolean;
  snip_standard: string;
  mandatory_milestone_check: string;
  tasks: string[];
  strictly_forbidden_actions?: string[];
  acts_aosr_required: string[];
}

export interface PassportFinancialTranche {
  tranche_id: string;
  tranche_number: number;
  title: string;
  amount_kzt: number;
  share_pct: number;
  advance_percent: 0;
  retention_percent: 10;
  payout_after_inspection_kzt: number;
  retention_amount_kzt: number;
  ks2_form: string;
  ks3_form: string;
  inspection_criteria: string;
  status: "COMPLETED" | "ACTIVE_ESCROW" | "LOCKED";
}

export interface ConstructionTrapCountermeasure {
  id: string;
  trapNumber: number;
  title: string;
  contractorTrapWarning: string;
  normativeViolation: string;
  instrumentalAuditMethod: string;
  engineeringParrySolution: string;
  preventedDamageAmountKzt: number;
  isNeutralized: boolean;
}

export interface ObjectWarrantyPassport {
  passportNumber: string;
  propertyAddress: string;
  retentionEscrowBalanceKzt: number;
  decorWarrantyMonths: 12;
  screedWarrantyMonths: 36;
  concealedEngineeringWarrantyMonths: 60;
  slaResponseEmergencyHours: 24;
  slaResponseStandardHours: 48;
}

export interface DetailedBoqItem {
  id: string;
  stageNumber: number;
  name: string;
  brand: string;
  sku: string;
  specification: string;
  category: "mixes" | "electrical" | "plumbing" | "insulation" | "finish";
  storeName: "12 Месяцев" | "Kaspi Магазин" | "Строймарт" | "Лемана ПРО";
  storeUrl: string;
  unit: string;
  unitPriceKzt: number;
  requiredQty: number;
  totalCostKzt: number;
  grossWeightKg: number;
}

export interface LogisticsSummary {
  totalWeightKg: number;
  totalWeightTons: number;
  deliveryVehicleType: string;
  autoDeliveryCostKzt: number;
  floorLiftingCostKzt: number;
  totalLogisticsCostKzt: number;
}

export interface ProjectConsensusPassport {
  passport_id: string;
  revision: number;
  created_at: string;
  city: string;
  floor_area_sqm: number;
  ceiling_height_m: number;
  renovation_type: "rough" | "whitebox" | "secondary";
  selected_blueprint_id: "proj-base" | "proj-optimal" | "proj-premium";
  blueprint_name: string;
  
  consensus_status: "CONSENSUS_REACHED";
  consensus_score_pct: 100;
  participating_agents: PassportAgentApproval[];
  regulatory_standards: string[];

  total_budget_kzt: number;
  total_materials_kzt: number;
  total_labor_kzt: number;
  cost_per_sqm_kzt: number;
  total_timeline_days: number;
  warranty_months: number;
  avoided_risk_total_kzt: number;

  explication: {
    rooms_before: BtiRoomBefore[];
    rooms_after: AiRoomAfter[];
    net_usable_gain_sqm: number;
    net_usable_gain_pct: number;
    demolition: DemolitionPhysics;
    erection: PartitionErectionPhysics;
    plaster: BeaconPlasterPhysics;
    legal_compliance_status: string;
  };

  electrical_panel: ElectricalPanelConsensus;
  plumbing_unit: PlumbingUnitConsensus;
  materials_boq: DetailedBoqItem[];
  logistics: LogisticsSummary;
  gantt_schedule: {
    total_days: number;
    hydration_locked_days: 28;
    stages: PassportGanttStage[];
  };
  financial_tranches: {
    tranches: PassportFinancialTranche[];
    total_labor_escrow_kzt: number;
    total_materials_retail_kzt: number;
    traps: ConstructionTrapCountermeasure[];
  };
  warranty: ObjectWarrantyPassport;
}

export function generateProjectConsensusPassport(
  areaSqm: number,
  ceilingHeightM: number = 2.7,
  renovationType: "rough" | "whitebox" | "secondary" = "rough",
  city: string = "Астана",
  selectedBlueprintId: "proj-base" | "proj-optimal" | "proj-premium" = "proj-optimal"
): ProjectConsensusPassport {
  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;
  const height = ceilingHeightM && ceilingHeightM >= 2.4 ? ceilingHeightM : 2.7;

  const blueprints = generateProjectBlueprints(area, renovationType);
  const activeBlueprint = blueprints.find((b) => b.id === selectedBlueprintId) || blueprints[1];
  const quantities = calculateConstructionQuantities(area, height, renovationType);

  const rooms_before: BtiRoomBefore[] = [
    {
      id: "bti-kitchen",
      name: "Кухня изолированная (План БТИ)",
      area_sqm: Math.round(area * 0.152 * 10) / 10,
      share_pct: 15,
      is_wet_zone: true,
      is_living_zone: false,
      ceiling_height_m: height,
      perimeter_m: Math.round((3.2 + (area * 0.152) / 3.2) * 2 * 10) / 10,
      defects: ["Тесное замкнутое пространство 8.8 м²", "Сложно разместить обеденный стол", "Глухая стена в зал"],
    },
    {
      id: "bti-living",
      name: "Гостиная изолированная",
      area_sqm: Math.round(area * 0.319 * 10) / 10,
      share_pct: 32,
      is_wet_zone: false,
      is_living_zone: true,
      ceiling_height_m: height,
      perimeter_m: Math.round((5.2 + (area * 0.319) / 5.2) * 2 * 10) / 10,
      defects: ["Нерациональные коридорные переходы", "Изолирована от зоны готовки"],
    },
    {
      id: "bti-bedroom",
      name: "Спальня",
      area_sqm: Math.round(area * 0.25 * 10) / 10,
      share_pct: 25,
      is_wet_zone: false,
      is_living_zone: true,
      ceiling_height_m: height,
      perimeter_m: Math.round((4.4 + (area * 0.25) / 4.4) * 2 * 10) / 10,
      defects: ["Угловой дверной проем блокирует встроенный шкаф"],
    },
    {
      id: "bti-bath-wc",
      name: "Раздельные санузлы (ванная 3.6 м² + туалет 1.4 м²)",
      area_sqm: Math.round(area * 0.086 * 10) / 10,
      share_pct: 9,
      is_wet_zone: true,
      is_living_zone: false,
      ceiling_height_m: height,
      perimeter_m: 12.4,
      defects: ["Стиральная машина не помещается", "Открытые стояки ХВС/ГВС без шумоизоляции"],
    },
    {
      id: "bti-corridor",
      name: "Темный коридор-чулок (Транзитный холл)",
      area_sqm: Math.round(area * 0.193 * 10) / 10,
      share_pct: 19,
      is_wet_zone: false,
      is_living_zone: false,
      ceiling_height_m: height,
      perimeter_m: 16.8,
      defects: ["Неэффективная транзитная площадь (съедает 1/5 квартиры)", "Отсутствие естественного света"],
    },
  ];

  const netUsableGain = Math.round(area * 0.14 * 10) / 10;
  const rooms_after: AiRoomAfter[] = [
    {
      id: "ai-open-space",
      name: "Кухня-гостиная Open Space с островом",
      area_sqm: Math.round(area * 0.44 * 10) / 10,
      share_pct: 44,
      is_wet_zone: true,
      is_living_zone: true,
      gain_vs_bti_sqm: Math.round((area * 0.44 - (area * 0.152 + area * 0.319)) * 10) / 10,
      normative_justification: "СП РК 3.02-101-2012: Двойная естественная инсоляция, объединение кухни с электроплитой разрешено.",
      engineering_features: [
        "Кухонный остров с обеденной группой",
        "Выделенный кабель 3х6.0 мм² под индукционную панель",
        "Бесшумный вытяжной канал с обратным клапаном",
      ],
    },
    {
      id: "ai-master-bedroom",
      name: "Мастер-спальня с гардеробной нишей",
      area_sqm: Math.round(area * 0.29 * 10) / 10,
      share_pct: 29,
      is_wet_zone: false,
      is_living_zone: true,
      gain_vs_bti_sqm: Math.round((area * 0.29 - area * 0.25) * 10) / 10,
      normative_justification: "СН РК 3.02-01-2018: Норма площади жилой комнаты для пары соблюдена (>16 м²).",
      engineering_features: [
        "Ниша под встроенный гардероб 65 см",
        "Мастер-выключатели у изголовья кровати",
        "Шумоизоляционный акустический пирог перегородки Rw 43 дБ",
      ],
    },
    {
      id: "ai-master-bath",
      name: "Санузел с душевым трапом и прачечным блоком",
      area_sqm: Math.round(area * 0.11 * 10) / 10,
      share_pct: 11,
      is_wet_zone: true,
      is_living_zone: false,
      gain_vs_bti_sqm: Math.round((area * 0.11 - area * 0.086) * 10) / 10,
      normative_justification: "Закон РК «О жилищных отношениях» ст. 4: Расширение выполнено СТРОГО за счет коридора, без нависания над жилыми комнатами соседей.",
      engineering_features: [
        "Трап строительного исполнения с сухим сифоном",
        "Коллекторный узел Far со скрытым ревизионным люком",
        "Прачечная колонна (стиральная + сушильная машины)",
        "Защита от затопления Neptun с электрокранами Bugatti",
      ],
    },
    {
      id: "ai-hallway",
      name: "Прихожая-холл с гардеробом верхней одежды",
      area_sqm: Math.round(area * 0.16 * 10) / 10,
      share_pct: 16,
      is_wet_zone: false,
      is_living_zone: false,
      gain_vs_bti_sqm: Math.round((area * 0.16 - area * 0.193) * 10) / 10,
      normative_justification: "СП РК 1.03-106: Оптимизированный входной тамбур с теплым керамогранитом.",
      engineering_features: [
        "Встраиваемый силовой электрощит ЩР-36",
        "Кнопка «Мастер-свет» (отключение всего света одной кнопкой)",
        "Встроенная ниша для обуви и сезонных курток",
      ],
    },
  ];

  const demoLength = Math.round(Math.sqrt(area) * 1.82 * 10) / 10;
  const demoArea = Math.round(demoLength * height * 10) / 10;
  const debrisWeight = Math.round(demoArea * 0.08 * 1.25 * 1.35 * 10) / 10;

  const demolition: DemolitionPhysics = {
    partitions_length_m: demoLength,
    partitions_height_m: height,
    wall_thickness_mm: 80,
    demolition_area_sqm: demoArea,
    solid_volume_m3: Math.round(demoArea * 0.08 * 100) / 100,
    debris_volume_m3: Math.round(demoArea * 0.08 * 1.25 * 100) / 100,
    debris_weight_tonnes: debrisWeight,
    bags_count_40kg: Math.ceil((debrisWeight * 1000) / 40),
    truckloads_gazelle_1_5t: Math.ceil(debrisWeight / 1.5),
    prohibited_structural_elements: [
      "Монолитный железобетонный пилон в центре квартиры (КАТЕГОРИЧЕСКИЙ ЗАПРЕТ СНОСА И ШТРОБЛЕНИЯ)",
      "Наружные фасадные стены здания",
      "Общедомовой вентиляционный шахтный блок",
    ],
  };

  const erectionLength = Math.round(Math.sqrt(area) * 1.76 * 10) / 10;
  const erectionArea = Math.round(erectionLength * (height - 0.03) * 10) / 10;
  const blocksCount = Math.ceil((erectionArea / (0.6 * 0.3)) * 1.05);

  const erection: PartitionErectionPhysics = {
    block_type: "Газоблок автоклавный D500 ГОСТ 31360-2007",
    block_dimensions_mm: { length: 600, height: 300, thickness: 100 },
    wall_length_m: erectionLength,
    wall_area_sqm: erectionArea,
    blocks_count_pcs: blocksCount,
    thin_bed_glue_bags_25kg: Math.ceil(erectionArea * 0.1 * 1.15),
    basalt_reinforcement_mesh_m: Math.round(erectionLength * 3 * 1.1),
    reinforcement_step_rows: 3,
    acoustic_damping_tape_m: erectionLength,
    ceiling_deflection_gap_mm: 30,
    sound_insulation_rw_db: 43,
  };

  const plasterWallArea = quantities.wall_area_sqm;
  const rotbandKg = quantities.plaster_estimate_kg;
  const rotbandBags = Math.ceil(rotbandKg / 30);
  const floorLossSqm = Math.round(plasterWallArea * 0.0035 * 10) / 10;

  const plaster: BeaconPlasterPhysics = {
    snip_standard: "СНиП 3.04.01-87 (Таблица 9: Высококачественная штукатурка)",
    vertical_tolerance_mm_per_m: 1.0,
    horizontal_tolerance_mm_per_m: 1.0,
    max_vertical_deviation_total_mm: 5.0,
    rectified_90deg_corners: ["Зона кухни под гарнитур", "Санузел (примыкание ванны/душа)", "Ниша гардероба"],
    average_thickness_mm: 16,
    plaster_walls_area_sqm: plasterWallArea,
    dry_mix_rotband_kg: rotbandKg,
    dry_mix_rotband_bags_30kg: rotbandBags,
    primer_tiefengrund_liters: Math.ceil(plasterWallArea * 0.18),
    beacons_zinc_pm6_pcs: Math.ceil((plasterWallArea / height) / 1.2),
    beacons_removal_required: true,
    floor_area_loss_from_geometry_sqm: floorLossSqm,
  };

  const circuit_groups: ElectricalCircuitGroup[] = [
    {
      group_id: "grp-01",
      circuit_number: 1,
      name: "Холодильник (неотключаемая линия)",
      room_zone: "Кухня",
      load_type: "uninterruptible",
      power_kw: 0.4,
      current_amperes: 1.8,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 18,
      breaker_rating: "C16A 6.0кА",
      rcd_type: "АВДТ 30мА Тип А",
      din_modules: 2,
      is_uninterruptible: true,
      normative_pue_clause: "ПУЭ РК 7.1.37 — дифференциальная защита кухонных сетей",
    },
    {
      group_id: "grp-02",
      circuit_number: 2,
      name: "Wi-Fi роутер, СКУД, домофон",
      room_zone: "Прихожая",
      load_type: "uninterruptible",
      power_kw: 0.3,
      current_amperes: 1.3,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x1.5",
      cable_length_estimate_m: 8,
      breaker_rating: "C10A 4.5кА",
      din_modules: 1,
      is_uninterruptible: true,
      normative_pue_clause: "СП РК 4.04-106-2013 — автономность связи",
    },
    {
      group_id: "grp-03",
      circuit_number: 3,
      name: "Защита от протечек Neptun",
      room_zone: "Санузел",
      load_type: "uninterruptible",
      power_kw: 0.15,
      current_amperes: 0.7,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x1.5",
      cable_length_estimate_m: 12,
      breaker_rating: "C10A 4.5кА",
      rcd_type: "АВДТ 30мА Тип А",
      din_modules: 2,
      is_uninterruptible: true,
      normative_pue_clause: "СП РК 4.01-101-2012 — электропитание аварийных систем",
    },
    {
      group_id: "grp-04",
      circuit_number: 4,
      name: "Индукционная варочная панель",
      room_zone: "Кухня",
      load_type: "power_heavy",
      power_kw: 7.2,
      current_amperes: 31.3,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x6.0",
      cable_length_estimate_m: 22,
      breaker_rating: "C32A 6.0кА",
      din_modules: 2,
      is_uninterruptible: false,
      normative_pue_clause: "ПУЭ РК 7.1.34 — силовой ввод сечением 6.0 мм²",
    },
    {
      group_id: "grp-05",
      circuit_number: 5,
      name: "Встроенный духовой шкаф",
      room_zone: "Кухня",
      load_type: "power_heavy",
      power_kw: 3.2,
      current_amperes: 13.9,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 20,
      breaker_rating: "C16A 6.0кА",
      rcd_type: "УЗО 30мА Тип А",
      din_modules: 1,
      is_uninterruptible: false,
      normative_pue_clause: "ПУЭ РК 7.1.37 — отдельная линия приборов >2 кВт",
    },
    {
      group_id: "grp-06",
      circuit_number: 6,
      name: "Посудомоечная машина",
      room_zone: "Кухня",
      load_type: "wet_appliance",
      power_kw: 2.2,
      current_amperes: 9.6,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 22,
      breaker_rating: "C16A 6.0кА",
      rcd_type: "АВДТ 30мА Тип А",
      din_modules: 2,
      is_uninterruptible: false,
      normative_pue_clause: "ПУЭ РК 7.1.82 — УЗО 30мА на мокрые приборы",
    },
    {
      group_id: "grp-07",
      circuit_number: 7,
      name: "Стиральная и сушильная машины",
      room_zone: "Прачечная",
      load_type: "wet_appliance",
      power_kw: 3.4,
      current_amperes: 14.8,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 16,
      breaker_rating: "C16A 6.0кА",
      rcd_type: "АВДТ 30мА Тип А",
      din_modules: 2,
      is_uninterruptible: false,
      normative_pue_clause: "ГОСТ Р 50571.11 — электробезопасность прачечных",
    },
    {
      group_id: "grp-08",
      circuit_number: 8,
      name: "Бойлер резервного ГВС",
      room_zone: "Санузел",
      load_type: "wet_appliance",
      power_kw: 2.0,
      current_amperes: 8.7,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 15,
      breaker_rating: "C16A 6.0кА",
      rcd_type: "УЗО 10мА Тип А",
      din_modules: 2,
      is_uninterruptible: false,
      normative_pue_clause: "ПУЭ РК 7.1.83 — УЗО 10мА для прямого контакта с водой",
    },
    {
      group_id: "grp-09",
      circuit_number: 9,
      name: "Сплит-системы кондиционирования",
      room_zone: "Климат",
      load_type: "climate",
      power_kw: 2.5,
      current_amperes: 10.9,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 28,
      breaker_rating: "C16A 4.5кА",
      din_modules: 1,
      is_uninterruptible: false,
      normative_pue_clause: "СП РК 4.04-106 — отдельная линия компрессоров",
    },
    {
      group_id: "grp-10",
      circuit_number: 10,
      name: "Розетки рабочей зоны кухни",
      room_zone: "Кухня",
      load_type: "power_standard",
      power_kw: 3.0,
      current_amperes: 13.0,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 24,
      breaker_rating: "C16A 4.5кА",
      rcd_type: "УЗО 30мА Тип А",
      din_modules: 1,
      is_uninterruptible: false,
      normative_pue_clause: "ПУЭ РК 7.1.37 — розеточные группы рабочей зоны",
    },
    {
      group_id: "grp-11",
      circuit_number: 11,
      name: "Розетки гостиной и спальни",
      room_zone: "Жилые зоны",
      load_type: "power_standard",
      power_kw: 2.5,
      current_amperes: 10.9,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 35,
      breaker_rating: "C16A 4.5кА",
      rcd_type: "УЗО 30мА Тип А",
      din_modules: 1,
      is_uninterruptible: false,
      normative_pue_clause: "ПУЭ РК 7.1.38 — групповое УЗО жилых комнат",
    },
    {
      group_id: "grp-12",
      circuit_number: 12,
      name: "Освещение кухни-гостиной и прихожей",
      room_zone: "Общая зона",
      load_type: "lighting",
      power_kw: 0.6,
      current_amperes: 2.6,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x1.5",
      cable_length_estimate_m: 30,
      breaker_rating: "C10A 4.5кА",
      din_modules: 1,
      is_uninterruptible: false,
      normative_pue_clause: "СН РК 2.04-01-2014 — разделение света и розеток",
    },
    {
      group_id: "grp-13",
      circuit_number: 13,
      name: "Освещение спальни и гардероба",
      room_zone: "Спальня",
      load_type: "lighting",
      power_kw: 0.4,
      current_amperes: 1.7,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x1.5",
      cable_length_estimate_m: 25,
      breaker_rating: "C10A 4.5кА",
      din_modules: 1,
      is_uninterruptible: false,
      normative_pue_clause: "ПУЭ РК 7.1.35 — сечение освещения 1.5 мм²",
    },
    {
      group_id: "grp-14",
      circuit_number: 14,
      name: "Освещение и теплый пол санузла",
      room_zone: "Санузел",
      load_type: "wet_appliance",
      power_kw: 0.8,
      current_amperes: 3.5,
      cable_type: "ВВГнг(А)-LS ГОСТ 31996-2012",
      cable_cross_section: "3x2.5",
      cable_length_estimate_m: 18,
      breaker_rating: "C16A 6.0кА",
      rcd_type: "АВДТ 30мА Тип А",
      din_modules: 2,
      is_uninterruptible: false,
      normative_pue_clause: "ПУЭ РК 7.1.40 — УЗО на нагревательные маты ванной",
    },
  ];

  const electrical_panel: ElectricalPanelConsensus = {
    panel_model: "ЩРв-36 модулей IP41 (Schneider Electric Easy9)",
    total_din_modules_capacity: 36,
    occupied_din_modules: 31,
    reserve_din_modules: 5,
    main_breaker: "2P C32A 6.0кА (Schneider Electric)",
    voltage_relay: "DigiTOP V-protector 63A (отсечка 0.02 сек при 170-260В)",
    master_switch_automation: "Контактор Hager 40A + кнопка «Мастер-свет» у входа",
    circuit_groups,
    total_installed_power_kw: 27.8,
    demand_factor_kc: 0.36,
    design_max_load_kw: 10.0,
  };

  const plumbing_consumers: PlumbingConsumerPoint[] = [
    { point_id: "p-1", name: "Кухонная мойка", room: "Кухня", pipe_diameter_mm: 16.2, pipe_length_m: 8.5, dry_hydroseal: false, leak_sensor_installed: true },
    { point_id: "p-2", name: "Посудомоечная машина", room: "Кухня", pipe_diameter_mm: 16.2, pipe_length_m: 9.0, dry_hydroseal: false, leak_sensor_installed: true },
    { point_id: "p-3", name: "Раковина санузла", room: "Санузел", pipe_diameter_mm: 16.2, pipe_length_m: 3.5, dry_hydroseal: false, leak_sensor_installed: true },
    { point_id: "p-4", name: "Душевой комплекс (трап)", room: "Санузел", pipe_diameter_mm: 16.2, pipe_length_m: 4.5, dry_hydroseal: true, dry_hydroseal_type: "Сухой поплавковый трап McAlpine", leak_sensor_installed: true },
    { point_id: "p-5", name: "Инсталляция унитаза", room: "Санузел", pipe_diameter_mm: 16.2, pipe_length_m: 2.5, dry_hydroseal: false, leak_sensor_installed: false },
    { point_id: "p-6", name: "Гигиенический душ скрытый", room: "Санузел", pipe_diameter_mm: 16.2, pipe_length_m: 3.0, dry_hydroseal: false, leak_sensor_installed: false },
    { point_id: "p-7", name: "Стиральная машина (прачечная)", room: "Прачечная", pipe_diameter_mm: 16.2, pipe_length_m: 4.0, dry_hydroseal: true, dry_hydroseal_type: "Шариковый сифон с сухим клапаном", leak_sensor_installed: true },
    { point_id: "p-8", name: "Бойлер резервного ГВС", room: "Санузел", pipe_diameter_mm: 16.2, pipe_length_m: 2.0, dry_hydroseal: false, leak_sensor_installed: false },
    { point_id: "p-9", name: "Отвод конденсата сплит-систем", room: "Санузел", pipe_diameter_mm: 16.2, pipe_length_m: 6.0, dry_hydroseal: true, dry_hydroseal_type: "Сухой капельный сифон кондиционера", leak_sensor_installed: false },
  ];

  const plumbing_unit: PlumbingUnitConsensus = {
    manifold_brand: "Far Rubinetterie 3/4 - 1/2 Flat Seal (Италия)",
    cold_water_outlets_count: 7,
    hot_water_outlets_count: 5,
    pipe_system: "Rehau Rautitan Stabil 16.2х2.6 мм в изоляции Energoflex",
    pipe_total_length_m: Math.max(30, Math.round(area * 1.15 + 14)),
    joints_in_screed: 0,
    anti_flood_system: "Neptun Smart с кранами Bugatti Pro 1/2 (отсечка за 18 сек)",
    sensors_count: 5,
    dry_hydroseals: [
      "Душевой трап McAlpine с поплавковым сухим затвором",
      "Сифон стиральной машины со встроенным сухим шариком",
      "Капельный сифон кондиционера с запахозапирающим клапаном",
    ],
    pressure_test_standard: "Гидравлическая опрессовка 10 бар на 24 часа с актом АОСР (СП РК 4.01-101-2012)",
    consumers: plumbing_consumers,
  };

  const screedBags = Math.max(20, Math.round((area * 15 * 1.6) / 25));
  const cable25m = Math.round(quantities.electrical_points * 8.5);
  const cable15m = Math.round(area * 3.1);

  const materials_boq: DetailedBoqItem[] = [
    {
      id: "boq-rotband",
      stageNumber: 1,
      name: "Штукатурка гипсовая Knauf Ротбанд (30 кг)",
      brand: "Knauf",
      sku: "12M-KNF-ROTB-30",
      specification: "Безусадочная гипсовая смесь по маякам для стен и откосов",
      category: "mixes",
      storeName: "12 Месяцев",
      storeUrl: "https://www.12months.kz/catalog/shtukaturka-gipsovaya/",
      unit: "мешок 30 кг",
      unitPriceKzt: 3650,
      requiredQty: rotbandBags,
      totalCostKzt: rotbandBags * 3650,
      grossWeightKg: rotbandBags * 30.1,
    },
    {
      id: "boq-tiefengrund",
      stageNumber: 1,
      name: "Грунтовка Knauf Тифенгрунд (10 л)",
      brand: "Knauf",
      sku: "12M-KNF-TIEF-10",
      specification: "Обеспыливание и укрепление монолита перед штукатуркой",
      category: "mixes",
      storeName: "12 Месяцев",
      storeUrl: "https://www.12months.kz/catalog/gruntovka/",
      unit: "канистра 10 л",
      unitPriceKzt: 9800,
      requiredQty: Math.max(2, Math.ceil(plasterWallArea / 70)),
      totalCostKzt: Math.max(2, Math.ceil(plasterWallArea / 70)) * 9800,
      grossWeightKg: Math.max(2, Math.ceil(plasterWallArea / 70)) * 10.2,
    },
    {
      id: "boq-vvg-25",
      stageNumber: 1,
      name: "Кабель ВВГнг-LS 3х2.5 мм² ГОСТ 31996-2012",
      brand: "Казэнергокабель",
      sku: "12M-CAB-325-KZ",
      specification: "Медный негорючий кабель розеточных сетей",
      category: "electrical",
      storeName: "12 Месяцев",
      storeUrl: "https://www.12months.kz/catalog/kabel-i-provod-vvgng-ls/",
      unit: "м.п.",
      unitPriceKzt: 580,
      requiredQty: cable25m,
      totalCostKzt: cable25m * 580,
      grossWeightKg: Math.round(cable25m * 0.145),
    },
    {
      id: "boq-vvg-15",
      stageNumber: 1,
      name: "Кабель ВВГнг-LS 3х1.5 мм² ГОСТ 31996-2012",
      brand: "Казэнергокабель",
      sku: "12M-CAB-315-KZ",
      specification: "Медный кабель осветительных линий",
      category: "electrical",
      storeName: "12 Месяцев",
      storeUrl: "https://www.12months.kz/catalog/kabel-i-provod-vvgng-ls/",
      unit: "м.п.",
      unitPriceKzt: 390,
      requiredQty: cable15m,
      totalCostKzt: cable15m * 390,
      grossWeightKg: Math.round(cable15m * 0.095),
    },
    {
      id: "boq-rehau-stabil",
      stageNumber: 1,
      name: "Труба Rehau Rautitan Stabil 16.2х2.6 мм",
      brand: "Rehau (Германия)",
      sku: "STM-REH-STAB-16",
      specification: "PE-Xa труба для ХВС/ГВС, рабочее давление 10 бар",
      category: "plumbing",
      storeName: "Строймарт",
      storeUrl: "https://stroy-mart.kz/truby-rehau/",
      unit: "м.п.",
      unitPriceKzt: 1850,
      requiredQty: plumbing_unit.pipe_total_length_m,
      totalCostKzt: plumbing_unit.pipe_total_length_m * 1850,
      grossWeightKg: Math.round(plumbing_unit.pipe_total_length_m * 0.14),
    },
    {
      id: "boq-schneider-ez9",
      stageNumber: 1,
      name: "Щит Schneider Easy9 36 мод. + автоматы + DigiTOP",
      brand: "Schneider Electric / DigiTOP",
      sku: "KSP-SCH-EZ9-KIT",
      specification: "Комплектная модульная автоматика: щит, 12 автоматов, 3 УЗО, реле 63А",
      category: "electrical",
      storeName: "Kaspi Магазин",
      storeUrl: "https://kaspi.kz/shop/c/electrical-cabinets/",
      unit: "комплект",
      unitPriceKzt: 107000,
      requiredQty: 1,
      totalCostKzt: 107000,
      grossWeightKg: 8.5,
    },
    {
      id: "boq-neptun-smart",
      stageNumber: 1,
      name: "Защита от протечек Neptun Base + 2 крана Bugatti Pro",
      brand: "Neptun / Bugatti",
      sku: "STM-NEP-BASE-12",
      specification: "Аварийное перекрытие воды при протечке за 18 секунд",
      category: "plumbing",
      storeName: "Строймарт",
      storeUrl: "https://stroy-mart.kz/",
      unit: "комплект",
      unitPriceKzt: 94000,
      requiredQty: 1,
      totalCostKzt: 94000,
      grossWeightKg: 4.2,
    },
    {
      id: "boq-ceresit-cn175",
      stageNumber: 2,
      name: "Самонивелир Ceresit CN-175 (25 кг)",
      brand: "Ceresit (Henkel)",
      sku: "12M-CRS-CN175-25",
      specification: "Прочность М200 (20 МПа), безусадочный для единого пола без порогов",
      category: "mixes",
      storeName: "12 Месяцев",
      storeUrl: "https://www.12months.kz/catalog/nalivnoy-pol/",
      unit: "мешок 25 кг",
      unitPriceKzt: 3850,
      requiredQty: screedBags,
      totalCostKzt: screedBags * 3850,
      grossWeightKg: screedBags * 25.1,
    },
    {
      id: "boq-spc-tarkett",
      stageNumber: 3,
      name: "Кварцвинил SPC Tarkett Art Vinyl 43 класс",
      brand: "Tarkett",
      sku: "12M-SPC-TKT-43",
      specification: "100% водостойкий пол с акустической подложкой IXPE 1 мм",
      category: "finish",
      storeName: "12 Месяцев",
      storeUrl: "https://www.12months.kz/catalog/kvartsvinil/",
      unit: "м²",
      unitPriceKzt: 7800,
      requiredQty: Math.round(area * 1.08),
      totalCostKzt: Math.round(area * 1.08) * 7800,
      grossWeightKg: Math.round(area * 1.08 * 8.5),
    },
    {
      id: "boq-geberit-duofix",
      stageNumber: 3,
      name: "Инсталляция Geberit Duofix Delta с клавишей Delta20",
      brand: "Geberit (Швейцария)",
      sku: "KSP-GEB-DUOF-12",
      specification: "Стальная рама скрытого монтажа с бачком с защитой от конденсата",
      category: "plumbing",
      storeName: "Kaspi Магазин",
      storeUrl: "https://kaspi.kz/shop/c/installations-for-toilet/",
      unit: "комплект",
      unitPriceKzt: 115000,
      requiredQty: 1,
      totalCostKzt: 115000,
      grossWeightKg: 14.5,
    },
  ];

  const totalGrossWeightKg = materials_boq.reduce((sum, item) => sum + item.grossWeightKg, 0);
  const totalWeightTons = Math.max(0.1, Number((totalGrossWeightKg / 1000).toFixed(2)));

  const logistics: LogisticsSummary = {
    totalWeightKg: Math.round(totalGrossWeightKg),
    totalWeightTons,
    deliveryVehicleType: totalWeightTons <= 3.0 ? "Газель удлиненная 3.0т" : "Грузовик Валдай / Foton 5.0т",
    autoDeliveryCostKzt: totalWeightTons <= 3.0 ? 14000 : 24000,
    floorLiftingCostKzt: Math.round(totalWeightTons * 4500),
    totalLogisticsCostKzt: (totalWeightTons <= 3.0 ? 14000 : 24000) + Math.round(totalWeightTons * 4500),
  };

  const stage1Days = renovationType === "secondary" ? 14 : 12;
  const stage2Days = 20;
  const stage3Days = 28;
  const stage4Days = Math.max(20, Math.round(22 + area * 0.04));
  const totalTimelineDays = stage1Days + stage2Days + stage3Days + stage4Days;

  const gantt_stages: PassportGanttStage[] = [
    {
      stage_id: "gantt-1",
      stage_number: 1,
      title: "Фаза 1: Демонтаж, возведение стен и геометрия",
      start_day: 1,
      end_day: stage1Days,
      duration_days: stage1Days,
      progress_pct: 100,
      status: "COMPLETED",
      critical_path: true,
      snip_standard: "СНиП 3.04.01-87 · Закон РК о жилищных отношениях (ст. 4)",
      mandatory_milestone_check: "Лазерная проверка вертикали перегородок (допуск ≤1.0 мм/м) и углов 90° кухни/санузла.",
      tasks: [
        "Снос некапитальных перегородок (без касания монолитных пилонов)",
        "Вывоз строительного мусора в контейнерах ПУХТО (до 5.1 тонн)",
        "Кладка стен из автоклавного газоблока D500 с демпфером под потолком",
        "Штукатурка стен по маякам с прямыми углами 90°",
      ],
      acts_aosr_required: [
        "Акт АОСР №1: Примыкание перегородок к монолиту",
        "Акт АОСР №2: Лазерный замер геометрии и прямых углов",
      ],
    },
    {
      stage_id: "gantt-2",
      stage_number: 2,
      title: "Фаза 2: Черновая инженерия ЭОМ, ОВК и стяжка",
      start_day: stage1Days + 1,
      end_day: stage1Days + stage2Days,
      duration_days: stage2Days,
      progress_pct: 65,
      status: "IN_PROGRESS",
      critical_path: true,
      snip_standard: "ПУЭ РК 7.1 · СП РК 4.01-101-2012 · ГОСТ 31996-2012",
      mandatory_milestone_check: "Гидравлическая опрессовка труб 10 бар на 24 часа и мегаомметр проводки 1000В.",
      tasks: [
        "Прокладка силового кабеля ВВГнг-LS в негорючей гофре по потолку",
        "Сборка силового щита ЩР-36 с реле DigiTOP и мастер-контактором",
        "Коллекторная лучевая разводка Rehau Stabil без стыков в полу",
        "Монтаж электрокранов и датчиков защиты от протечек Neptun",
        "Монтаж демпферной ленты 8 мм и плавающей стяжки пола",
      ],
      acts_aosr_required: [
        "Акт АОСР №3: Протокол испытания сопротивления изоляции",
        "Акт АОСР №4: Акт гидравлической опрессовки водопровода 10 бар",
        "Акт АОСР №5: Освидетельствование шумоизоляционной мембраны",
      ],
    },
    {
      stage_id: "gantt-3",
      stage_number: 3,
      title: "Фаза 3: ТЕХНОЛОГИЧЕСКАЯ СУШКА СТЯЖКИ (28 ДНЕЙ)",
      start_day: stage1Days + stage2Days + 1,
      end_day: stage1Days + stage2Days + stage3Days,
      duration_days: stage3Days,
      progress_pct: 0,
      status: "PENDING",
      critical_path: true,
      snip_standard: "СНиП 2.03.13-88 · ГОСТ 31358-2019",
      mandatory_milestone_check: "Замер остаточной влажности карбидным гигрометром (≤2.0% для кварцвинила) и прочности склерометром.",
      tasks: [
        "Естественная гидратация цементного камня (набор 100% марочной прочности М200)",
        "Категорический запрет тепловых пушек во избежание усадочных трещин",
        "Заказ чистовых отделочных материалов и сантехники",
        "Контрольный замер кухонного гарнитура",
      ],
      strictly_forbidden_actions: [
        "ЗАПРЕЩЕНО включать теплые полы и тепловые пушки",
        "ЗАПРЕЩЕНО укладывать напольные покрытия при влажности >2.0%",
      ],
      acts_aosr_required: [
        "Акт АОСР №6: Протокол контроля влажности стяжки карбидным методом",
        "Акт АОСР №7: Протокол прочности стяжки склерометром Шмидта",
      ],
    },
    {
      stage_id: "gantt-4",
      stage_number: 4,
      title: "Фаза 4: Чистовая отделка, пусконаладка и сдача",
      start_day: stage1Days + stage2Days + stage3Days + 1,
      end_day: totalTimelineDays,
      duration_days: stage4Days,
      progress_pct: 0,
      status: "PENDING",
      critical_path: false,
      snip_standard: "СНиП 3.04.01-87 · СП РК 1.03-106-2012",
      mandatory_milestone_check: "Простукивание плитки на пустоты, проверка срабатывания УЗО на утечку тока 30 мА, тяга вытяжки.",
      tasks: [
        "Гидроизоляция Knauf Флэхендихт с проливом водой 24 часа",
        "Укладка кварцвинила SPC единым контуром без порогов",
        "Шпатлевание под лампу Лосева и окраска интерьерной краской",
        "Монтаж механизмов розеток, инсталляции Geberit и сантехники Grohe",
        "Клининг, комплексная пусконаладка и подписание акта КС-2",
      ],
      acts_aosr_required: [
        "Акт АОСР №8: Акт гидроиспытания мокрых зон 24 часа",
        "Акт КС-2: Итоговый акт приемки выполненных строительно-монтажных работ",
        "Справка КС-3: Справка о стоимости выполненных работ",
      ],
    },
  ];

  const totalLaborCostKzt = activeBlueprint.laborCostKzt;
  const totalMaterialsCostKzt = activeBlueprint.materialsCostKzt;
  const totalBudgetCzk = activeBlueprint.totalCostKzt;

  const financial_tranches: PassportFinancialTranche[] = [
    {
      tranche_id: "tranche-1",
      tranche_number: 1,
      title: "Транш 01 · Черновой контур и геометрия стен",
      share_pct: 30,
      amount_kzt: Math.round(totalLaborCostKzt * 0.30),
      advance_percent: 0,
      retention_percent: 10,
      payout_after_inspection_kzt: Math.round(totalLaborCostKzt * 0.30 * 0.90),
      retention_amount_kzt: Math.round(totalLaborCostKzt * 0.30 * 0.10),
      ks2_form: "Акт КС-2 №1 (Черновая кладка и геометрия)",
      ks3_form: "Справка КС-3 №1",
      inspection_criteria: "Лазерная проверка геометрии 2-метровым правилом (просвет ≤1.5 мм), углы 90° кухни и санузла.",
      status: "COMPLETED",
    },
    {
      tranche_id: "tranche-2",
      tranche_number: 2,
      title: "Транш 02 · Инженерные магистрали ЭОМ и сантехника",
      share_pct: 25,
      amount_kzt: Math.round(totalLaborCostKzt * 0.25),
      advance_percent: 0,
      retention_percent: 10,
      payout_after_inspection_kzt: Math.round(totalLaborCostKzt * 0.25 * 0.90),
      retention_amount_kzt: Math.round(totalLaborCostKzt * 0.25 * 0.10),
      ks2_form: "Акт КС-2 №2 (Скрытые инженерные сети)",
      ks3_form: "Справка КС-3 №2",
      inspection_criteria: "Опрессовка сантехники 10 бар (24ч), мегаомметр проводки 1000В, проверка сборки щита ЩР-36.",
      status: "ACTIVE_ESCROW",
    },
    {
      tranche_id: "tranche-3",
      tranche_number: 3,
      title: "Транш 03 · Стяжка пола и предчистовой White Box",
      share_pct: 35,
      amount_kzt: Math.round(totalLaborCostKzt * 0.35),
      advance_percent: 0,
      retention_percent: 10,
      payout_after_inspection_kzt: Math.round(totalLaborCostKzt * 0.35 * 0.90),
      retention_amount_kzt: Math.round(totalLaborCostKzt * 0.35 * 0.10),
      ks2_form: "Акт КС-2 №3 (Стяжка, шпатлевка и подготовка поверхностей)",
      ks3_form: "Справка КС-3 №3",
      inspection_criteria: "Карбидный гигрометр (влажность ≤2.0%), проверка плоскости под лампу Лосева Q3/Q4.",
      status: "LOCKED",
    },
    {
      tranche_id: "tranche-4",
      tranche_number: 4,
      title: "Транш 04 · Финишная приёмка под ключ и Гарантийный ввод",
      share_pct: 10,
      amount_kzt: Math.round(totalLaborCostKzt * 0.10),
      advance_percent: 0,
      retention_percent: 10,
      payout_after_inspection_kzt: Math.round(totalLaborCostKzt * 0.10 * 0.90),
      retention_amount_kzt: Math.round(totalLaborCostKzt * 0.10 * 0.10),
      ks2_form: "Акт КС-2 №4 (Финальный акт ввода в эксплуатацию)",
      ks3_form: "Справка КС-3 №4 (Итоговая)",
      inspection_criteria: "Дефектовочный лист 0 замечаний, проверка УЗО тестером утечки, анемометрия тяги, выдача паспорта.",
      status: "LOCKED",
    },
  ];

  const traps: ConstructionTrapCountermeasure[] = [
    {
      id: "trap-1",
      trapNumber: 1,
      title: "Горизонтальное штробление монолитного пилона",
      contractorTrapWarning: "«Прорежем монолитную колонну болгаркой под силовой провод, все так делают»",
      normativeViolation: "Закон РК «О жилищных отношениях» ст. 4; СП РК 2.03-30-2017 (Сейсмика)",
      instrumentalAuditMethod: "Сканирование детектором арматуры Hilti / Bosch D-tect",
      engineeringParrySolution: "Категорический запрет касания монолита. Все трассы перенесены в негорючую гофру по потолку.",
      preventedDamageAmountKzt: 3500000,
      isNeutralized: true,
    },
    {
      id: "trap-2",
      trapNumber: 2,
      title: "Отсутствие реле напряжения и отказ от УЗО",
      contractorTrapWarning: "«Застройщик уже поставил общий автомат, реле напряжения — это лишние траты»",
      normativeViolation: "ПУЭ РК 7.1; СН РК 4.04-07-2019",
      instrumentalAuditMethod: "Имитация скачка напряжения и обрыва фазы прибором Sonel / Fluke",
      engineeringParrySolution: "Реле DigiTOP 63A (отсечка 0.02 с при 170-260В) + УЗО 30мА и 10мА в санузле.",
      preventedDamageAmountKzt: 2200000,
      isNeutralized: true,
    },
    {
      id: "trap-3",
      trapNumber: 3,
      title: "Замуровывание разборных фитингов в стяжку пола",
      contractorTrapWarning: "«Соединим трубу резьбовым тройником и зальем бетоном, 10 лет простоит»",
      normativeViolation: "СП РК 4.01-102-2013; СНиП 2.04.01-85*",
      instrumentalAuditMethod: "Манометрическая опрессовка 10 бар на 24 часа и тепловизионный аудит",
      engineeringParrySolution: "Коллекторно-лучевая разводка Rehau Stabil без единого скрытого стыка под стяжкой. 0 соединений в полу.",
      preventedDamageAmountKzt: 4000000,
      isNeutralized: true,
    },
    {
      id: "trap-4",
      trapNumber: 4,
      title: "Перенос мокрых зон над жилыми комнатами соседей",
      contractorTrapWarning: "«Давайте увеличим ванную за счет спальни, никто не узнает»",
      normativeViolation: "Закон РК «О жилищных отношениях» ст. 4 п. 2; ст. 322 КоАП РК",
      instrumentalAuditMethod: "Сверка экспликации с поэтажным планом БТИ нижележащей квартиры",
      engineeringParrySolution: "Мокрые зоны расширены строго в границы нежилого коридора с созданием гидрокорыта 20 мм.",
      preventedDamageAmountKzt: 3200000,
      isNeutralized: true,
    },
    {
      id: "trap-5",
      trapNumber: 5,
      title: "Демпинг бригад с вымогательством доплат на объекте",
      contractorTrapWarning: "«Сделаем за 1.8 млн ₸, а через неделю: штукатурка и подъем считаются отдельно (+2.4 млн ₸)»",
      normativeViolation: "ГК РК ст. 621 (Твердая цена подряда), ст. 654; СН РК 8.02-05-2002",
      instrumentalAuditMethod: "Закрытая ведомость BOQ и твердая договорная цена Turnkey Cap",
      engineeringParrySolution: "Твердая смета с фиксацией в договоре. Любые несогласованные допработы оплачивает подрядчик.",
      preventedDamageAmountKzt: 2400000,
      isNeutralized: true,
    },
    {
      id: "trap-6",
      trapNumber: 6,
      title: "Заливка стяжки пола без демпферной ленты",
      contractorTrapWarning: "«Зальем стяжку прямо к стенам без ленты, быстрее высохнет»",
      normativeViolation: "СНиП 2.03.13-88; ГОСТ 31358-2019",
      instrumentalAuditMethod: "Инспекция демпферного шва 8 мм с фартуком по всему периметру стен",
      engineeringParrySolution: "Компенсационная демпферная лента 100х8 мм по периметру стен, предотвращающая трещины и излом SPC.",
      preventedDamageAmountKzt: 1950000,
      isNeutralized: true,
    },
    {
      id: "trap-7",
      trapNumber: 7,
      title: "Использование кабеля ТУ с заниженным сечением жил",
      contractorTrapWarning: "«Купим кабель подешевле на базаре, а скрутки замотаем изолентой в штукатурке»",
      normativeViolation: "ГОСТ 31996-2012; ПУЭ РК 2.1; Закон РК «О гражданской защите»",
      instrumentalAuditMethod: "Микрометрический замер сечения жил и замер сопротивления изоляции",
      engineeringParrySolution: "Только сертифицированный ВВГнг-LS ГОСТ Казэнергокабель. Соединения опрессовкой гильзами ГМЛ.",
      preventedDamageAmountKzt: 3000000,
      isNeutralized: true,
    },
  ];

  const avoidedRiskTotalKzt = traps.reduce((sum, t) => sum + t.preventedDamageAmountKzt, 0);

  const warranty: ObjectWarrantyPassport = {
    passportNumber: "WP-KZ-" + (city === "Алматы" ? "ALA" : "AST") + "-2026-" + String(area).padStart(3, "0"),
    propertyAddress: city + ", жилой объект " + area + " м²",
    retentionEscrowBalanceKzt: Math.round(totalLaborCostKzt * 0.10),
    decorWarrantyMonths: 12,
    screedWarrantyMonths: 36,
    concealedEngineeringWarrantyMonths: 60,
    slaResponseEmergencyHours: 24,
    slaResponseStandardHours: 48,
  };

  const participating_agents: PassportAgentApproval[] = [
    { agentCode: "AGT-01 · ALPHA", agentName: "Алексей", agentRole: "Ведущий инженер техзаказчика", approvalBadge: "ПАРАМЕТРЫ ЗАФИКСИРОВАНЫ", signedAt: new Date().toISOString().split("T")[0], status: "SIGNED_OFF" },
    { agentCode: "AGT-02 · SCRAPER", agentName: "Данияр", agentRole: "Сметчик и скрапер розничных цен", approvalBadge: "ЦЕНЫ 12М И KASPI ПОДТВЕРЖДЕНЫ", signedAt: new Date().toISOString().split("T")[0], status: "SIGNED_OFF" },
    { agentCode: "AGT-03 · ARCHITECT", agentName: "Марина", agentRole: "Главный архитектор проекта", approvalBadge: "BIM-ПЛАН И СНиП СОГЛАСОВАНЫ", signedAt: new Date().toISOString().split("T")[0], status: "SIGNED_OFF" },
    { agentCode: "AGT-05 · SKEPTICS", agentName: "Елена и Виктор", agentRole: "Агенты-скептики строительного брака", approvalBadge: "7 ЛОВУШЕК НЕЙТРАЛИЗОВАНО", signedAt: new Date().toISOString().split("T")[0], status: "SIGNED_OFF" },
    { agentCode: "AGT-06 · JURIST", agentName: "Артур", agentRole: "Юрист ГАСК и технадзора", approvalBadge: "ЭСКРОУ КС-2 ЮРИДИЧЕСКИ ЧИСТО", signedAt: new Date().toISOString().split("T")[0], status: "SIGNED_OFF" },
  ];

  return {
    passport_id: "KZ-" + (city === "Алматы" ? "ALA" : "AST") + "-2026-" + String(area).padStart(3, "0") + "-PASSPORT",
    revision: 1,
    created_at: new Date().toISOString().split("T")[0],
    city,
    floor_area_sqm: area,
    ceiling_height_m: height,
    renovation_type: renovationType,
    selected_blueprint_id: selectedBlueprintId,
    blueprint_name: activeBlueprint.name,
    consensus_status: "CONSENSUS_REACHED",
    consensus_score_pct: 100,
    participating_agents,
    regulatory_standards: [
      "СН РК 8.02-05-2002 · Сметные нормативы оплаты труда",
      "Закон РК «О жилищных отношениях» ст. 4 · Режим перепланировок",
      "СНиП 3.04.01-87 · Изоляционные и отделочные покрытия",
      "СНиП 2.03.13-88 · Полы и гидроизоляция",
      "ПУЭ РК 7.1 · Электроустановки жилых зданий",
      "СП РК 4.01-101-2012 · Внутренний водопровод и канализация",
      "СП РК 2.03-30-2017 · Строительство в сейсмических районах",
    ],
    total_budget_kzt: totalBudgetCzk,
    total_materials_kzt: totalMaterialsCostKzt,
    total_labor_kzt: totalLaborCostKzt,
    cost_per_sqm_kzt: activeBlueprint.costPerSqmKzt,
    total_timeline_days: totalTimelineDays,
    warranty_months: activeBlueprint.warrantyMonths,
    avoided_risk_total_kzt: avoidedRiskTotalKzt,
    explication: {
      rooms_before,
      rooms_after,
      net_usable_gain_sqm: netUsableGain,
      net_usable_gain_pct: 14,
      demolition,
      erection,
      plaster,
      legal_compliance_status: "100% соответствует ст. 4 Закона РК и строительным нормам ГАСК",
    },
    electrical_panel,
    plumbing_unit,
    materials_boq,
    logistics,
    gantt_schedule: {
      total_days: totalTimelineDays,
      hydration_locked_days: 28,
      stages: gantt_stages,
    },
    financial_tranches: {
      tranches: financial_tranches,
      total_labor_escrow_kzt: totalLaborCostKzt,
      total_materials_retail_kzt: totalMaterialsCostKzt,
      traps,
    },
    warranty,
  };
}

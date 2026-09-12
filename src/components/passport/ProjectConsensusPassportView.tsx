'use client';

import React, { useState, useMemo } from 'react';
import { 
  ProjectConsensusPassport, 
  PassportGanttStage, 
  PassportFinancialTranche, 
  ConstructionTrapCountermeasure, 
  DetailedBoqItem,
  ElectricalCircuitGroup
} from '@/core/tools/consensus-passport-engine';
import { ArchitecturalFloorPlan } from '@/components/ArchitecturalFloorPlan';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileSignature, 
  Lock, 
  Unlock, 
  Calendar, 
  Clock, 
  Compass, 
  Ruler, 
  Zap, 
  Wrench, 
  ShoppingCart, 
  Store, 
  ExternalLink, 
  Scale, 
  TrendingDown, 
  AlertTriangle, 
  Layers, 
  Building2, 
  FileSpreadsheet, 
  Sparkles, 
  Truck, 
  HelpCircle,
  ArrowRight,
  Flame,
  HardHat,
  ChevronRight,
  Printer
} from 'lucide-react';

interface ProjectConsensusPassportViewProps {
  passport: ProjectConsensusPassport;
  onOpenWorkBrief?: () => void;
  onSelectBlueprint?: (blueprintId: 'proj-base' | 'proj-optimal' | 'proj-premium') => void;
}

export const ProjectConsensusPassportView: React.FC<ProjectConsensusPassportViewProps> = ({
  passport,
  onOpenWorkBrief,
  onSelectBlueprint,
}) => {
  // Navigation tabs for the A-to-Z pipeline
  const [activeStep, setActiveStep] = useState<number>(1);
  const [boqFilterCategory, setBoqFilterCategory] = useState<string>('all');
  const [liftHasElevator, setLiftHasElevator] = useState<boolean>(true);
  const [targetFloor, setTargetFloor] = useState<number>(5);

  const steps = [
    { num: 1, id: 'specs', label: '01 Паспорт & Физика', icon: Ruler },
    { num: 2, id: 'bim', label: '02 2D CAD План', icon: Compass },
    { num: 3, id: 'mep', label: '03 14 Групп & Узлы', icon: Zap },
    { num: 4, id: 'boq', label: '04 Смета Kaspi/12M', icon: ShoppingCart },
    { num: 5, id: 'gantt', label: '05 График (28 дней)', icon: Clock },
    { num: 6, id: 'escrow', label: '06 4 Транша КС-2', icon: Lock },
    { num: 7, id: 'traps', label: '07 Ловушки & Гарантия', icon: ShieldCheck },
  ];

  const filteredBoq = useMemo(() => {
    if (boqFilterCategory === 'all') return passport.materials_boq;
    return passport.materials_boq.filter((item) => item.category === boqFilterCategory);
  }, [passport.materials_boq, boqFilterCategory]);

  const dynamicLiftingCost = useMemo(() => {
    const tons = passport.logistics.totalWeightTons;
    if (liftHasElevator) {
      return Math.round(tons * 4500);
    }
    return Math.round(tons * 2200 * targetFloor);
  }, [passport.logistics.totalWeightTons, liftHasElevator, targetFloor]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* =========================================================================
          HERO PASSPORT HEADER (OFFICIAL COAT OF ARMS & 5 AGENT SIGN-OFF)
          ========================================================================= */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#080b12]/90 backdrop-blur-xl border border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-5 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Консенсус 5 агентов достигнут (100%)
              </span>
              <span className="text-xs font-mono text-slate-300 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/[0.08]">
                {passport.passport_id}
              </span>
              <span className="text-xs font-mono text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                {passport.city} · {passport.floor_area_sqm} м² · {passport.renovation_type === 'whitebox' ? 'White Box' : passport.renovation_type === 'secondary' ? 'Вторичка' : 'Черновая'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
              Единый Паспорт Проекта: от обмеров до ключей
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Полный сквозной инвариант объекта: согласована архитектурная 2D/3D экспликация (+14% полезной площади), 
              рассчитана смета материалов по чекам магазинов <strong>12 Месяцев</strong> и <strong>Kaspi</strong>, 
              зафиксированы 4 безопасных транша оплат по актам КС-2 и парировано 7 строительных ловушек на <strong>{passport.avoided_risk_total_kzt.toLocaleString('ru-RU')} ₸</strong>.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Итоговая смета под ключ:</span>
              <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-white">
                {passport.total_budget_kzt.toLocaleString('ru-RU')} ₸
              </span>
              <span className="text-xs font-mono text-slate-400 block">
                {passport.cost_per_sqm_kzt.toLocaleString('ru-RU')} ₸/м² · Срок: ~{passport.total_timeline_days} дней
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenWorkBrief}
              className="btn-press min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-obsidian-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-sky-500/20 active:scale-[0.98] cursor-pointer transition-all"
            >
              <FileSignature className="w-4 h-4 fill-obsidian-950" />
              <span>Открыть WorkBrief Rev 1.0</span>
            </button>
          </div>
        </div>

        {/* 5 Agent Sign-Off Stamps */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Электронные подписи роя специализированных инженеров:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {passport.participating_agents.map((agent) => (
              <div
                key={agent.agentCode}
                className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between gap-2"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[10px] font-mono font-bold text-sky-400 truncate">
                    {agent.agentCode}
                  </div>
                  <div className="text-xs font-bold text-white truncate">{agent.agentName}</div>
                  <div className="text-[9px] font-mono text-slate-400 truncate">{agent.agentRole}</div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> OK
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE A-Z STEPPER TABS (SINGLE ACCENT DISCIPLINE)
          ========================================================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1.5 rounded-2xl bg-black/60 border border-white/[0.08]">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.num;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.num)}
              className={`btn-press min-h-[42px] px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-mono whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500 text-black font-black shadow-lg shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-sky-400'}`} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: ОБЪЕМЫ, ПАСПОРТ И СТРОИТЕЛЬНАЯ ФИЗИКА
          ========================================================================= */}
      {activeStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Физические инварианты */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Площадь пола</span>
              <div className="text-lg font-black font-mono tabular-nums text-white">{passport.floor_area_sqm} м²</div>
              <span className="text-[9px] font-mono text-emerald-400">Высота: {passport.ceiling_height_m} м</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Развертка стен</span>
              <div className="text-lg font-black font-mono tabular-nums text-white">{passport.explication.plaster.plaster_walls_area_sqm} м²</div>
              <span className="text-[9px] font-mono text-slate-400">Толщина слоя: 16 мм</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Смесь Knauf Ротбанд</span>
              <div className="text-lg font-black font-mono tabular-nums text-amber-300">{passport.explication.plaster.dry_mix_rotband_bags_30kg} меш.</div>
              <span className="text-[9px] font-mono text-slate-400">{passport.explication.plaster.dry_mix_rotband_kg.toLocaleString('ru-RU')} кг смеси</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Электроточек / Кабель</span>
              <div className="text-lg font-black font-mono tabular-nums text-sky-300">{passport.electrical_panel.circuit_groups.length} групп</div>
              <span className="text-[9px] font-mono text-slate-400">Кабель ВВГнг-LS: ~450 м</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Трубы Rehau Rautitan</span>
              <div className="text-lg font-black font-mono tabular-nums text-teal-300">{passport.plumbing_unit.pipe_total_length_m} м.п.</div>
              <span className="text-[9px] font-mono text-emerald-400">0 стыков в стяжке ✓</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Объем демонтажа</span>
              <div className="text-lg font-black font-mono tabular-nums text-rose-300">{passport.explication.demolition.debris_weight_tonnes} т</div>
              <span className="text-[9px] font-mono text-slate-400">{passport.explication.demolition.truckloads_gazelle_1_5t} рейса Газели</span>
            </div>
          </div>

          {/* Детализация строительной физики: Демонтаж, Газоблок, Штукатурка */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Карточка 1: Физика демонтажа */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                <Flame className="w-4 h-4" />
                <span>Физика безопасного демонтажа</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Длина сносимых перегородок:</span>
                  <span className="font-mono font-bold text-white">{passport.explication.demolition.partitions_length_m} м.п.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Объем строительного боя:</span>
                  <span className="font-mono font-bold text-white">{passport.explication.demolition.debris_volume_m3} м³</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Количество мешков по 40 кг:</span>
                  <span className="font-mono font-bold text-amber-300">{passport.explication.demolition.bags_count_40kg} мешков</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200">
                <strong>Категорический запрет:</strong> монолитный пилон в центре квартиры защищен от любых механических воздействий.
              </div>
            </div>

            {/* Карточка 2: Физика возведения стен */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-bold uppercase">
                <HardHat className="w-4 h-4" />
                <span>Кладка газоблока D500</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Материал блока:</span>
                  <span className="font-mono text-white text-[11px]">{passport.explication.erection.block_type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Количество блоков (600х300х100):</span>
                  <span className="font-mono font-bold text-white">{passport.explication.erection.blocks_count_pcs} шт. (+5% запас)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Клей тонкошовный (25 кг):</span>
                  <span className="font-mono font-bold text-white">{passport.explication.erection.thin_bed_glue_bags_25kg} меш.</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-200">
                <strong>Акустический узел:</strong> базальтовая сетка каждые 3 ряда + виброкомпенсационный зазор под потолком 30 мм.
              </div>
            </div>

            {/* Карточка 3: Высококачественная штукатурка по маякам */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Геометрия по СНиП 3.04.01-87</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Допуск вертикали:</span>
                  <span className="font-mono font-bold text-emerald-300">≤ 1.0 мм / метр</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Углы ровно 90.0°:</span>
                  <span className="font-mono font-bold text-white">Кухня, санузел, гардероб</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span className="text-slate-400">Физический слой съедает:</span>
                  <span className="font-mono font-bold text-amber-300">-{passport.explication.plaster.floor_area_loss_from_geometry_sqm} м² пола</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200">
                <strong>Инженерный контроль:</strong> демонтаж оцинкованных маяков обязателен для исключения ржавчины на обоях.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ВЕКТОРНЫЙ 2D CAD ПЛАН И ЭКСПЛИКАЦИЯ
          ========================================================================= */}
      {activeStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ArchitecturalFloorPlan
            areaSqm={passport.floor_area_sqm}
            renovationType={passport.renovation_type}
            city={passport.city}
          />

          {/* Таблица экспликации ДО и ПОСЛЕ */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white">Сравнительная экспликация помещений (БТИ vs AI-Проект)</h4>
                <p className="text-xs text-slate-400">Прирост полезного объема квартиры: <strong>+{passport.explication.net_usable_gain_sqm} м² (+{passport.explication.net_usable_gain_pct}%)</strong></p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                {passport.explication.legal_compliance_status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Экспликация ДО */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-rose-300 block">Типовой план застройщика (БТИ):</span>
                <div className="space-y-1.5">
                  {passport.explication.rooms_before.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-slate-300">{r.name}</div>
                        <div className="text-[10px] text-slate-500">{r.defects[0]}</div>
                      </div>
                      <span className="font-mono font-bold text-slate-300 tabular-nums">{r.area_sqm} м²</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Экспликация ПОСЛЕ */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-300 block">AI-Архитектурный проект (Marina · AGT-03):</span>
                <div className="space-y-1.5">
                  {passport.explication.rooms_after.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{r.name}</div>
                        <div className="text-[10px] text-emerald-400/90">{r.normative_justification}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-400 tabular-nums block">{r.area_sqm} м²</span>
                        <span className="text-[10px] font-mono text-emerald-300">+{r.gain_vs_bti_sqm} м²</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 14 ГРУПП ЭЛЕКТРОЩИТА ЩР-36 И САНТЕХНИКА REHAU
          ========================================================================= */}
      {activeStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Секция электрощита ЩР-36 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">ЭОМ & Автоматика</span>
                  <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full">
                    {passport.electrical_panel.panel_model}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">14 независимых групп силового электрощита</h4>
                <p className="text-xs text-slate-300">
                  Установленная мощность: <strong>{passport.electrical_panel.total_installed_power_kw} кВт</strong> · 
                  Реле напряжения <strong>{passport.electrical_panel.voltage_relay}</strong> · 
                  Кнопка <strong>{passport.electrical_panel.master_switch_automation}</strong>.
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block">Емкость модулей DIN:</span>
                <span className="text-lg font-black text-sky-400">
                  {passport.electrical_panel.occupied_din_modules} / {passport.electrical_panel.total_din_modules_capacity} (Резерв {passport.electrical_panel.reserve_din_modules})
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">№</th>
                    <th className="py-2.5 px-3">Наименование линии</th>
                    <th className="py-2.5 px-3">Кабель ГОСТ</th>
                    <th className="py-2.5 px-3">Автомат</th>
                    <th className="py-2.5 px-3">Защита УЗО</th>
                    <th className="py-2.5 px-3">Режим</th>
                    <th className="py-2.5 px-3 text-right">Норматив ПУЭ РК</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] font-mono text-[11px]">
                  {passport.electrical_panel.circuit_groups.map((grp) => (
                    <tr key={grp.group_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2 px-3 text-slate-400">0{grp.circuit_number}</td>
                      <td className="py-2 px-3 font-sans font-medium text-white">{grp.name}</td>
                      <td className="py-2 px-3 text-sky-300 font-bold">{grp.cable_cross_section} ({grp.cable_length_estimate_m}м)</td>
                      <td className="py-2 px-3 text-slate-200">{grp.breaker_rating}</td>
                      <td className="py-2 px-3">
                        {grp.rcd_type ? (
                          <span className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">
                            {grp.rcd_type}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {grp.is_uninterruptible ? (
                          <span className="text-amber-300 font-bold">Неотключаемая</span>
                        ) : (
                          <span className="text-slate-400">Мастер-свет</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-[10px] text-slate-400 font-sans">{grp.normative_pue_clause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Секция сантехнического коллектора Far / Rehau */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">ВК & Сантехника</span>
                  <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-full">
                    {passport.plumbing_unit.manifold_brand}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Лучевой коллектор Rehau Rautitan Stabil без стыков в полу</h4>
                <p className="text-xs text-slate-300">
                  ХВС: {passport.plumbing_unit.cold_water_outlets_count} выходов · ГВС: {passport.plumbing_unit.hot_water_outlets_count} выходов · 
                  Датчиков протечки Neptun: {passport.plumbing_unit.sensors_count} шт. · Сухих гидрозатворов: {passport.plumbing_unit.dry_hydroseals.length} шт.
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block">Скрытых соединений в стяжке:</span>
                <span className="text-lg font-black text-emerald-400">СТРОГО 0 СТЫКОВ ✓</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-teal-300 font-bold block">Антизатопление Neptun:</span>
                <p className="text-slate-300 text-[11px]">{passport.plumbing_unit.anti_flood_system}</p>
                <div className="text-[10px] text-slate-400">Время перекрытия кранов Bugatti: 18 секунд</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-sky-300 font-bold block">Сухие гидрозатворы (Защита запаха):</span>
                <ul className="text-slate-300 text-[11px] space-y-0.5 list-disc pl-3.5">
                  {passport.plumbing_unit.dry_hydroseals.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-emerald-300 font-bold block">Опрессовка давлением:</span>
                <p className="text-slate-300 text-[11px]">{passport.plumbing_unit.pressure_test_standard}</p>
                <div className="text-[10px] text-emerald-400">Акт АОСР оформляется до заливки стяжки</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: СМЕТА РИТЕЙЛА 12 МЕСЯЦЕВ / KASPI И ЛОГИСТИКА
          ========================================================================= */}
      {activeStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Сводка логистики и заноса */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white">Логистика и подъем грузов ({passport.city})</h4>
                <p className="text-xs text-slate-300">
                  Суммарная масса материалов: <strong>{passport.logistics.totalWeightTons} тонн</strong> ({passport.logistics.totalWeightKg.toLocaleString('ru-RU')} кг). 
                  Транспорт: <strong>{passport.logistics.deliveryVehicleType}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <label className="text-slate-400">Грузовой лифт:</label>
                <input
                  type="checkbox"
                  checked={liftHasElevator}
                  onChange={(e) => setLiftHasElevator(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {!liftHasElevator && (
                <div className="flex items-center gap-1.5">
                  <label className="text-slate-400">Этаж:</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={targetFloor}
                    onChange={(e) => setTargetFloor(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 px-2 py-1 rounded bg-black border border-white/20 text-white font-mono"
                  />
                </div>
              )}

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Стоимость логистики:</span>
                <span className="text-base font-black text-emerald-400 tabular-nums">
                  {(passport.logistics.autoDeliveryCostKzt + dynamicLiftingCost).toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </div>
          </div>

          {/* Фильтры и таблица BOQ */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="space-y-0.5">
                <h4 className="text-base font-bold text-white">Спецификация закупок без прорабской наценки (+0%)</h4>
                <p className="text-xs text-slate-300">
                  Прямые ссылки на гипермаркеты Казахстана. Заказчик оплачивает материалы напрямую по чекам.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {['all', 'mixes', 'electrical', 'plumbing', 'finish'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBoqFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      boqFilterCategory === cat
                        ? 'border-sky-500/50 bg-sky-500/20 text-sky-300 font-bold'
                        : 'border-white/[0.08] bg-black/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Все' : cat === 'mixes' ? 'Смеси' : cat === 'electrical' ? 'Электрика' : cat === 'plumbing' ? 'Сантехника' : 'Чистовые'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Материал / Артикул</th>
                    <th className="py-2.5 px-3">Магазин</th>
                    <th className="py-2.5 px-3">Кол-во</th>
                    <th className="py-2.5 px-3">Цена за ед.</th>
                    <th className="py-2.5 px-3">Сумма</th>
                    <th className="py-2.5 px-3 text-right">Ссылка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] font-mono text-[11px]">
                  {filteredBoq.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 space-y-0.5">
                        <div className="font-sans font-medium text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{item.specification}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.08]">
                          <Store className="w-3 h-3 text-sky-400" />
                          {item.storeName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-white font-bold">
                        {item.requiredQty} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 tabular-nums">
                        {item.unitPriceKzt.toLocaleString('ru-RU')} ₸
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-emerald-400 font-bold tabular-nums">
                        {item.totalCostKzt.toLocaleString('ru-RU')} ₸
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <a
                          href={item.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-press inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/[0.05] hover:bg-emerald-500 hover:text-black text-sky-300 text-xs transition-all cursor-pointer"
                        >
                          <span>Купить</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: КАЛЕНДАРНЫЙ ГРАФИК ГАНТА И СУШКА СТЯЖКИ (28 ДНЕЙ)
          ========================================================================= */}
      {activeStep === 5 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">Критический путь</span>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    28 дней сушки по СНиП
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Календарный технологический график выполнения работ</h4>
                <p className="text-xs text-slate-300">
                  Общая длительность проекта: <strong>~{passport.gantt_schedule.total_days} календарных дней</strong>. 
                  Каждый переход между этапами сопровождается оформлением обязательных актов АОСР.
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block">Инвариант прочности:</span>
                <span className="text-base font-black text-amber-400">Гидратация стяжки 28 дней ✓</span>
              </div>
            </div>

            {/* Визуальная лента Ганта */}
            <div className="space-y-3 pt-2">
              {passport.gantt_schedule.stages.map((stg) => {
                const isDryingStage = stg.stage_number === 3;
                return (
                  <div
                    key={stg.stage_id}
                    className={`p-4 rounded-xl border transition-all ${
                      isDryingStage
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-[#0b0e17]/80 border-white/[0.08]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isDryingStage
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          Дни {stg.start_day}–{stg.end_day} ({stg.duration_days} дн.)
                        </span>
                        <h5 className="text-sm font-bold text-white">{stg.title}</h5>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {stg.snip_standard}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="space-y-1 text-slate-300">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Операционные процессы:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {stg.tasks.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                          <span className="text-[10px] font-mono text-amber-300 block font-bold">
                            Контрольная точка технадзора:
                          </span>
                          <p className="text-[11px] text-slate-300 font-sans">{stg.mandatory_milestone_check}</p>
                          <div className="text-[10px] font-mono text-emerald-400 pt-0.5">
                            {stg.acts_aosr_required.join(' · ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: 4 БЕЗОПАСНЫХ ТРАНША ОПЛАТЫ ПО КС-2 (0% АВАНС)
          ========================================================================= */}
      {activeStep === 6 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Эскроу и КС-2 / КС-3</span>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    0% аванс на работы
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Оплата только после инструментальной приёмки инженером</h4>
                <p className="text-xs text-slate-300">
                  Деньги депонируются в банке. Выплата каждого транша происходит строго после подписания формы КС-2 и актов АОСР. 
                  10% удерживаются в гарантийный резерв до окончания срока службы.
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block">Фонд оплаты труда мастеров:</span>
                <span className="text-xl font-black text-emerald-400 tabular-nums">
                  {passport.financial_tranches.total_labor_escrow_kzt.toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {passport.financial_tranches.tranches.map((tranche) => (
                <div
                  key={tranche.tranche_id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${
                    tranche.status === 'COMPLETED'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : tranche.status === 'ACTIVE_ESCROW'
                      ? 'bg-sky-950/30 border-sky-500/40 shadow-lg shadow-sky-950/40'
                      : 'bg-[#0b0e17]/80 border-white/[0.08]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {tranche.share_pct}% ФОТ
                      </span>
                      {tranche.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Выплачено
                        </span>
                      ) : tranche.status === 'ACTIVE_ESCROW' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded font-bold animate-pulse">
                          <Unlock className="w-2.5 h-2.5 text-sky-400" /> В работе
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" /> Заморожен
                        </span>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-white leading-snug">{tranche.title}</h5>
                      <div className="text-lg font-black font-mono tabular-nums text-white mt-1">
                        {tranche.amount_kzt.toLocaleString('ru-RU')} ₸
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                        К выплате: {tranche.payout_after_inspection_kzt.toLocaleString('ru-RU')} ₸ (90%)
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {tranche.inspection_criteria}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.06] space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Форма:</span>
                      <span className="text-amber-300 font-semibold">{tranche.ks2_form}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Резерв (10%):</span>
                      <span className="text-slate-300">{tranche.retention_amount_kzt.toLocaleString('ru-RU')} ₸</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: 7 ПАРИРОВАННЫХ ЛОВУШЕК И ГАРАНТИЙНЫЙ ПАСПОРТ ДО 5 ЛЕТ
          ========================================================================= */}
      {activeStep === 7 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Гарантийный паспорт объекта */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">ГК РК ст. 665</span>
                  <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                    Гарантия до 60 месяцев (5 лет)
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Официальный Гарантийный Паспорт объекта</h4>
                <p className="text-xs text-slate-300">
                  Номер паспорта: <strong>{passport.warranty.passportNumber}</strong> · 
                  Аварийный выезд эксперта: <strong>в течение {passport.warranty.slaResponseEmergencyHours} часов</strong>.
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block">Финансовый эскроу-депозит:</span>
                <span className="text-base font-black text-emerald-400 tabular-nums">
                  {passport.warranty.retentionEscrowBalanceKzt.toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-emerald-300 font-bold block">12 месяцев (Финишные покрытия):</span>
                <p className="text-[11px] text-slate-300">Малярные работы, плинтусы, герметизация санитарных приборов, фурнитура дверей.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-sky-300 font-bold block">36 месяцев (Базовые конструкции):</span>
                <p className="text-[11px] text-slate-300">Монолитная и наливная стяжка пола, штукатурка стен по маякам, гидроизоляционный ковер.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-purple-300 font-bold block">60 месяцев (Скрытая инженерия):</span>
                <p className="text-[11px] text-slate-300">Силовые кабели ГОСТ ВВГнг-LS, электрощит ЩР-36, разводка труб Rehau Rautitan Stabil без стыков.</p>
              </div>
            </div>
          </div>

          {/* Таблица 7 парированных ловушек */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h4 className="text-base font-bold text-white">Матрица парирования 7 критических строительных рисков</h4>
                <p className="text-xs text-slate-400">Суммарный предотвращенный финансовый ущерб: <strong className="text-rose-400">+{passport.avoided_risk_total_kzt.toLocaleString('ru-RU')} ₸</strong></p>
              </div>
              <span className="text-xs font-mono text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full font-bold">
                Все 7 рисков парированы ✓
              </span>
            </div>

            <div className="space-y-2.5">
              {passport.financial_tranches.traps.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-mono font-bold">№0{t.trapNumber}</span>
                      <span className="font-bold text-white text-xs">{t.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">({t.normativeViolation})</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 font-mono">Опасность: {t.contractorTrapWarning}</p>
                    <p className="text-[11px] text-emerald-300">Решение: {t.engineeringParrySolution}</p>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-[10px] text-slate-400 block">Экономия заказчика:</span>
                    <span className="text-sm font-bold text-rose-400 tabular-nums">
                      +{t.preventedDamageAmountKzt.toLocaleString('ru-RU')} ₸
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

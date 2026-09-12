'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalculatedQuantities, 
  EngineeringSolution, 
  WorkBreakdownStage, 
  AgentLoopStep, 
  SkepticVerdict, 
  MarketScrapedItem, 
  ProjectBlueprint, 
  SpecializedAgentStage, 
  calculateConstructionQuantities, 
  generateSkepticVerdicts, 
  generateMarketScrapedMaterials, 
  generateProjectBlueprints, 
  generateSpecializedAgentStages 
} from '@/core/tools/engineering-engine';
import { ArchitecturalFloorPlan } from '@/components/ArchitecturalFloorPlan';
import { BenchmarkFoundationView } from '@/components/BenchmarkFoundationView';
import { 
  Cpu, 
  Zap, 
  Ruler, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Sparkles, 
  Box, 
  Check, 
  FileText, 
  Clock, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  HelpCircle, 
  Shield, 
  FileSignature, 
  FileSpreadsheet, 
  Scale, 
  Flame, 
  HardHat, 
  Lock, 
  ShoppingCart, 
  Store, 
  TrendingDown, 
  Tag, 
  Compass, 
  Building2, 
  BadgePercent, 
  CheckCheck, 
  Wrench, 
  ShieldAlert 
} from 'lucide-react';

interface AgentSolutionsViewProps {
  quantities?: CalculatedQuantities;
  solutions?: EngineeringSolution[];
  workBreakdown?: WorkBreakdownStage[];
  loopSteps?: AgentLoopStep[];
  skepticVerdicts?: SkepticVerdict[];
  marketMaterials?: MarketScrapedItem[];
  projectBlueprints?: ProjectBlueprint[];
  specializedStages?: SpecializedAgentStage[];
  city?: string;
  onOpenWorkBrief?: () => void;
}

export const AgentSolutionsView: React.FC<AgentSolutionsViewProps> = ({
  quantities,
  solutions,
  workBreakdown,
  loopSteps,
  skepticVerdicts: propSkepticVerdicts,
  marketMaterials: propMarketMaterials,
  projectBlueprints: propProjectBlueprints,
  specializedStages: propSpecializedStages,
  city = 'Астана',
  onOpenWorkBrief,
}) => {
  // Active Project Blueprint: 'proj-base' | 'proj-optimal' | 'proj-premium'
  const [selectedProjectId, setSelectedProjectId] = useState<'proj-base' | 'proj-optimal' | 'proj-premium'>('proj-optimal');
  
  // Active Specialized Agent Stage (1..5)
  const [selectedAgentStage, setSelectedAgentStage] = useState<number>(2); // Default to Scraper Agent (Stage 2)
  
  // Material category filter
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>('all');

  // Solutions category filter
  const [selectedSolutionCategory, setSelectedSolutionCategory] = useState<string>('all');
  
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [showSkeptics, setShowSkeptics] = useState<boolean>(true);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  
  // Hero Tab Switcher: 'overview' | 'blueprint' | 'benchmark'
  const [heroTab, setHeroTab] = useState<'overview' | 'blueprint' | 'benchmark'>('blueprint');

  // Interactive Live Calculator state
  const [interactiveArea, setInteractiveArea] = useState<number>(quantities?.floor_area_sqm || 58);
  const [interactiveHeight, setInteractiveHeight] = useState<number>(2.7);
  const [interactiveType, setInteractiveType] = useState<'rough' | 'whitebox' | 'secondary'>('rough');

  // Sync state dynamically when props update from orchestrator (e.g. preset selection or new text query)
  useEffect(() => {
    if (quantities?.floor_area_sqm) {
      setInteractiveArea(quantities.floor_area_sqm);
    }
    if (quantities?.ceiling_height_m) {
      setInteractiveHeight(quantities.ceiling_height_m);
    }
    if (quantities?.renovation_type) {
      setInteractiveType(quantities.renovation_type);
    }
  }, [quantities?.floor_area_sqm, quantities?.ceiling_height_m, quantities?.renovation_type]);

  // Expanded schematics per solution
  const [expandedDiagrams, setExpandedDiagrams] = useState<Record<string, boolean>>({
    'sol-elec-1': true,
  });

  // Solutions included in WorkBrief
  const [appliedSolutions, setAppliedSolutions] = useState<Record<string, boolean>>({
    'sol-elec-1': true,
    'sol-screed-2': true,
    'sol-plumb-3': true,
    'sol-legal-4': true,
  });

  // Skeptic traps neutralized
  const [neutralizedTraps, setNeutralizedTraps] = useState<Record<string, boolean>>({
    'skep-price-1': true,
    'skep-tech-2': true,
    'skep-legal-3': true,
  });

  // Re-calculate quantities dynamically based on interactiveArea and interactiveType
  const dynamicQuantities = useMemo(() => {
    return calculateConstructionQuantities(interactiveArea, interactiveHeight, interactiveType);
  }, [interactiveArea, interactiveHeight, interactiveType]);

  // Project Blueprints (dynamically recalculated on area AND renovationType change)
  const dynamicProjects = useMemo(() => {
    return generateProjectBlueprints(interactiveArea, interactiveType);
  }, [interactiveArea, interactiveType]);

  const activeProject = useMemo(() => {
    return dynamicProjects.find((p) => p.id === selectedProjectId) || dynamicProjects[1];
  }, [dynamicProjects, selectedProjectId]);

  // Market Scraped Materials (dynamically recalculated on area change)
  const dynamicMaterials = useMemo(() => {
    return generateMarketScrapedMaterials(interactiveArea, 'all');
  }, [interactiveArea]);

  const filteredMaterials = useMemo(() => {
    if (selectedMaterialCategory === 'all') return dynamicMaterials;
    return dynamicMaterials.filter((m) => m.category === selectedMaterialCategory);
  }, [dynamicMaterials, selectedMaterialCategory]);

  const totalMaterialsSumKzt = useMemo(() => {
    return filteredMaterials.reduce((sum, item) => sum + item.totalCostKzt, 0);
  }, [filteredMaterials]);

  // Specialized Agent Stages
  const dynamicAgentStages = useMemo(() => {
    return generateSpecializedAgentStages(interactiveArea, city);
  }, [interactiveArea, city]);

  const activeStage = useMemo(() => {
    return dynamicAgentStages.find((s) => s.agentNumber === selectedAgentStage) || dynamicAgentStages[1];
  }, [dynamicAgentStages, selectedAgentStage]);

  // Skeptics list (dynamic based on current area)
  const dynamicSkeptics = useMemo(() => {
    return propSkepticVerdicts || generateSkepticVerdicts(interactiveArea, 'квартира');
  }, [propSkepticVerdicts, interactiveArea]);

  const filteredSolutions = solutions?.filter((s) => 
    selectedSolutionCategory === 'all' ? true : s.category === selectedSolutionCategory
  ) || [];

  const toggleDiagram = (solId: string) => {
    setExpandedDiagrams((prev) => ({ ...prev, [solId]: !prev[solId] }));
  };

  const toggleSolutionApplied = (solId: string) => {
    setAppliedSolutions((prev) => ({ ...prev, [solId]: !prev[solId] }));
  };

  const toggleTrapNeutralized = (trapId: string) => {
    setNeutralizedTraps((prev) => ({ ...prev, [trapId]: !prev[trapId] }));
  };

  const totalSkepticsSavedKzt = useMemo(() => {
    return dynamicSkeptics
      .filter((v) => neutralizedTraps[v.id])
      .reduce((acc, v) => acc + (v.riskAmountKzt || 0), 0);
  }, [dynamicSkeptics, neutralizedTraps]);

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="solutions-section" className="space-y-8 text-slate-100 scroll-mt-20">
      {/* =========================================================================
          SECTION 1: THE SINGLE CLEAR BOTTOM-LINE ANSWER (ИТОГОВЫЙ ИНЖЕНЕРНЫЙ ВЕРДИКТ)
          ========================================================================= */}
      <div className="specular-card rounded-3xl p-5 sm:p-7 border-2 border-amber-500/40 bg-gradient-to-b from-[#121624] via-[#0b0e17] to-[#07090e] shadow-[0_0_50px_rgba(245,158,11,0.12)] space-y-6">
        {/* Header Badge & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Единый итоговый вердикт по объекту
              </span>
              <span className="text-xs font-mono text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/[0.08]">
                {city} · {interactiveArea} м² · 5 Агентов в контуре
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Готовое решение: 3 сценария ремонта с реальными ценами магазинов
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              Никакой неопределенности: рассчитана смета материалов по каталогам <strong>12 Месяцев</strong> и <strong>Kaspi</strong>, 
              зафиксирована стоимость квалифицированных работ по СН РК и парированы скрытые ловушки подрядчиков на <strong>{totalSkepticsSavedKzt.toLocaleString('ru-RU')} ₸</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenWorkBrief && (
              <button
                onClick={onOpenWorkBrief}
                className="btn-press flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-obsidian-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <FileSignature className="w-4 h-4" />
                <span>Зафиксировать цену в ТЗ</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Project Selector Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Выберите проектный сценарий для мгновенного пересчёта:
            </span>
            <span className="text-[11px] text-amber-300 font-semibold">
              Цены из чеков магазинов обновлены сегодня ✓
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {dynamicProjects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`btn-press p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-2 ring-amber-400/40'
                      : 'bg-black/40 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${proj.badgeColor}`}>
                        {proj.badge}
                      </span>
                      {proj.isRecommended && (
                        <span className="text-[9px] font-mono bg-amber-500 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                          Выбор инженера
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{proj.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{proj.tagline}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black font-mono text-white">
                        {proj.totalCostKzt.toLocaleString('ru-RU')} ₸
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {proj.costPerSqmKzt.toLocaleString('ru-RU')} ₸/м²
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Срок: ~{proj.timelineDays} дней</span>
                      <span>Гарантия: {proj.warrantyMonths} мес.</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Hero Sub-Views Switcher: Overview / Blueprint / Benchmark */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs">
              <button
                type="button"
                onClick={() => setHeroTab('blueprint')}
                className={`btn-press px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  heroTab === 'blueprint'
                    ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-obsidian-950 font-bold shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>📐 Архитектурный 2D-проект</span>
              </button>

              <button
                type="button"
                onClick={() => setHeroTab('overview')}
                className={`btn-press px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  heroTab === 'overview'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-obsidian-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>📊 Смета проекта</span>
              </button>

              <button
                type="button"
                onClick={() => setHeroTab('benchmark')}
                className={`btn-press px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  heroTab === 'benchmark'
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-obsidian-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>⚖️ От чего отталкивается расчёт</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Выбран проект: <strong className="text-amber-300">{activeProject.name}</strong> · {interactiveArea} м² ({interactiveType === 'rough' ? 'Черновая' : interactiveType === 'whitebox' ? 'White Box' : 'Вторичка'})
            </span>
          </div>
        </div>

        {/* Dynamic Hero Sub-View Content */}
        {heroTab === 'blueprint' && (
          <ArchitecturalFloorPlan
            areaSqm={interactiveArea}
            renovationType={interactiveType}
            city={city}
          />
        )}

        {heroTab === 'benchmark' && (
          <BenchmarkFoundationView
            areaSqm={interactiveArea}
            renovationType={interactiveType}
            selectedTierId={selectedProjectId === 'proj-base' ? 'minimal' : selectedProjectId === 'proj-premium' ? 'premium' : 'optimal'}
            onSelectTier={(tierId) => {
              setSelectedProjectId(tierId === 'minimal' ? 'proj-base' : tierId === 'premium' ? 'proj-premium' : 'proj-optimal');
            }}
          />
        )}

        {heroTab === 'overview' && (
          /* Selected Project Full Breakdown Card */
          <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/[0.1] space-y-5">
            {/* Key Numbers Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Итого бюджет под ключ:
                </span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-300 block">
                  {activeProject.totalCostKzt.toLocaleString('ru-RU')} ₸
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Фиксация цены в договоре
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Материалы из магазинов:
                </span>
                <span className="text-lg sm:text-xl font-black font-mono text-sky-400 block">
                  {activeProject.materialsCostKzt.toLocaleString('ru-RU')} ₸
                </span>
                <span className="text-[10px] text-sky-300/80 block">
                  Чеки 12 Месяцев & Kaspi
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Оплата работ мастеров:
                </span>
                <span className="text-lg sm:text-xl font-black font-mono text-emerald-400 block">
                  {activeProject.laborCostKzt.toLocaleString('ru-RU')} ₸
                </span>
                <span className="text-[10px] text-emerald-300/80 block">
                  Поэтапно за 4 акта АОСР
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                <span className="text-[10px] font-mono uppercase text-rose-300 block">
                  Сэкономлено от обмана:
                </span>
                <span className="text-lg sm:text-xl font-black font-mono text-rose-400 block">
                  +{totalSkepticsSavedKzt.toLocaleString('ru-RU')} ₸
                </span>
                <span className="text-[10px] text-rose-300/80 block">
                  Щит 3 Агентов-Скептиков
                </span>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Left: Spatial Layout & Architecture */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                <span className="text-[11px] font-mono text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  Планировка, экспликация и зонирование:
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {activeProject.roomsLayout}
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {activeProject.architecturalSummary}
                </p>
                <div className="pt-2 border-t border-white/[0.05] text-[11px] text-slate-300">
                  <strong className="text-white font-mono">Для кого:</strong> {activeProject.suitableFor}
                </div>
              </div>

              {/* Right: Key Engineering Features */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Инженерный пакет безопасности:
                </span>
                <ul className="space-y-1.5 text-slate-200">
                  {activeProject.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('market-materials-section')}
                  className="btn-press flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-sky-400" />
                  <span>Смотреть смету со ссылками на магазины ↓</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('five-agents-section')}
                  className="btn-press flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-medium cursor-pointer"
                >
                  <span>Этапы 5 агентов</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                Гарантия по договору: <strong>{activeProject.warrantyMonths} месяцев</strong> · Официальный акт приемки
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: DEDICATED ARCHITECTURAL 2D BLUEPRINT (ВИЗУАЛЬНЫЙ ЧЕРТЁЖ И ПЛАНИРОВКА)
          ========================================================================= */}
      {heroTab !== 'blueprint' && (
        <div id="architectural-project-section" className="scroll-mt-20">
          <ArchitecturalFloorPlan
            areaSqm={interactiveArea}
            renovationType={interactiveType}
            city={city}
          />
        </div>
      )}

      {/* =========================================================================
          SECTION 3: BENCHMARK BASELINE & 3-TIER PERFORMANCE (ОТ ЧЕГО ОТТАЛКИВАЕТСЯ РАСЧЁТ)
          ========================================================================= */}
      {heroTab !== 'benchmark' && (
        <div id="benchmark-section" className="scroll-mt-20">
          <BenchmarkFoundationView
            areaSqm={interactiveArea}
            renovationType={interactiveType}
            selectedTierId={selectedProjectId === 'proj-base' ? 'minimal' : selectedProjectId === 'proj-premium' ? 'premium' : 'optimal'}
            onSelectTier={(tierId) => {
              setSelectedProjectId(tierId === 'minimal' ? 'proj-base' : tierId === 'premium' ? 'proj-premium' : 'proj-optimal');
            }}
          />
        </div>
      )}

      {/* =========================================================================
          SECTION 4: 5 SPECIALIZED AGENTS PIPELINE (ПО КАЖДОМУ ЭТАПУ ИЗУЧАЕТСЯ, СТРЕМИТСЯ И РЕШАЕТСЯ)
          ========================================================================= */}
      <div id="five-agents-section" className="specular-card rounded-3xl p-5 sm:p-7 space-y-5 border border-white/[0.08] bg-[#090c14] scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider font-bold block">
                Autonomous 5-Agent Collaborative Pipeline
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                5 специализированных ролей
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 font-sans">
              Конвейер 5 Агентов: Что изучается, решается и какие ссылки подтягиваются
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Каждый этап валидируется нормативами РК и рыночными ценами
          </span>
        </div>

        {/* 5 Agent Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {dynamicAgentStages.map((stg) => {
            const isSelected = selectedAgentStage === stg.agentNumber;
            return (
              <button
                key={stg.id}
                onClick={() => setSelectedAgentStage(stg.agentNumber)}
                className={`btn-press p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.25)] ring-1 ring-sky-400/40'
                    : 'bg-black/40 border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono font-bold text-sky-400">
                    ЭТАП 0{stg.agentNumber}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block truncate">
                    {stg.agentName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                    {stg.agentCode}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Agent Inspector Card */}
        {activeStage && (
          <div className="p-4 sm:p-6 rounded-2xl bg-black/60 border border-sky-500/30 space-y-4">
            {/* Header with Role and Code */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base border shrink-0 ${activeStage.avatarBg}`}>
                  {activeStage.agentNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400">{activeStage.agentCode}</span>
                    <span className="text-[10px] font-mono bg-white/[0.05] text-slate-300 px-2 py-0.5 rounded border border-white/[0.08]">
                      Статус: ВЫПОЛНЕНО ✓
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">{activeStage.stageTitle}</h4>
                </div>
              </div>

              {/* Regulatory & Store Links */}
              <div className="flex flex-wrap items-center gap-1.5">
                {activeStage.links.map((lnk, lIdx) => (
                  <a
                    key={lIdx}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-press text-[10px] font-mono bg-white/[0.06] hover:bg-white/[0.12] text-sky-300 border border-white/[0.1] px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{lnk.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-sky-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Two-Column Deep Dive: What was studied vs What was solved */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                  🔍 ЧТО ИЗУЧАЕТ АГЕНТ:
                </span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {activeStage.whatStudied}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">
                  ⚡ КАКУЮ ПРОБЛЕМУ РЕШАЕТ:
                </span>
                <p className="text-slate-200 font-sans text-xs leading-relaxed">
                  {activeStage.whatSolved}
                </p>
              </div>
            </div>

            {/* Deliverable Result Banner */}
            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-mono text-sky-300 font-semibold flex items-center gap-1.5">
                <FileCheckIcon className="w-4 h-4 text-sky-400" />
                Готовый артефакт этапа: <strong>{activeStage.deliverableTitle}</strong>
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-black/40 px-2.5 py-1 rounded border border-emerald-500/30">
                {activeStage.deliverableValue}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: MARKET SCRAPER AGENT WITH REAL PRODUCT LINKS (СКРАПЕР-АГЕНТ ЦЕН)
          ========================================================================= */}
      <div id="market-materials-section" className="specular-card rounded-3xl p-5 sm:p-7 space-y-5 border border-emerald-500/30 bg-gradient-to-b from-[#091512] via-[#080d12] to-[#07090e] scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  Scraper Agent · Market Procurement Radar
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  Цены актуализированы сегодня ✓
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1 font-sans">
                Смета материалов от Скрапер-Агента с прямыми ссылками на магазины
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Агент спарсил каталоги <strong>12 Месяцев</strong>, <strong>Kaspi Магазин</strong>, <strong>Строймарт</strong> и <strong>Лемана ПРО</strong> в Астане. Все товары в наличии.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 shrink-0">
            <span className="text-xs font-mono text-slate-400">Сумма корзины материалов:</span>
            <span className="text-xl font-black font-mono text-emerald-400">
              {totalMaterialsSumKzt.toLocaleString('ru-RU')} ₸
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `Все материалы (${dynamicMaterials.length})` },
            { id: 'electrical', label: `Электромонтаж (${dynamicMaterials.filter(m => m.category === 'electrical').length})` },
            { id: 'mixes', label: `Смеси и полы (${dynamicMaterials.filter(m => m.category === 'mixes').length})` },
            { id: 'plumbing', label: `Сантехника и ОВК (${dynamicMaterials.filter(m => m.category === 'plumbing').length})` },
            { id: 'insulation', label: `Изоляция (${dynamicMaterials.filter(m => m.category === 'insulation').length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedMaterialCategory(cat.id)}
              className={`btn-press px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-all ${
                selectedMaterialCategory === cat.id
                  ? 'bg-emerald-500 text-obsidian-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Materials Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/50">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Наименование по ГОСТ / Артикул</th>
                <th className="py-3 px-3">Магазин</th>
                <th className="py-3 px-3">Расход на {interactiveArea} м²</th>
                <th className="py-3 px-3">Цена за ед.</th>
                <th className="py-3 px-3">Итоговая стоимость</th>
                <th className="py-3 px-3 text-right">Купить в магазине</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredMaterials.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Name + Spec */}
                  <td className="py-3 px-4 space-y-0.5">
                    <div className="font-semibold text-white text-xs">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Бренд: <span className="text-slate-300">{item.brand}</span> · Арт: {item.sku}
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans line-clamp-1">{item.specification}</div>
                  </td>

                  {/* Store Badge */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      item.storeLogoCode === '12m'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : item.storeLogoCode === 'kaspi'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : item.storeLogoCode === 'stroymart'
                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      <Store className="w-2.5 h-2.5" />
                      {item.storeName}
                    </span>
                    <span className="block text-[9px] text-emerald-400 font-mono mt-0.5">В наличии</span>
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono">
                    <span className="font-bold text-white">{item.requiredQty}</span>{' '}
                    <span className="text-slate-400 text-[10px]">{item.unit}</span>
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-300">
                    {item.unitPriceKzt.toLocaleString('ru-RU')} ₸
                  </td>

                  {/* Total Cost */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-emerald-300">
                    {item.totalCostKzt.toLocaleString('ru-RU')} ₸
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <a
                      href={item.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-press inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-emerald-500 hover:text-black text-slate-200 border border-white/[0.1] text-xs font-mono font-semibold cursor-pointer transition-all"
                    >
                      <span>В магазин</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Procurement Assurance */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-300 flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Закупка напрямую в магазинах исключает <strong>+35% скрытой наценки бригадира</strong>. Экономия на чеках: ~850 000 ₸.</span>
          </span>
          <span className="font-mono text-[11px] text-emerald-300 shrink-0 font-semibold">
            Сертификаты соответствия РК ✓
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: SKEPTIC AGENTS ADVERSARIAL AUDIT LAYER (ЩИТ СКЕПТИКОВ)
          ========================================================================= */}
      <div className="specular-card rounded-3xl p-5 sm:p-7 space-y-4 border border-rose-500/30 bg-gradient-to-b from-rose-950/15 via-[#0b0d14] to-[#07090e]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-rose-400 uppercase tracking-wider font-bold">
                  Skeptic Agents Adversarial Audit Layer
                </span>
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-200 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                  3 строительные ловушки парировано
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 font-sans">
                Аудит Агентов-Скептиков: Защита от скрытых накруток и брака
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-xl">
              Парировано рисков: {totalSkepticsSavedKzt.toLocaleString('ru-RU')} ₸
            </span>
            <button
              type="button"
              onClick={() => setShowSkeptics(!showSkeptics)}
              className="btn-press text-xs px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] cursor-pointer"
            >
              {showSkeptics ? 'Свернуть' : 'Развернуть (3)'}
            </button>
          </div>
        </div>

        {showSkeptics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-1">
            {dynamicSkeptics.map((skep) => {
              const isNeutralized = neutralizedTraps[skep.id] ?? true;
              return (
                <div
                  key={skep.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 bg-black/50 ${
                    isNeutralized ? 'border-rose-500/30 hover:border-rose-500/50' : 'border-white/[0.06] opacity-60'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header with Agent Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[10px] font-bold flex items-center justify-center">
                          {skep.agentCode}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white block">{skep.agentName}</span>
                          <span className="text-[9px] font-mono text-slate-400 block">{skep.agentRole}</span>
                        </div>
                      </div>

                      <a
                        href={skep.regulatoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Открыть нормативный акт на adilet.zan.kz"
                        className="btn-press text-[9px] font-mono bg-white/[0.05] hover:bg-white/[0.1] text-sky-300 border border-white/[0.1] px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <span>Закон РК</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-rose-200 leading-snug">
                      {skep.verdictTitle}
                    </h4>

                    {/* Trap Box */}
                    <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-[11px] text-rose-200">
                      <span className="font-mono text-[10px] text-rose-400 uppercase font-bold block mb-0.5">
                        ⚠️ Ловушка подрядчика:
                      </span>
                      <p className="leading-relaxed">{skep.trapWarning}</p>
                    </div>

                    {/* Skeptic Argument */}
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-300 space-y-1.5">
                      <span className="font-mono text-[10px] text-amber-300 uppercase font-bold block">
                        🔍 Анализ скептика:
                      </span>
                      <p className="leading-relaxed font-sans text-xs">{skep.skepticArgument}</p>
                      
                      {/* Adversarial Proof bullets */}
                      <ul className="pt-1.5 border-t border-white/[0.05] space-y-1 text-[10px] font-mono text-slate-300">
                        {skep.adversarialProof.map((pf, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{pf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      +{skep.riskAmountKzt.toLocaleString('ru-RU')} ₸ спасено
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleTrapNeutralized(skep.id)}
                      className={`btn-press text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-all ${
                        isNeutralized
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                          : 'bg-white/[0.04] text-slate-400 border border-white/[0.08]'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isNeutralized ? 'Ловушка парирована ✓' : 'Исключить'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 5: LIVE INTERACTIVE QUANTITIES CALCULATOR (ПОДРОБНЫЙ РАСЧЕТ ОБЪЕМОВ)
          ========================================================================= */}
      <div className="specular-card rounded-3xl p-5 sm:p-7 space-y-5 border border-white/[0.08] bg-[#0b0e17]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold block">
                Construction Quantities Calculator
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                Мгновенный динамический пересчёт
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 font-sans">
              Физико-геометрическая модель объекта ({dynamicQuantities.floor_area_sqm} м²)
            </h3>
          </div>
          
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="btn-press text-xs px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] cursor-pointer self-start sm:self-auto"
          >
            {showCalculator ? 'Свернуть калькулятор' : 'Настроить параметры'}
          </button>
        </div>

        {/* Interactive Controls Bar */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              Параметры объекта (меняйте площадь для пересчёта всех смет и материалов):
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* 1. Площадь объекта */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Площадь пола:</span>
                <span className="text-sky-400 font-bold">{interactiveArea} м²</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[44, 58, 82, 105, 130].map((val) => (
                  <button
                    key={val}
                    onClick={() => setInteractiveArea(val)}
                    className={`btn-press text-xs px-2.5 py-1 rounded-lg font-mono border cursor-pointer transition-all ${
                      interactiveArea === val
                        ? 'bg-sky-500 text-obsidian-950 font-bold border-sky-400 shadow-xs'
                        : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    {val} м²
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Высота потолков */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Высота потолков:</span>
                <span className="text-amber-400 font-bold">{interactiveHeight} м</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[2.7, 3.0, 3.3].map((val) => (
                  <button
                    key={val}
                    onClick={() => setInteractiveHeight(val)}
                    className={`btn-press text-xs px-2.5 py-1 rounded-lg font-mono border cursor-pointer transition-all ${
                      interactiveHeight === val
                        ? 'bg-amber-500 text-obsidian-950 font-bold border-amber-400 shadow-xs'
                        : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    {val} м
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Исходное состояние */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Исходное состояние:</span>
                <span className="text-emerald-400 font-bold capitalize">
                  {interactiveType === 'rough' ? 'Черновая' : interactiveType === 'whitebox' ? 'White Box' : 'Вторичка'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {(['rough', 'whitebox', 'secondary'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setInteractiveType(type)}
                    className={`btn-press text-xs px-2.5 py-1 rounded-lg font-mono border cursor-pointer transition-all ${
                      interactiveType === type
                        ? 'bg-emerald-500 text-obsidian-950 font-bold border-emerald-400 shadow-xs'
                        : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    {type === 'rough' ? 'Черновая' : type === 'whitebox' ? 'White Box' : 'Вторичка'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] hover:border-sky-500/30 transition-all">
            <span className="text-[10px] text-slate-400 font-mono block">Площадь стен</span>
            <span className="text-base font-bold text-sky-400 font-mono mt-1 block">
              ~{dynamicQuantities.wall_area_sqm} м²
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5 block">Коэфф. {(dynamicQuantities.wall_area_sqm / dynamicQuantities.floor_area_sqm).toFixed(1)}</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] hover:border-white/20 transition-all">
            <span className="text-[10px] text-slate-400 font-mono block">Периметр</span>
            <span className="text-base font-bold text-white font-mono mt-1 block">
              ~{dynamicQuantities.perimeter_m} м.п.
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5 block">Плинтуса и карнизы</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] hover:border-amber-500/30 transition-all">
            <span className="text-[10px] text-slate-400 font-mono block">Электроточки</span>
            <span className="text-base font-bold text-amber-400 font-mono mt-1 block">
              {dynamicQuantities.electrical_points} шт.
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5 block">Розетки/выключатели</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] hover:border-emerald-500/30 transition-all">
            <span className="text-[10px] text-slate-400 font-mono block">Кабельные линии</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
              ~{dynamicQuantities.cable_length_m} м.п.
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5 block">ВВГнг-LS ГОСТ</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] hover:border-cyan-500/30 transition-all">
            <span className="text-[10px] text-slate-400 font-mono block">Мокрые зоны</span>
            <span className="text-base font-bold text-cyan-400 font-mono mt-1 block">
              ~{dynamicQuantities.wet_zones_sqm} м²
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5 block">Санузел и кухня</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] hover:border-white/20 transition-all">
            <span className="text-[10px] text-slate-400 font-mono block">Сухие смеси</span>
            <span className="text-base font-bold text-white font-mono mt-1 block">
              ~{dynamicQuantities.plaster_estimate_kg} кг
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5 block">~{Math.round(dynamicQuantities.plaster_estimate_kg / 30)} мешков</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 6: ENGINEERING SOLUTIONS WITH CLICKABLE LINKS & SCHEMATICS
          ========================================================================= */}
      {solutions && solutions.length > 0 && (
        <div className="specular-card rounded-3xl p-5 sm:p-7 space-y-4 border border-white/[0.08] bg-[#090c14]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                Engineering Collision & Solution Engine
              </span>
              <h3 className="text-base font-bold text-white mt-0.5 font-sans">
                Выявленные коллизии, нормативы РК и готовые схемы узлов
              </h3>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {['all', 'electrical', 'screed', 'plumbing', 'legal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedSolutionCategory(cat)}
                  className={`btn-press px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase cursor-pointer transition-all ${
                    selectedSolutionCategory === cat
                      ? 'bg-emerald-500 text-obsidian-950 font-bold'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'Все (4)' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSolutions.map((sol) => {
              const isApplied = appliedSolutions[sol.id] ?? true;
              const isDiagramOpen = expandedDiagrams[sol.id] ?? false;

              return (
                <div
                  key={sol.id}
                  className={`p-4 rounded-2xl bg-black/40 border transition-all flex flex-col justify-between gap-3 group ${
                    isApplied ? 'border-white/[0.08] hover:border-emerald-500/40' : 'border-rose-500/20 opacity-70'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {sol.title}
                      </span>

                      <a
                        href={sol.normative_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-press shrink-0 flex items-center gap-1 text-[9px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        <span>{sol.normative}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    {sol.normative_clause && (
                      <div className="text-[10px] font-mono text-slate-400 bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.04]">
                        <span className="text-sky-300 font-semibold">Норматив:</span> {sol.normative_clause}
                      </div>
                    )}

                    {/* Collision Problem */}
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200">
                      <strong className="text-white block font-mono text-[10px] mb-0.5">
                        ⚠️ ВЫЯВЛЕННАЯ КОЛЛИЗИЯ ЗАСТРОЙЩИКА:
                      </strong>
                      <span className="leading-relaxed block">{sol.collision}</span>
                    </div>

                    {/* Solution */}
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200">
                      <strong className="text-white block font-mono text-[10px] mb-0.5">
                        💡 ИНЖЕНЕРНОЕ РЕШЕНИЕ АГЕНТА:
                      </strong>
                      <span className="leading-relaxed block">{sol.solution}</span>
                    </div>

                    {/* Accordion: Blueprint Diagram */}
                    {isDiagramOpen && sol.diagram_summary && (
                      <div className="p-3 rounded-xl bg-[#07090e] border border-sky-500/20 space-y-2 text-[11px] font-mono">
                        <div>
                          <span className="text-sky-300 font-bold block text-[10px] uppercase">
                            Схема инженерного узла:
                          </span>
                          <p className="text-slate-300 font-sans text-[11px] leading-relaxed mt-0.5">
                            {sol.diagram_summary}
                          </p>
                        </div>

                        {sol.blueprint_steps && sol.blueprint_steps.length > 0 && (
                          <div className="pt-2 border-t border-white/[0.05]">
                            <span className="text-amber-300 font-bold block text-[10px] uppercase">
                              Чек-лист инженера технадзора при приёмке:
                            </span>
                            <ul className="mt-1 space-y-1 text-slate-300 font-sans text-[11px]">
                              {sol.blueprint_steps.map((st, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-1.5">
                                  <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{st}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Risk Footer */}
                  <div className="pt-2 border-t border-white/[0.05] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-300 font-semibold">{sol.risk_saved}</span>
                      <span className="text-slate-500">СНиП РК Compliance ✓</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => toggleDiagram(sol.id)}
                        className="btn-press text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <span>{isDiagramOpen ? 'Скрыть схему' : 'Схема узла'}</span>
                        {isDiagramOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSolutionApplied(sol.id)}
                        className={`btn-press text-[11px] px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                          isApplied
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-slate-200'
                        }`}
                      >
                        {isApplied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                        <span>{isApplied ? 'Включено в ТЗ' : 'Исключено из ТЗ'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 7: WORK BREAKDOWN STRUCTURE (WBS)
          ========================================================================= */}
      {workBreakdown && workBreakdown.length > 0 && (
        <div className="specular-card rounded-3xl p-5 sm:p-7 space-y-4 border border-white/[0.08] bg-[#090c14]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider font-bold block">
                Work Breakdown Structure (WBS)
              </span>
              <h3 className="text-base font-bold text-white mt-0.5 font-sans">
                Технологическая карта ремонта и поэтапная приёмка технадзора
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              4 последовательных этапа · {activeProject.timelineDays} дней
            </span>
          </div>

          <div className="space-y-3">
            {workBreakdown.map((wb, idx) => (
              <div
                key={wb.stage_id}
                className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-400 font-mono text-xs flex items-center justify-center font-bold">
                      0{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white">{wb.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    Нормативный срок: {wb.duration_days} дней
                  </span>
                </div>

                <ul className="space-y-1 text-xs text-slate-300 pl-8 list-disc">
                  {wb.key_tasks.map((task, tIdx) => (
                    <li key={tIdx} className="leading-relaxed">
                      {task}
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-white/[0.04] text-[11px] text-amber-200/90 pl-8 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-mono">Критерий приёмки:</strong> {wb.quality_check}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function FileCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { 
  CalculatedQuantities, 
  EngineeringSolution, 
  WorkBreakdownStage, 
  AgentLoopStep,
  calculateConstructionQuantities
} from '@/core/tools/engineering-engine';
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
  FileSpreadsheet
} from 'lucide-react';

interface AgentSolutionsViewProps {
  quantities?: CalculatedQuantities;
  solutions?: EngineeringSolution[];
  workBreakdown?: WorkBreakdownStage[];
  loopSteps?: AgentLoopStep[];
  onOpenWorkBrief?: () => void;
}

export const AgentSolutionsView: React.FC<AgentSolutionsViewProps> = ({
  quantities,
  solutions,
  workBreakdown,
  loopSteps,
  onOpenWorkBrief,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [selectedSolutionCategory, setSelectedSolutionCategory] = useState<string>('all');
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  
  // Interactive Live Calculator state
  const [interactiveArea, setInteractiveArea] = useState<number>(quantities?.floor_area_sqm || 58);
  const [interactiveHeight, setInteractiveHeight] = useState<number>(2.7);
  const [interactiveType, setInteractiveType] = useState<'rough' | 'whitebox' | 'secondary'>('rough');

  // Expanded schematics per solution
  const [expandedDiagrams, setExpandedDiagrams] = useState<Record<string, boolean>>({
    'sol-elec-1': true, // open first by default to show capability
  });

  // Solutions included in WorkBrief
  const [appliedSolutions, setAppliedSolutions] = useState<Record<string, boolean>>({
    'sol-elec-1': true,
    'sol-screed-2': true,
    'sol-plumb-3': true,
    'sol-legal-4': true,
  });

  // Re-calculate dynamically if user plays with the interactive calculator
  const dynamicQuantities = useMemo(() => {
    return calculateConstructionQuantities(interactiveArea, interactiveHeight, interactiveType);
  }, [interactiveArea, interactiveHeight, interactiveType]);

  const filteredSolutions = solutions?.filter((s) => 
    selectedSolutionCategory === 'all' ? true : s.category === selectedSolutionCategory
  ) || [];

  const activeLoopStep = loopSteps?.find((s) => s.step === selectedStep) || loopSteps?.[0];

  const toggleDiagram = (solId: string) => {
    setExpandedDiagrams((prev) => ({ ...prev, [solId]: !prev[solId] }));
  };

  const toggleSolutionApplied = (solId: string) => {
    setAppliedSolutions((prev) => ({ ...prev, [solId]: !prev[solId] }));
  };

  // Total risk saved calculation
  const totalRiskSavedKzt = useMemo(() => {
    if (!solutions) return 5350000;
    return solutions
      .filter((s) => appliedSolutions[s.id])
      .reduce((sum, s) => sum + (s.risk_amount_kzt || 0), 0);
  }, [solutions, appliedSolutions]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner: What problem does this solve & Explainer drawer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0e111a] border border-white/[0.08] shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Интеллектуальный контур решений
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold">
                  4 коллизии устранено
                </span>
                <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/25 px-2 py-0.5 rounded-full font-semibold">
                  Предотвращённый риск: {totalRiskSavedKzt.toLocaleString('ru-RU')} ₸
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Автономный цифровой технадзор: анализирует исходные данные, защищает от скрытых наценок, вычисляет физические объёмы и формирует решения по СНиП РК.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsExplainOpen(!isExplainOpen)}
              className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-medium cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{isExplainOpen ? 'Скрыть суть' : 'В чём ценность?'}</span>
              {isExplainOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {onOpenWorkBrief && (
              <button
                onClick={onOpenWorkBrief}
                className="btn-press flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-obsidian-950 font-bold text-xs shadow-md cursor-pointer"
              >
                <FileSignature className="w-4 h-4" />
                <span>Перейти к ТЗ</span>
              </button>
            )}
          </div>
        </div>

        {/* Explainer Drawer (Answers user's question directly) */}
        {isExplainOpen && (
          <div className="pt-3 mt-2 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] space-y-1">
              <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                1. Проблема: обман и допы
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Бригады занижают смету на входе («сделаем за 2 млн»), а при ремонте накручивают допы на 5 млн и штробят несущий монолит. Агент исключает это до подписания договора.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] space-y-1">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                2. Решение: расчёт по СНиП
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Агент проверяет вводную мощность (25А / 5.5 кВт vs 14 кВт техники), толщину стяжки, узлы гидроизоляции и нормы перепланировки РК, формируя готовые инженерные узлы.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] space-y-1">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                3. Ценность: точные объёмы
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Вы получаете точный расчёт материалов (стены, проводка, розетки, сухие смеси) и юридический WorkBrief. Бригада не сможет списать лишние 50 мешков или 200 м кабеля.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BLOCK 1: LIVE AGENT REASONING & EXECUTION LOOP */}
      {loopSteps && loopSteps.length > 0 && (
        <div className="specular-card rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider font-bold block">
                Agent Reasoning & Execution Loop
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5 font-sans">
                Живой цикл рассуждений и действий роя агентов
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              6 итераций · Автономный контур
            </span>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {loopSteps.map((step) => {
              const isSelected = selectedStep === step.step;
              return (
                <button
                  key={step.step}
                  onClick={() => setSelectedStep(step.step)}
                  className={`btn-press p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.2)] ring-1 ring-sky-400/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold text-sky-400">
                      ШАГ 0{step.step}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-white truncate">
                    {step.phase}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate font-mono">
                    {step.agentName.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Detail: Thought, Action, Observation */}
          {activeLoopStep && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-white/[0.06]">
                <span className="text-sky-300 font-bold">
                  Исполнитель: {activeLoopStep.agentName} ({activeLoopStep.agentRole})
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Выполнено успешно
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="text-amber-400 font-bold shrink-0 text-[11px] w-24">THOUGHT:</span>
                  <span className="text-slate-200 font-sans text-xs leading-relaxed">
                    {activeLoopStep.thought}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-sky-400 font-bold shrink-0 text-[11px] w-24">ACTION:</span>
                  <code className="text-sky-200 text-xs bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                    {activeLoopStep.action}
                  </code>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0 text-[11px] w-24">OBSERVATION:</span>
                  <span className="text-slate-300 font-sans text-xs leading-relaxed">
                    {activeLoopStep.observation}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BLOCK 2: LIVE INTERACTIVE CONSTRUCTION QUANTITIES CALCULATOR */}
      <div className="specular-card rounded-2xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                Construction Quantities Calculator
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                Интерактивный пересчёт в реальном времени
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5 font-sans">
              Физико-геометрическая модель объекта ({dynamicQuantities.floor_area_sqm} м²)
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
            Нормативы СП РК 1.03-106-2012
          </span>
        </div>

        {/* Interactive Controls Bar: Area, Height, Renovation Type */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              Параметры расчёта объёмов:
            </span>
            <span className="text-[11px] text-slate-400">
              Попробуйте изменить площадь или тип отделки:
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
                    className={`btn-press text-[10px] px-2 py-1 rounded-md font-mono border cursor-pointer transition-all ${
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
                    className={`btn-press text-[10px] px-2.5 py-1 rounded-md font-mono border cursor-pointer transition-all ${
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

            {/* 3. Тип ремонта */}
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
                    className={`btn-press text-[10px] px-2 py-1 rounded-md font-mono border cursor-pointer transition-all ${
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
            <span className="text-[9px] text-slate-500 mt-0.5 block">Коэфф. стен {(dynamicQuantities.wall_area_sqm / dynamicQuantities.floor_area_sqm).toFixed(1)}</span>
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

      {/* BLOCK 3: 4 ENGINEERING SOLUTIONS WITH CLICKABLE LINKS, ACCORDIONS, AND BUTTONS */}
      {solutions && solutions.length > 0 && (
        <div className="specular-card rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                Engineering Collision & Solution Engine
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5 font-sans">
                Выявленные коллизии, нормативы РК и готовые решения
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
                  className={`p-4 rounded-xl bg-black/40 border transition-all flex flex-col justify-between gap-3 group ${
                    isApplied ? 'border-white/[0.08] hover:border-emerald-500/40' : 'border-rose-500/20 opacity-70'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Title + Clickable Normative Link */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {sol.title}
                      </span>

                      {/* Clickable Normative Link to Official Adilet Portal */}
                      <a
                        href={sol.normative_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Открыть нормативный документ на adilet.zan.kz"
                        className="btn-press shrink-0 flex items-center gap-1 text-[9px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        <span>{sol.normative}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    {/* Normative Clause summary */}
                    {sol.normative_clause && (
                      <div className="text-[10px] font-mono text-slate-400 bg-white/[0.02] p-1.5 rounded border border-white/[0.04]">
                        <span className="text-sky-300 font-semibold">Норматив:</span> {sol.normative_clause}
                      </div>
                    )}

                    {/* Collision Problem */}
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200">
                      <strong className="text-white block font-mono text-[10px] mb-0.5">
                        ⚠️ ВЫЯВЛЕННАЯ КОЛЛИЗИЯ ЗАСТРОЙЩИКА:
                      </strong>
                      <span className="leading-relaxed block">{sol.collision}</span>
                    </div>

                    {/* Engineering Solution */}
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200">
                      <strong className="text-white block font-mono text-[10px] mb-0.5">
                        💡 ИНЖЕНЕРНОЕ РЕШЕНИЕ АГЕНТА:
                      </strong>
                      <span className="leading-relaxed block">{sol.solution}</span>
                    </div>

                    {/* Accordion: Blueprint Diagram and Checklist */}
                    {isDiagramOpen && sol.diagram_summary && (
                      <div className="p-3 rounded-lg bg-[#07090e] border border-sky-500/20 space-y-2 text-[11px] font-mono">
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

      {/* BLOCK 4: WORK BREAKDOWN STRUCTURE (WBS) */}
      {workBreakdown && workBreakdown.length > 0 && (
        <div className="specular-card rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider font-bold block">
                Work Breakdown Structure (WBS)
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5 font-sans">
                Технологическая карта ремонта и приёмка технадзора
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              4 последовательных этапа · 77 дней
            </span>
          </div>

          <div className="space-y-3">
            {workBreakdown.map((wb, idx) => (
              <div
                key={wb.stage_id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2.5"
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

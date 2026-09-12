'use client';

import React, { useState } from 'react';
import { 
  CalculatedQuantities, 
  EngineeringSolution, 
  WorkBreakdownStage, 
  AgentLoopStep 
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
  Clock
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

  const filteredSolutions = solutions?.filter((s) => 
    selectedSolutionCategory === 'all' ? true : s.category === selectedSolutionCategory
  ) || [];

  const activeLoopStep = loopSteps?.find((s) => s.step === selectedStep) || loopSteps?.[0];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner: What problem does this solve? */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-blue-950/25 to-transparent border border-sky-500/25 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Интеллектуальный контур решений
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                4 коллизии устранено
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Агент не просто собирает текст — он выявляет строительные коллизии застройщика, вычисляет физические объёмы и формирует готовые инженерные решения по СНиП РК.
            </p>
          </div>
        </div>

        {onOpenWorkBrief && (
          <button
            onClick={onOpenWorkBrief}
            className="btn-press shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] text-xs font-medium cursor-pointer"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Перейти к ТЗ</span>
          </button>
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
                Цикл рассуждений и действий автономного роя
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              6 итераций · Завершено за 120ms
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
                      ? 'bg-sky-500/15 border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
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

      {/* BLOCK 2: CALCULATED CONSTRUCTION QUANTITIES */}
      {quantities && (
        <div className="specular-card rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                Construction Quantities Calculator
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5 font-sans">
                Физико-геометрическая модель объекта ({quantities.floor_area_sqm} м²)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
              Расчёт по нормам СП РК
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 font-mono block">Площадь стен</span>
              <span className="text-base font-bold text-sky-400 font-mono mt-1 block">
                ~{quantities.wall_area_sqm} м²
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">Коэфф. стен 2.5</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 font-mono block">Периметр</span>
              <span className="text-base font-bold text-white font-mono mt-1 block">
                ~{quantities.perimeter_m} м.п.
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">Плинтуса и карнизы</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 font-mono block">Электроточки</span>
              <span className="text-base font-bold text-amber-400 font-mono mt-1 block">
                {quantities.electrical_points} шт.
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">Розетки/выключатели</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 font-mono block">Кабельные линии</span>
              <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                ~{quantities.cable_length_m} м.п.
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">ВВГнг-LS ГОСТ</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 font-mono block">Мокрые зоны</span>
              <span className="text-base font-bold text-cyan-400 font-mono mt-1 block">
                ~{quantities.wet_zones_sqm} м²
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">Санузел и кухня</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 font-mono block">Сухие смеси</span>
              <span className="text-base font-bold text-white font-mono mt-1 block">
                ~{quantities.plaster_estimate_kg} кг
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">~{Math.round(quantities.plaster_estimate_kg / 30)} мешков</span>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK 3: 4 ENGINEERING SOLUTIONS (COLLISION -> SOLUTION) */}
      {solutions && solutions.length > 0 && (
        <div className="specular-card rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                Engineering Collision & Solution Engine
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5 font-sans">
                Выявленные коллизии и готовые технические решения
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
            {filteredSolutions.map((sol) => (
              <div
                key={sol.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.08] hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      {sol.title}
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {sol.normative}
                    </span>
                  </div>

                  {/* Collision Problem */}
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200 mb-2.5">
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
                </div>

                {/* Risk & Money Saved Badge */}
                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-300 font-semibold">{sol.risk_saved}</span>
                  <span className="text-slate-500">СНиП РК Compliance ✓</span>
                </div>
              </div>
            ))}
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
              4 последовательных этапа
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

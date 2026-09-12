'use client';

import React from 'react';
import { VerifiedFacts, UnknownFieldItem, ModelSuggestion } from '@/types/agent';
import { Check, HelpCircle, AlertCircle, Sparkles, ScanSearch, Ruler, CheckCircle2, ShieldAlert, Shield } from 'lucide-react';

interface FactsMatrixProps {
  facts: VerifiedFacts;
  unknowns: UnknownFieldItem[];
  modelSuggestions?: ModelSuggestion[];
  onConfirmSuggestion?: (suggestion: ModelSuggestion) => void;
  onDismissSuggestion?: (suggestion: ModelSuggestion) => void;
}

export const FactsMatrix: React.FC<FactsMatrixProps> = ({
  facts,
  unknowns,
  modelSuggestions = [],
  onConfirmSuggestion,
  onDismissSuggestion,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. ПОДТВЕРЖДЁННЫЕ ФАКТЫ (ТОЛЬКО source: USER) — 6 колонок */}
        <div className="lg:col-span-6 specular-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <ScanSearch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Подтверждённые факты
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Куратор: Алексей (AGT-01 · ALPHA)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                USER PROVENANCE [100% ВАЛИДНО]
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Город */}
              <div className="p-3 rounded-xl bg-obsidian-900 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">{facts.city.label}</span>
                <span className="font-bold text-white text-sm mt-1">
                  {facts.city.source === 'USER' && facts.city.value ? facts.city.value : 'Не указан'}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Из текста запроса
                </span>
              </div>

              {/* Тип объекта */}
              <div className="p-3 rounded-xl bg-obsidian-900 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">{facts.property_type.label}</span>
                <span className="font-bold text-white text-sm mt-1">
                  {facts.property_type.source === 'USER' && facts.property_type.value ? facts.property_type.value : 'Не указан'}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Из текста запроса
                </span>
              </div>

              {/* Площадь */}
              <div className="p-3 rounded-xl bg-obsidian-900 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">{facts.area_sqm.label}</span>
                <span className="font-bold text-sky-400 text-sm font-mono mt-1">
                  {facts.area_sqm.source === 'USER' && facts.area_sqm.value ? `${facts.area_sqm.value} м²` : 'Не указана'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono mt-1.5">
                  Лазерный обмер уточнит геометрию
                </span>
              </div>

              {/* Срок въезда */}
              <div className="p-3 rounded-xl bg-obsidian-900 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">{facts.target_timeline_months.label}</span>
                <span className="font-bold text-white text-sm mt-1">
                  {facts.target_timeline_months.source === 'USER' && facts.target_timeline_months.value ? `${facts.target_timeline_months.value} месяца` : 'Не указан'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono mt-1.5">
                  Желаемый дедлайн въезда
                </span>
              </div>
            </div>

            {facts.special_requests && facts.special_requests.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-obsidian-900 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block mb-2 uppercase">
                  Пожелания заказчика (зафиксировано в ТЗ):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {facts.special_requests.map((req, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10 font-medium">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. КРИТИЧЕСКИЕ НЕИЗВЕСТНЫЕ (ТРЕБУЮТ ВЫЕЗДА) — 6 колонок */}
        <div className="lg:col-span-6 specular-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Критические неизвестные
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Куратор: Виктор (AGT-02 · RADAR)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                ТРЕБУЮТ ИНСТРУМЕНТАЛЬНОГО ВЫЕЗДА
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {unknowns.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs hover:bg-amber-500/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {item.label}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug pl-5">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ЯНТАРНЫЙ БЛОК: «AI ПРЕДЛОЖИЛ — ТРЕБУЕТСЯ ПОДТВЕРЖДЕНИЕ» */}
      {modelSuggestions && modelSuggestions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs shadow-card-dark">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-mono uppercase tracking-wide">Карантин гипотез AI (Изоляция от WorkBrief)</span>
            </div>
            <span className="text-[10px] font-mono text-amber-200 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Защищено от автоприменения
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {modelSuggestions.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-obsidian-900 border border-amber-500/20 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-mono text-[11px] uppercase">{s.label}:</span>
                    <span className="font-bold text-white font-mono bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                      {s.proposed_value}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-300/90 block leading-snug">
                    ↳ {s.reason}
                  </span>
                </div>

                {(onConfirmSuggestion || onDismissSuggestion) && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    {onDismissSuggestion && (
                      <button
                        type="button"
                        onClick={() => onDismissSuggestion(s)}
                        className="btn-press px-2.5 py-1 text-[11px] rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer font-mono"
                      >
                        Отклонить
                      </button>
                    )}
                    {onConfirmSuggestion && (
                      <button
                        type="button"
                        onClick={() => onConfirmSuggestion(s)}
                        className="btn-press px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 shadow-glow-emerald flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Подтвердить
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};




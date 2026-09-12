'use client';

import React from 'react';
import { VerifiedFacts, UnknownFieldItem, ModelSuggestion } from '@/types/agent';
import { Check, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. ПОДТВЕРЖДЁННЫЕ ФАКТЫ (ТОЛЬКО source: USER) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-bold text-slate-800">
                Подтверждённые факты
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              Подтверждено пользователем
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500">{facts.city.label}:</span>
              <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {facts.city.source === 'USER' && facts.city.value ? facts.city.value : 'Не указан в сообщении'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500">{facts.property_type.label}:</span>
              <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {facts.property_type.source === 'USER' && facts.property_type.value ? facts.property_type.value : 'Не указан в сообщении'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500">{facts.area_sqm.label}:</span>
              <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                {facts.area_sqm.source === 'USER' && facts.area_sqm.value ? `${facts.area_sqm.value} м²` : 'Не указана в сообщении'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-500">{facts.target_timeline_months.label}:</span>
              <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {facts.target_timeline_months.source === 'USER' && facts.target_timeline_months.value ? `${facts.target_timeline_months.value} месяца` : 'Не указан в сообщении'}
              </span>
            </div>

            {facts.special_requests && facts.special_requests.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 block mb-1">Пожелания по стилю (из текста):</span>
                <div className="flex flex-wrap gap-1">
                  {facts.special_requests.map((req, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. НЕИЗВЕСТНЫЕ ПАРАМЕТРЫ */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <h3 className="text-xs font-bold text-slate-800">
                Неизвестные параметры
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              Требуют обмера
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {unknowns.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg border border-amber-200/80 bg-amber-50/30 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {item.label}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-medium">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ЯНТАРНЫЙ БЛОК: «AI ПРЕДЛОЖИЛ — ТРЕБУЕТСЯ ПОДТВЕРЖДЕНИЕ» */}
      {modelSuggestions && modelSuggestions.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/70">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI предложил — требуется подтверждение</span>
            </div>
            <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
              Не включено в факты и WorkBrief
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {modelSuggestions.map((s, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white/90 border border-amber-200/80 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="text-slate-500 font-medium">{s.label}:</span>
                    <span className="font-bold text-slate-900 font-mono">{s.proposed_value}</span>
                  </div>
                  <span className="text-[10px] text-amber-800 block leading-tight">
                    ↳ {s.reason}
                  </span>
                </div>

                {(onConfirmSuggestion || onDismissSuggestion) && (
                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-amber-100">
                    {onDismissSuggestion && (
                      <button
                        type="button"
                        onClick={() => onDismissSuggestion(s)}
                        className="px-2 py-0.5 text-[10px] rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      >
                        Отклонить
                      </button>
                    )}
                    {onConfirmSuggestion && (
                      <button
                        type="button"
                        onClick={() => onConfirmSuggestion(s)}
                        className="px-2.5 py-0.5 text-[10px] font-medium rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-2.5 h-2.5" />
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


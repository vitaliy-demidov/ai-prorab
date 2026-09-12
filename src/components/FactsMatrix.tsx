'use client';

import React from 'react';
import { VerifiedFacts, UnknownFieldItem } from '@/types/agent';
import { Check, HelpCircle, AlertCircle } from 'lucide-react';

interface FactsMatrixProps {
  facts: VerifiedFacts;
  unknowns: UnknownFieldItem[];
}

export const FactsMatrix: React.FC<FactsMatrixProps> = ({ facts, unknowns }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. ПОДТВЕРЖДЁННЫЕ ФАКТЫ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h3 className="text-xs font-bold text-slate-800">
              Подтверждённые факты
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            Из сообщения
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
            <span className="text-slate-500">{facts.city.label}:</span>
            <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {facts.city.value || 'Не указан'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
            <span className="text-slate-500">{facts.property_type.label}:</span>
            <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {facts.property_type.value || 'Не указан'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
            <span className="text-slate-500">{facts.area_sqm.label}:</span>
            <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
              {facts.area_sqm.value ? `${facts.area_sqm.value} м²` : 'Не указана'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
            <span className="text-slate-500">{facts.target_timeline_months.label}:</span>
            <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {facts.target_timeline_months.value ? `${facts.target_timeline_months.value} месяца` : 'Не указан'}
            </span>
          </div>

          {facts.special_requests && facts.special_requests.length > 0 && (
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1">Пожелания по стилю:</span>
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
  );
};

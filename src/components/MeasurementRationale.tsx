'use client';

import React from 'react';
import { ShieldCheck, Ruler, Layers, Zap, HeartHandshake } from 'lucide-react';

interface MeasurementRationaleProps {
  reasons: string[];
}

const ICONS = [Ruler, Zap, Layers, HeartHandshake];

export const MeasurementRationale: React.FC<MeasurementRationaleProps> = ({ reasons }) => {
  return (
    <div className="bg-obsidian-850 text-white rounded-2xl p-4 sm:p-5 shadow-card-dark border border-white/10">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Почему цена пока не формируется (Safety Protocol)
            </h3>
            <p className="text-[11px] text-slate-400">
              Кураторы: Виктор (Инженер обмера) & Елена (Ревизор смет) • Защита от скрытых расходов
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          Защитный протокол
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {reasons.map((reason, idx) => {
          const [title, desc] = reason.split(':');
          const IconComponent = ICONS[idx % ICONS.length];

          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-obsidian-900/80 border border-white/5 text-xs flex items-start gap-3 hover:border-white/15 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sky-400 font-mono text-[10px] font-bold">0{idx + 1}.</span>
                  <span className="font-bold text-white text-xs">
                    {title}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 leading-snug block">
                  {desc ? desc.trim() : title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


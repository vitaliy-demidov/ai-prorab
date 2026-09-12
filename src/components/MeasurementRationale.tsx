'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface MeasurementRationaleProps {
  reasons: string[];
}

export const MeasurementRationale: React.FC<MeasurementRationaleProps> = ({ reasons }) => {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs border border-slate-800">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-100">
              Почему цена пока не формируется
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Чтобы не обещать цифру, которую объект не подтвердил
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Safety Notice
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {reasons.map((reason, idx) => {
          const [title, desc] = reason.split(':');
          return (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs flex items-start gap-2"
            >
              <span className="text-emerald-400 font-mono font-semibold text-xs shrink-0 mt-0.5">
                0{idx + 1}.
              </span>
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">
                  {title}
                </span>
                <span className="text-[11px] text-slate-400 leading-snug">
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

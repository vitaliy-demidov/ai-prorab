'use client';

import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';

interface HeaderProps {
  engineBadge: string;
  engineMode: 'deterministic' | 'hybrid' | 'deterministic_fallback';
}

export const Header: React.FC<HeaderProps> = ({ engineBadge, engineMode }) => {
  const isFallback = engineMode === 'deterministic_fallback';
  const isHybrid = engineMode === 'hybrid';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs tracking-wide">
            П
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 font-sans">
              AI Прораб
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Агент технического заказчика для ремонта
            </p>
          </div>
        </div>

        {/* Honest System Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium text-[11px] ${
              isFallback
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : isHybrid
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Cpu className="w-3 h-3 text-slate-500" />
            <span>{engineBadge}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[11px]">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>Human approval required</span>
          </div>
        </div>
      </div>
    </header>
  );
};

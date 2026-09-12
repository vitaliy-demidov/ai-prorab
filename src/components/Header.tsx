'use client';

import React from 'react';
import { FileCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  engineBadge: string;
  engineMode: 'deterministic' | 'hybrid' | 'deterministic_fallback';
  isHumanApproved?: boolean;
  onOpenWorkBrief?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isHumanApproved,
  onOpenWorkBrief,
}) => {
  return (
    <header className="border-b border-white/[0.06] bg-[#090b10]/80 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Apple-style Brand Block */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/[0.12] to-white/[0.03] border border-white/[0.1] flex items-center justify-center shadow-xs">
            <span className="text-sky-400 font-semibold text-xs tracking-wider font-mono">П</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-sm font-semibold tracking-tight text-white font-sans">
              AI Прораб
            </h1>
            <span className="text-[11px] text-slate-400 hidden sm:inline font-normal">
              Инженер технического заказчика
            </span>
          </div>
        </div>

        {/* Right Status Pill & CTA */}
        <div className="flex items-center space-x-2.5 text-xs">
          {/* Status Indicator */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              isHumanApproved
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.08]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isHumanApproved ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-sky-400'
              }`}
            />
            <span>{isHumanApproved ? 'ТЗ утверждено v1.0' : 'Автономный контур'}</span>
          </div>

          {/* Quick WorkBrief trigger */}
          {onOpenWorkBrief && (
            <button
              onClick={onOpenWorkBrief}
              className="btn-press flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] text-[11px] font-medium cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Техническое задание</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};



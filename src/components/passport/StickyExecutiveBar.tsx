'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  FileSignature, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';

interface StickyExecutiveBarProps {
  totalBudgetKzt: number;
  preventedRisksKzt: number;
  activeTrancheNumber?: number;
  isPassportApproved: boolean;
  onApprovePassport: () => void;
  onCallTechSupervision: () => void;
}

export const StickyExecutiveBar: React.FC<StickyExecutiveBarProps> = ({
  totalBudgetKzt,
  preventedRisksKzt,
  activeTrancheNumber = 2,
  isPassportApproved,
  onApprovePassport,
  onCallTechSupervision,
}) => {
  return (
    <aside 
      aria-label="Исполнительная панель управления объектом" 
      className="sticky bottom-3 z-40 w-full max-w-5xl mx-auto px-2 sm:px-4 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="p-3 sm:p-4 rounded-2xl bg-[#0a0d14]/95 backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_0_rgba(0,0,0,0.7)] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 ring-1 ring-white/[0.05]">
        {/* Левая секция: Финансовые KPI и телеметрия объекта */}
        <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto justify-between md:justify-start">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Смета под ключ (Эскроу)
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                0% аванс
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-white tracking-tight">
                {totalBudgetKzt.toLocaleString('ru-RU')} ₸
              </span>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md font-semibold">
                Транш 0{activeTrancheNumber}/04
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/[0.08]" />

          <div className="hidden sm:block space-y-0.5">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-400" />
              Парировано ловушек
            </span>
            <span className="text-sm font-bold font-mono tabular-nums text-rose-300">
              +{preventedRisksKzt.toLocaleString('ru-RU')} ₸
            </span>
          </div>
        </div>

        {/* Центральная секция: Индикатор консенсуса 5 агентов */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
          <div className="flex -space-x-1.5">
            <span className="w-5 h-5 rounded-full bg-sky-500/30 border border-sky-400/60 flex items-center justify-center text-[9px] font-black text-sky-200">α</span>
            <span className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400/60 flex items-center justify-center text-[9px] font-black text-emerald-200">M</span>
            <span className="w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400/60 flex items-center justify-center text-[9px] font-black text-amber-200">B</span>
            <span className="w-5 h-5 rounded-full bg-rose-500/30 border border-rose-400/60 flex items-center justify-center text-[9px] font-black text-rose-200">S</span>
            <span className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400/60 flex items-center justify-center text-[9px] font-black text-purple-200">J</span>
          </div>
          <span className="text-slate-300 font-medium">Консенсус 5 агентов: 100%</span>
        </div>

        {/* Правая секция: Ключевые действия ЛПР */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onCallTechSupervision}
            className="btn-press min-h-[42px] px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Вызов технадзора</span>
            <span className="sm:hidden">Технадзор</span>
          </button>

          {!isPassportApproved ? (
            <button
              type="button"
              onClick={onApprovePassport}
              className="btn-press min-h-[42px] flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-obsidian-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer transition-all"
            >
              <FileSignature className="w-4 h-4 fill-obsidian-950" />
              <span>Утвердить паспорт и эскроу</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Паспорт утвержден ✓</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

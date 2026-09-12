'use client';

import React from 'react';
import { ShieldAlert, Cpu, Sparkles, Activity } from 'lucide-react';

interface HeaderProps {
  engineBadge: string;
  engineMode: 'deterministic' | 'hybrid' | 'deterministic_fallback';
}

export const Header: React.FC<HeaderProps> = ({ engineBadge, engineMode }) => {
  const isFallback = engineMode === 'deterministic_fallback';
  const isHybrid = engineMode === 'hybrid';

  return (
    <header className="border-b border-white/10 bg-obsidian-950/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 via-obsidian-800 to-obsidian-900 border border-sky-500/30 flex items-center justify-center shadow-glow-cyan">
              <span className="text-sky-400 font-bold text-sm tracking-wider font-mono">П</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-obsidian-950"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white font-sans">
                AI Прораб
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                Agent Swarm
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Автономный инженер технического заказчика для ремонта
            </p>
          </div>
        </div>

        {/* System & Swarm Indicators */}
        <div className="flex items-center gap-2 text-xs">
          {/* Swarm Live Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-obsidian-850 border border-white/10 text-[11px] text-slate-300 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Swarm: 6 агентов</span>
          </div>

          {/* Engine Mode */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all ${
              isFallback
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : isHybrid
                ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                : 'bg-obsidian-800 text-slate-300 border-white/10'
            }`}
          >
            <Cpu className="w-3 h-3 text-sky-400" />
            <span className="hidden md:inline">{engineBadge}</span>
            <span className="md:hidden">Hybrid</span>
          </div>

          {/* Safety Invariant Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[11px]">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Human Approval Required</span>
            <span className="sm:hidden">Approval Req.</span>
          </div>
        </div>
      </div>
    </header>
  );
};


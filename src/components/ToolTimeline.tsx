'use client';

import React, { useState } from 'react';
import { ToolExecutionTrace } from '@/types/agent';
import { Terminal, ChevronDown, ChevronRight, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface ToolTimelineProps {
  traces: ToolExecutionTrace[];
}

export const ToolTimeline: React.FC<ToolTimelineProps> = ({ traces }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleExpand = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  return (
    <div className="specular-card rounded-2xl overflow-hidden">
      {/* Header acting as disclosure button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-press w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Журнал выполнения инструментов (Tool Execution Trace)
            </h3>
            <p className="text-[11px] text-slate-400">
              {traces.length} типизированных вызовов инструментов • Прозрачный аудит каждого шага
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
            {isOpen ? 'Скрыть аудит' : 'Развернуть Trace'}
          </span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-2 border-t border-white/10 bg-obsidian-950/80">
          <div className="relative pl-4 border-l-2 border-white/10 space-y-3 my-2">
            {traces.map((trace) => {
              const isExpanded = expandedStep === trace.step;
              const isIntercepted = trace.status === 'GUARD_INTERCEPTED';

              return (
                <div key={trace.step} className="relative group">
                  <div
                    className={`absolute -left-[21px] top-2 w-2.5 h-2.5 rounded-full ring-4 ring-obsidian-950 ${
                      isIntercepted ? 'bg-rose-500' : 'bg-sky-400'
                    }`}
                  ></div>

                  <div className="p-3 rounded-xl border border-white/10 bg-obsidian-900 text-xs">
                    <div
                      onClick={() => toggleExpand(trace.step)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded text-[11px]">
                          {trace.tool_name}()
                        </span>
                        <span className="text-slate-300 text-xs font-medium">
                          {trace.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                            isIntercepted
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {trace.status}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="text-slate-500">Политика:</span>
                      <span className="text-slate-300">{trace.policy_decision}</span>
                    </div>

                    {/* JSON Inspector */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/5 font-mono text-[11px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 text-slate-300 overflow-x-auto">
                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                              Input Payload
                            </div>
                            <pre className="text-[10px] leading-tight text-sky-200/90">
                              {JSON.stringify(trace.input_summary, null, 2)}
                            </pre>
                          </div>
                          <div className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 text-slate-300 overflow-x-auto">
                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                              Output Result
                            </div>
                            <pre className="text-[10px] leading-tight text-emerald-200/90">
                              {JSON.stringify(trace.output_summary, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};



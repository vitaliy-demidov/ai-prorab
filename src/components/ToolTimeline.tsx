'use client';

import React, { useState } from 'react';
import { ToolExecutionTrace } from '@/types/agent';
import { Terminal, ChevronDown, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

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
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header acting as disclosure button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-all cursor-pointer"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Как агент принял решение (Tool Execution Trace)
            </h3>
            <p className="text-[11px] text-slate-500">
              {traces.length} типизированных вызовов инструментов • Аудит для жюри
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            {isOpen ? 'Скрыть детали' : 'Показать trace'}
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
        <div className="p-4 pt-1 border-t border-slate-100 bg-slate-50/50">
          <div className="relative pl-4 border-l-2 border-slate-200 space-y-2.5 my-2">
            {traces.map((trace) => {
              const isExpanded = expandedStep === trace.step;
              const isIntercepted = trace.status === 'GUARD_INTERCEPTED';

              return (
                <div key={trace.step} className="relative group">
                  <div
                    className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                      isIntercepted ? 'bg-rose-500' : 'bg-slate-800'
                    }`}
                  ></div>

                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs">
                    <div
                      onClick={() => toggleExpand(trace.step)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {trace.tool_name}()
                        </span>
                        <span className="text-slate-600 text-[11px]">
                          {trace.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                            isIntercepted
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
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

                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="italic">{trace.policy_decision}</span>
                    </div>

                    {/* JSON Inspector */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-slate-100 font-mono text-[11px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-slate-900 text-slate-200 overflow-x-auto">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                              Input
                            </div>
                            <pre className="text-[10px] leading-tight">
                              {JSON.stringify(trace.input_summary, null, 2)}
                            </pre>
                          </div>
                          <div className="p-2 rounded bg-slate-900 text-slate-200 overflow-x-auto">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                              Output
                            </div>
                            <pre className="text-[10px] leading-tight">
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

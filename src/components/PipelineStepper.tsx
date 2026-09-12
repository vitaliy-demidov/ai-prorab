'use client';

import React from 'react';
import { PipelineStage } from '@/types/agent';
import { Check, Lock, ArrowRight, Shield } from 'lucide-react';

interface PipelineStepperProps {
  stages: PipelineStage[];
  isHumanApproved: boolean;
}

const STAGE_AGENT_MAP: Record<string, { agentName: string; color: string; glyph: string }> = {
  clarification: { agentName: 'Алексей', color: '#38bdf8', glyph: '01' },
  measurement: { agentName: 'Виктор', color: '#f59e0b', glyph: '02' },
  workbrief: { agentName: 'Марина', color: '#10b981', glyph: '03' },
  rfq: { agentName: 'Дмитрий', color: '#818cf8', glyph: '04' },
  comparison: { agentName: 'Елена', color: '#f43f5e', glyph: '05' },
  human_confirmation: { agentName: 'Артур', color: '#14b8a6', glyph: '06' },
};

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  stages,
  isHumanApproved,
}) => {
  return (
    <div className="w-full bg-obsidian-850 border border-white/10 rounded-xl p-3.5 shadow-card-dark">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Регламент проекта
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
            Строгая очерёдность
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {isHumanApproved ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              WorkBrief Rev 1.0 утверждён
            </span>
          ) : (
            <span className="text-sky-300">
              Текущий фокус: 01 Разбор & 02 Обмер
            </span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {stages.map((stage) => {
          const isFirst = stage.id === 'clarification';
          const isBrief = stage.id === 'workbrief';
          const isMeasurement = stage.id === 'measurement';
          const isLocked = stage.id === 'rfq' || stage.id === 'comparison' || stage.id === 'human_confirmation';
          const agentInfo = STAGE_AGENT_MAP[stage.id] || { agentName: 'Агент', color: '#94a3b8', glyph: '00' };

          let containerClass = 'bg-obsidian-900/80 text-slate-400 border-white/5';
          if (isFirst) {
            containerClass = 'bg-sky-950/40 text-sky-200 border-sky-500/40 shadow-glow-cyan font-medium';
          } else if (isMeasurement) {
            containerClass = 'bg-amber-950/30 text-amber-200 border-amber-500/40 font-medium';
          } else if (isBrief) {
            containerClass = isHumanApproved 
              ? 'bg-emerald-950/40 text-emerald-200 border-emerald-500/40 shadow-glow-emerald font-medium'
              : 'bg-emerald-950/20 text-emerald-300/90 border-emerald-500/30 font-medium';
          }

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-lg border flex flex-col justify-between gap-1.5 text-[11px] transition-all relative overflow-hidden group ${containerClass}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span 
                    className="w-4 h-4 rounded text-[9px] font-mono flex items-center justify-center font-bold"
                    style={{ backgroundColor: `${agentInfo.color}25`, color: agentInfo.color }}
                  >
                    {agentInfo.glyph}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {agentInfo.agentName}
                  </span>
                </div>

                <div>
                  {isFirst ? (
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  ) : isBrief && isHumanApproved ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isMeasurement ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                  ) : null}
                </div>
              </div>

              <div className="font-semibold text-white/90 text-xs truncate">
                {stage.label}
              </div>

              <div className="text-[9px] font-mono text-slate-500 block truncate">
                {isFirst
                  ? 'Выполнено'
                  : isMeasurement
                  ? 'Следующий шаг'
                  : isBrief
                  ? (isHumanApproved ? 'Подписано' : 'Черновик')
                  : 'Заблокировано'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


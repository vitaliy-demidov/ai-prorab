'use client';

import React from 'react';
import { PipelineStage } from '@/types/agent';
import { Check, Lock } from 'lucide-react';

interface PipelineStepperProps {
  stages: PipelineStage[];
  isHumanApproved: boolean;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  stages,
  isHumanApproved,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700">
          Маршрут проекта
        </span>
        <span className="text-[11px] text-slate-400">
          {isHumanApproved ? 'WorkBrief подтверждён заказчиком' : 'Текущий этап: первичный разбор'}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
        {stages.map((stage) => {
          const isFirst = stage.id === 'clarification';
          const isBrief = stage.id === 'workbrief';
          const isLocked = stage.id === 'rfq' || stage.id === 'comparison' || stage.id === 'human_confirmation' || stage.id === 'measurement';

          let stateClass = 'bg-slate-50 text-slate-400 border-slate-200';
          if (isFirst) {
            stateClass = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold';
          } else if (isBrief) {
            stateClass = isHumanApproved 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium'
              : 'bg-sky-50 text-sky-800 border-sky-200 font-medium';
          }

          return (
            <div
              key={stage.id}
              className={`p-2 rounded-lg border flex items-center justify-between gap-1 text-[11px] transition-all ${stateClass}`}
            >
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-mono mr-1">0{stage.stepNumber}</span>
                <span>{stage.label}</span>
              </div>
              <div>
                {isFirst ? (
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : isBrief && isHumanApproved ? (
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

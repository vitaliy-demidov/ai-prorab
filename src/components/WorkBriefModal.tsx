'use client';

import React, { useState } from 'react';
import { WorkBriefDraft } from '@/types/agent';
import { X, FileText, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

interface WorkBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: WorkBriefDraft | null;
  onApprove: (signature: string) => Promise<void>;
  isApproving: boolean;
}

export const WorkBriefModal: React.FC<WorkBriefModalProps> = ({
  isOpen,
  onClose,
  draft,
  onApprove,
  isApproving,
}) => {
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signatureName, setSignatureName] = useState('Виталий (Заказчик)');

  if (!isOpen || !draft) return null;

  const isAlreadyApproved = draft.status === 'APPROVED_BY_HUMAN';

  const handleApproveClick = async () => {
    if (!agreementChecked && !isAlreadyApproved) return;
    await onApprove(signatureName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
                  {draft.brief_id}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isAlreadyApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isAlreadyApproved ? 'Подтверждено человеком' : 'Черновик: требует подтверждения'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {draft.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status Alert */}
          {!isAlreadyApproved ? (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Безопасный контур</span>
                <span className="text-[11px] text-amber-800">
                  Этот черновик фиксирует параметры для выезда специалиста. Подтверждение черновика НЕ запускает отправку подрядчикам и не заказывает материалы.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">WorkBrief подтверждён. Внешние действия не выполнялись.</span>
                <span className="text-[11px] text-emerald-800">
                  Документ зафиксирован. Тендер и внешние контакты остаются заблокированными.
                </span>
              </div>
            </div>
          )}

          {/* Section 1: Facts */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40">
            <h4 className="text-[11px] uppercase font-bold text-slate-500 mb-2 font-mono">
              1. Подтверждённые параметры объекта
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Город</span>
                <span className="font-bold text-slate-800">{draft.facts.city.value || '—'}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Тип</span>
                <span className="font-bold text-slate-800">{draft.facts.property_type.value || '—'}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Площадь</span>
                <span className="font-bold text-slate-800">{draft.facts.area_sqm.value ? `${draft.facts.area_sqm.value} м²` : '—'}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Срок</span>
                <span className="font-bold text-slate-800">{draft.facts.target_timeline_months.value ? `${draft.facts.target_timeline_months.value} мес.` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: User answers / assumptions */}
          {draft.assumptions.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40">
              <h4 className="text-[11px] uppercase font-bold text-slate-500 mb-2 font-mono">
                2. Зафиксированные ответы заказчика
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                {draft.assumptions.map((ass, i) => (
                  <li key={i} className="leading-snug">
                    {ass}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 3: Open Unknowns */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40">
            <h4 className="text-[11px] uppercase font-bold text-slate-500 mb-2 font-mono">
              3. Вопросы для инструментального обмера
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
              {draft.open_unknowns.map((unk, i) => (
                <li key={i} className="leading-snug">
                  {unk}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Guardrails */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40">
            <h4 className="text-[11px] uppercase font-bold text-slate-500 mb-2 font-mono">
              4. Ограничения безопасности (Guardrails)
            </h4>
            <ul className="space-y-1 text-slate-600">
              {draft.pre_measurement_guardrails.map((g, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-slate-400">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer: Human Approval */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          {!isAlreadyApproved ? (
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-0.5"
                />
                <span className="text-xs text-slate-700">
                  <strong className="text-slate-900">Подтверждаю черновик задания:</strong> Данные проверены для передачи специалисту на обмер. Я уведомлен, что финальная цена до обмера не рассчитывается.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 whitespace-nowrap">Подпись:</span>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 w-full sm:w-56 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-white rounded-lg transition-all"
                  >
                    Закрыть
                  </button>
                  <button
                    onClick={handleApproveClick}
                    disabled={!agreementChecked || isApproving}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
                      agreementChecked && !isApproving
                        ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed text-slate-500'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isApproving ? 'Запись...' : 'Подтвердить черновик WorkBrief'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                WorkBrief подтверждён. Внешние действия не выполнялись.
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

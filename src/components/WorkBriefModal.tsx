'use client';

import React, { useState } from 'react';
import { WorkBriefDraft } from '@/types/agent';
import { X, FileText, CheckCircle2, AlertTriangle, UserCheck, ShieldCheck, Lock, FileCheck, Stamp } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="specular-card modal-enter rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/15 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-obsidian-950/90">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[11px] font-bold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                  {draft.brief_id} · REV {draft.revision || 1}.0
                </span>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                    isAlreadyApproved
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {isAlreadyApproved ? 'Утверждено человеком ✓' : 'Черновик: требует подписи'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1 font-sans">
                {draft.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-press p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status Alert */}
          {!isAlreadyApproved ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Безопасный контур спецификации</span>
                <span className="text-[11px] text-amber-200/90 leading-relaxed block mt-0.5">
                  Черновик фиксирует параметры для инструментального обмера специалистом. Подтверждение черновика <strong>НЕ</strong> списывает средства, <strong>НЕ</strong> отправляет сообщения подрядчикам и <strong>НЕ</strong> заказывает материалы.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">WorkBrief официально подтверждён заказчиком</span>
                <span className="text-[11px] text-emerald-200/90 leading-relaxed block mt-0.5">
                  Документ зафиксирован. Тендер и внешние контакты остаются в защитном заблокированном состоянии (LOCKED).
                </span>
              </div>
            </div>
          )}

          {/* Section 1: Facts */}
          <div className="border border-white/10 rounded-xl p-3.5 bg-obsidian-950/60">
            <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2.5 font-mono flex items-center justify-between">
              <span>1. Подтверждённые параметры объекта</span>
              <span className="text-emerald-400">USER Provenance Verified</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg bg-obsidian-900 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">Город</span>
                <span className="font-bold text-white text-xs mt-0.5 block">{draft.facts.city.value || '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-obsidian-900 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">Тип</span>
                <span className="font-bold text-white text-xs mt-0.5 block">{draft.facts.property_type.value || '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-obsidian-900 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">Площадь</span>
                <span className="font-bold text-sky-400 text-xs mt-0.5 block font-mono">{draft.facts.area_sqm.value ? `${draft.facts.area_sqm.value} м²` : '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-obsidian-900 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">Срок въезда</span>
                <span className="font-bold text-white text-xs mt-0.5 block font-mono">{draft.facts.target_timeline_months.value ? `${draft.facts.target_timeline_months.value} мес.` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: User answers / assumptions */}
          {draft.assumptions.length > 0 && (
            <div className="border border-white/10 rounded-xl p-3.5 bg-obsidian-950/60">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 font-mono">
                2. Зафиксированные ответы заказчика
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
                {draft.assumptions.map((ass, i) => (
                  <li key={i} className="leading-snug">
                    {ass}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 3: Open Unknowns */}
          <div className="border border-white/10 rounded-xl p-3.5 bg-obsidian-950/60">
            <h4 className="text-[10px] uppercase font-bold text-amber-400 mb-2 font-mono flex items-center justify-between">
              <span>3. Вопросы для инструментального обмера инженером</span>
              <span className="text-[10px] text-slate-400">Обязательно до сметы</span>
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
              {draft.open_unknowns.map((unk, i) => (
                <li key={i} className="leading-snug">
                  {unk}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Guardrails */}
          <div className="border border-white/10 rounded-xl p-3.5 bg-obsidian-950/60">
            <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. Защитные инварианты (Guardrails)</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              {draft.pre_measurement_guardrails.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer: Human Approval */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-obsidian-950">
          {!isAlreadyApproved ? (
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-obsidian-900 text-sky-500 focus:ring-sky-500 mt-0.5"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Подтверждаю черновик задания:</strong> Данные проверены для передачи специалисту на обмер. Я уведомлен, что финальная цена до инструментального обмера не рассчитывается.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 whitespace-nowrap font-mono">Подпись:</span>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/15 bg-obsidian-900 font-medium text-white w-full sm:w-60 focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="btn-press px-3.5 py-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-lg cursor-pointer font-mono"
                  >
                    Закрыть
                  </button>
                  <button
                    onClick={handleApproveClick}
                    disabled={!agreementChecked || isApproving}
                    className={`btn-press flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-glow-emerald ${
                      agreementChecked && !isApproving
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 cursor-pointer'
                        : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
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
              <span className="text-xs text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                WorkBrief подтверждён. Внешние действия не выполнялись.
              </span>
              <button
                onClick={onClose}
                className="btn-press px-4 py-1.5 text-xs bg-white/10 text-white hover:bg-white/20 border border-white/15 rounded-lg cursor-pointer font-mono"
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



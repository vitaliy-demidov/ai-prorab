'use client';

import React, { useState } from 'react';
import { WorkBriefDraft } from '@/types/agent';
import { 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  ShieldCheck, 
  Printer, 
  Calendar, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  Compass,
  FileSignature
} from 'lucide-react';

interface WorkBriefDocumentViewProps {
  draft: WorkBriefDraft;
  onApprove: (signature: string) => Promise<void>;
  isApproving: boolean;
  onOpenBooking?: () => void;
  bookingConfirmedDate?: string | null;
  isCompact?: boolean;
}

export const WorkBriefDocumentView: React.FC<WorkBriefDocumentViewProps> = ({
  draft,
  onApprove,
  isApproving,
  onOpenBooking,
  bookingConfirmedDate,
  isCompact = false,
}) => {
  const [agreementChecked, setAgreementChecked] = useState(true);
  const [signatureName, setSignatureName] = useState('Виталий (Заказчик)');
  const [copied, setCopied] = useState(false);

  const isAlreadyApproved = draft.status === 'APPROVED_BY_HUMAN';

  const handleApproveClick = async () => {
    if (!agreementChecked) {
      setAgreementChecked(true);
    }
    await onApprove(signatureName);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `WorkBrief: ${draft.title} (${draft.brief_id} Rev ${draft.revision || 1}.0) - Статус: ${
          isAlreadyApproved ? 'Утверждено заказчиком' : 'Черновик'
        }`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-[#0c0e15] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden text-slate-100 transition-all">
      {/* Document Header */}
      <div className="p-4 sm:p-6 border-b border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-md">
                  {draft.brief_id} · REV {draft.revision || 1}.0
                </span>
                <span
                  className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                    isAlreadyApproved
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {isAlreadyApproved ? '✓ ОФИЦИАЛЬНО УТВЕРЖДЕНО' : 'ТРЕБУЕТ ПОДПИСАНИЯ'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white mt-1.5 font-sans tracking-tight">
                {draft.title}
              </h2>
            </div>
          </div>

          {/* Quick Actions (Print, Copy) */}
          <div className="flex items-center gap-2 self-end sm:self-auto no-print">
            <button
              onClick={handlePrint}
              title="Распечатать или сохранить в PDF"
              className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-mono cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать / PDF</span>
            </button>
            <button
              onClick={handleCopyLink}
              title="Скопировать параметры спецификации"
              className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-mono cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано' : 'Копия'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Body */}
      <div className="p-4 sm:p-6 space-y-5 text-xs">
        {/* Status Callout */}
        {!isAlreadyApproved ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white block">Предварительный контур спецификации</span>
              <span className="text-[11px] text-amber-200/90 block mt-0.5">
                Черновик фиксирует исходные параметры для выезда инженера-замерщика. Финальная сметная стоимость формируется строго после инструментального обмера.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block text-sm">
                  Техническое задание официально заверено цифровой подписью
                </span>
                <span className="text-xs text-emerald-200/90 block mt-0.5">
                  Параметры переданы в инженерный контур для проведения инструментального обмера.
                </span>
              </div>
            </div>

            {/* Next Step Action */}
            {onOpenBooking && (
              <button
                onClick={onOpenBooking}
                className="btn-press shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 text-xs font-bold shadow-md cursor-pointer no-print"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {bookingConfirmedDate
                    ? `Замер назначен на ${bookingConfirmedDate}`
                    : 'Записаться на замер'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Section 1: Verified Object Parameters */}
        <div className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              1. Подтверждённые параметры объекта
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              USER Provenance Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block font-mono">Город</span>
              <span className="font-semibold text-white text-sm mt-0.5 block">
                {draft.facts.city.value || 'Уточняется'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block font-mono">Тип объекта</span>
              <span className="font-semibold text-white text-sm mt-0.5 block">
                {draft.facts.property_type.value || 'Объект'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block font-mono">Площадь</span>
              <span className="font-bold text-sky-400 text-sm mt-0.5 block font-mono">
                {draft.facts.area_sqm.value ? `${draft.facts.area_sqm.value} м²` : 'Не указана'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block font-mono">Целевой срок</span>
              <span className="font-semibold text-white text-sm mt-0.5 block font-mono">
                {draft.facts.target_timeline_months.value
                  ? `${draft.facts.target_timeline_months.value} мес.`
                  : 'По графику'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Customer Clarifications & Assumptions */}
        {draft.assumptions.length > 0 && (
          <div className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.02]">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono block mb-2.5">
              2. Зафиксированные требования заказчика
            </span>
            <ul className="space-y-1.5 list-disc pl-4 text-slate-300 text-xs">
              {draft.assumptions.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 3: Laser Measurement Program (Unknowns to be verified) */}
        <div className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
              3. Программа инструментального обмера инженером (Виктор)
            </span>
            <span className="text-[10px] font-mono text-amber-400">Обязательно до сметы</span>
          </div>
          <ul className="space-y-2 text-slate-300 text-xs">
            {draft.open_unknowns.map((unk, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{unk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 4: Protective Guardrails */}
        <div className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              4. Защитные инварианты регламента
            </span>
          </div>
          <ul className="space-y-1.5 text-slate-400 text-[11px]">
            {draft.pre_measurement_guardrails.map((g, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Document Footer: Digital Signature Station */}
      <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#080a0f] no-print">
        {!isAlreadyApproved ? (
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black text-sky-500 focus:ring-sky-500 mt-0.5 cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Подтверждаю техническое задание:</strong> Данные проверены для передачи инженеру на выездной инструментальный обмер. Я уведомлен, что финальная стоимость формируется строго после обмеров.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400 whitespace-nowrap font-mono">Подпись заказчика:</span>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="text-xs px-3.5 py-2 rounded-xl border border-white/15 bg-black/60 font-medium text-white w-full sm:w-64 focus:outline-hidden focus:border-sky-500 transition-colors"
                  placeholder="ФИО или подпись..."
                />
              </div>

              <button
                onClick={handleApproveClick}
                disabled={!agreementChecked || isApproving}
                className={`btn-press flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  agreementChecked && !isApproving
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 cursor-pointer shadow-lg'
                    : 'bg-white/[0.05] text-slate-500 border border-white/[0.08] cursor-not-allowed'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{isApproving ? 'Фиксация подписи...' : 'Подписать и утвердить WorkBrief'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-300 block">
                  Заверено цифровой подписью: {signatureName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Ревизия v{draft.revision || 1}.0 · Внешние финансовые действия заблокированы (LOCKED)
                </span>
              </div>
            </div>

            {onOpenBooking && (
              <button
                onClick={onOpenBooking}
                className="btn-press flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] text-xs font-medium cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {bookingConfirmedDate ? `Замер: ${bookingConfirmedDate}` : 'Согласовать дату обмера'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

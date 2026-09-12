'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Shield, Wrench, Phone } from 'lucide-react';

interface MeasurementBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (slot: string, address: string) => void;
  currentConfirmedSlot: string | null;
}

const AVAILABLE_SLOTS = [
  { id: 'tomorrow-morning', label: 'Завтра, 13 сентября', time: '11:00 - 13:00', badge: 'Рекомендуется' },
  { id: 'tomorrow-afternoon', label: 'Завтра, 13 сентября', time: '15:00 - 17:00' },
  { id: 'dayafter-morning', label: 'Послезавтра, 14 сентября', time: '10:00 - 12:00' },
  { id: 'dayafter-afternoon', label: 'Послезавтра, 14 сентября', time: '14:00 - 16:00' },
];

export const MeasurementBookingModal: React.FC<MeasurementBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentConfirmedSlot,
}) => {
  const [selectedSlot, setSelectedSlot] = useState(AVAILABLE_SLOTS[0].id);
  const [address, setAddress] = useState('г. Астана, ул. Достык, ЖК Керуен, кв. 42');
  const [phone, setPhone] = useState('+7 (777) 123-45-67');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const slotObj = AVAILABLE_SLOTS.find((s) => s.id === selectedSlot);
    const slotString = slotObj ? `${slotObj.label} (${slotObj.time})` : 'Завтра, 11:00 - 13:00';
    onConfirm(slotString, address);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="specular-card modal-enter rounded-2xl max-w-lg w-full shadow-2xl border border-white/15 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0b0e14]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Выездной инструментальный обмер
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Куратор: Виктор · Главный инженер обмера (AGT-02)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-press p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Success Notification */}
          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-white">Выезд успешно зафиксирован!</strong>
                <span className="text-[11px] text-emerald-200/90">
                  Инженер Виктор получил задание и прибудет в согласованное время.
                </span>
              </div>
            </div>
          )}

          {/* Engineer Dossier Banner */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-300 text-xs">
                02
              </div>
              <div>
                <span className="font-semibold text-white block text-xs">Виктор Макаров</span>
                <span className="text-[10px] text-slate-400 block font-mono">Стаж 12 лет · Аттестат СНиП РК</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                Leica 3D + Склерометр
              </span>
            </div>
          </div>

          {/* Select Slot */}
          <div>
            <label className="block text-xs font-semibold text-white mb-2 font-mono uppercase tracking-wider">
              Выберите удобное окно для замера:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    type="button"
                    className={`btn-press p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-white text-xs">{slot.label}</span>
                      {slot.badge && (
                        <span className="text-[9px] bg-sky-500/15 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded font-mono">
                          {slot.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {slot.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address & Phone */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Адрес объекта:
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-transparent w-full focus:outline-hidden text-xs text-white placeholder-slate-500"
                  placeholder="Адрес объекта..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Телефон для связи с замерщиком:
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent w-full focus:outline-hidden text-xs text-white placeholder-slate-500"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-400 flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
            <span>
              По результатам инструментального выезда формируется верифицированный протокол обмера, на базе которого рассчитывается точная смета.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0b0e14] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="btn-press px-4 py-2 text-xs text-slate-400 hover:text-white border border-white/10 rounded-xl cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="btn-press px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold text-xs cursor-pointer shadow-lg flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Подтвердить выезд инженера</span>
          </button>
        </div>
      </div>
    </div>
  );
};

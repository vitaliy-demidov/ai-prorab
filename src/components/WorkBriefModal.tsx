'use client';

import React from 'react';
import { WorkBriefDraft } from '@/types/agent';
import { X } from 'lucide-react';
import { WorkBriefDocumentView } from './WorkBriefDocumentView';

interface WorkBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: WorkBriefDraft | null;
  onApprove: (signature: string) => Promise<void>;
  isApproving: boolean;
  onOpenBooking?: () => void;
  bookingConfirmedDate?: string | null;
}

export const WorkBriefModal: React.FC<WorkBriefModalProps> = ({
  isOpen,
  onClose,
  draft,
  onApprove,
  isApproving,
  onOpenBooking,
  bookingConfirmedDate,
}) => {
  if (!isOpen || !draft) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-3xl w-full my-8 modal-enter">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-white/20 shadow-xl cursor-pointer"
          title="Закрыть окно"
        >
          <X className="w-4 h-4" />
        </button>

        <WorkBriefDocumentView
          draft={draft}
          onApprove={onApprove}
          isApproving={isApproving}
          onOpenBooking={onOpenBooking}
          bookingConfirmedDate={bookingConfirmedDate}
        />
      </div>
    </div>
  );
};

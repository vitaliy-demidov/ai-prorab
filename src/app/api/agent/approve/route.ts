import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { approveWorkBriefDraft } from '@/core/tools/create-draft';

const ApproveSchema = z.object({
  idempotency_key: z.string(),
  user_signature: z.string().min(2, 'Имя или подпись обязательны'),
  confirmed_by_human: z.literal(true, {
    errorMap: () => ({ message: 'Требуется явное подтверждение человека' }),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idempotency_key, user_signature } = ApproveSchema.parse(body);

    // Подтверждается ТОЛЬКО черновик WorkBrief. Никакие внешние этапы не разблокируются.
    const approvedDraft = approveWorkBriefDraft(idempotency_key, user_signature);

    return NextResponse.json({
      success: true,
      message: 'WorkBrief подтверждён. Внешние действия не выполнялись.',
      approved_draft: approvedDraft,
      external_actions_status: 'LOCKED',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации подтверждения', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Ошибка обработки подтверждения' },
      { status: 500 }
    );
  }
}

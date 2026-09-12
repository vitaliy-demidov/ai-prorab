import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ConfirmSuggestionRequestSchema } from '@/types/agent';
import { executeConfirmSuggestionInDraft } from '@/core/tools/create-draft';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ConfirmSuggestionRequestSchema.parse(body);

    const result = executeConfirmSuggestionInDraft({
      idempotency_key: validated.idempotency_key,
      suggestion: validated.suggestion,
      confirmed_by_human: true,
    });

    return NextResponse.json({
      success: true,
      facts: result.updatedFacts,
      workbrief_draft: result.updatedDraft,
      audit_trace: result.auditTrace,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации параметров подтверждения', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Ошибка подтверждения предложения' },
      { status: 400 }
    );
  }
}

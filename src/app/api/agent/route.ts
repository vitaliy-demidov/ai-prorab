import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AgentOrchestrator } from '@/core/orchestrator';

const RequestSchema = z.object({
  query: z.string().min(3, 'Запрос должен содержать минимум 3 символа'),
  createDraft: z.boolean().optional().default(true),
  idempotencyKey: z.string().optional(),
  userAnswers: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RequestSchema.parse(body);

    const result = await AgentOrchestrator.run({
      query: validated.query,
      createDraft: validated.createDraft,
      idempotencyKey: validated.idempotencyKey,
      userAnswers: validated.userAnswers,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации параметров', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка оркестратора' },
      { status: 500 }
    );
  }
}

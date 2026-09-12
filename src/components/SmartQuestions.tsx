'use client';

import React from 'react';
import { SmartQuestion } from '@/types/agent';
import { HelpCircle, Check, MessageSquareCode, CheckCircle2, CornerDownRight } from 'lucide-react';

interface SmartQuestionsProps {
  questions: SmartQuestion[];
  userAnswers: Record<string, string>;
  onAnswerQuestion: (questionId: string, answer: string) => void;
}

export const SmartQuestions: React.FC<SmartQuestionsProps> = ({
  questions,
  userAnswers,
  onAnswerQuestion,
}) => {
  return (
    <div className="specular-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Уточняющие вопросы агентов
            </h3>
            <p className="text-[11px] text-slate-400">
              Кураторы: Алексей & Марина • Снижение энтропии перед выпуском спецификации
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
          Строго 3 вопроса
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const currentAnswer = userAnswers[q.id];
          const isAnswered = Boolean(currentAnswer);

          return (
            <div
              key={q.id}
              className={`p-3.5 rounded-xl border transition-colors ${
                isAnswered 
                  ? 'bg-obsidian-800/90 border-sky-500/30 shadow-glow-cyan' 
                  : 'bg-obsidian-900 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {q.question}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <HelpCircle className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{q.why_needed}</span>
                    </p>
                  </div>
                </div>

                {isAnswered && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Зафиксировано в ТЗ
                  </span>
                )}
              </div>

              {/* Варианты ответов */}
              <div className="mt-3 flex flex-wrap gap-2 pl-7">
                {q.recommended_options.map((opt, optIdx) => {
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => onAnswerQuestion(q.id, opt)}
                      className={`btn-press text-xs px-3 py-1.5 rounded-lg text-left border cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-500 text-obsidian-950 border-sky-400 shadow-glow-cyan font-bold'
                          : 'bg-obsidian-950/80 hover:bg-obsidian-850 text-slate-300 hover:text-white border-white/10'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 shrink-0 stroke-[3]" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-2 text-[11px] pl-7 text-slate-400 font-mono flex items-center gap-1.5">
                  <CornerDownRight className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>
                    Ответ: <strong className="text-sky-300">«{currentAnswer}»</strong> (автоматически обновлена ревизия ТЗ)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};



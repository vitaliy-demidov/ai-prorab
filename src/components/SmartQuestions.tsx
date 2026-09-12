'use client';

import React from 'react';
import { SmartQuestion } from '@/types/agent';
import { HelpCircle, Check } from 'lucide-react';

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
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800">
            Вопросы для формирования черновика ТЗ
          </h3>
          <p className="text-[11px] text-slate-500">
            Агент задает не более трёх вопросов для снижения неопределенности
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Лимит: 3 вопроса
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const currentAnswer = userAnswers[q.id];
          const isAnswered = Boolean(currentAnswer);

          return (
            <div
              key={q.id}
              className={`p-3 rounded-lg border transition-all ${
                isAnswered ? 'bg-sky-50/40 border-sky-200' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{q.why_needed}</span>
                    </p>
                  </div>
                </div>

                {isAnswered && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Учтено в черновике
                  </span>
                )}
              </div>

              {/* Быстрые варианты ответов */}
              <div className="mt-2.5 flex flex-wrap gap-1.5 pl-7">
                {q.recommended_options.map((opt, optIdx) => {
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => onAnswerQuestion(q.id, opt)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-all text-left border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-medium'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-2 text-[11px] pl-7 text-slate-600">
                  Выбранный ответ: <span className="font-semibold text-slate-900">«{currentAnswer}»</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

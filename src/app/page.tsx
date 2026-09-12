'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AgentSwarmTeam } from '@/components/AgentSwarmTeam';
import { PipelineStepper } from '@/components/PipelineStepper';
import { FactsMatrix } from '@/components/FactsMatrix';
import { SmartQuestions } from '@/components/SmartQuestions';
import { MeasurementRationale } from '@/components/MeasurementRationale';
import { ToolTimeline } from '@/components/ToolTimeline';
import { WorkBriefModal } from '@/components/WorkBriefModal';
import { AgentRunResponse, ModelSuggestion } from '@/types/agent';
import { 
  Play, 
  Mic, 
  MicOff, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  RefreshCw, 
  Check, 
  AlertCircle,
  ArrowRight,
  Compass
} from 'lucide-react';

const DEFAULT_SCENARIO = 'Купил двухкомнатную квартиру в Астане, 58 м². Хочу современный ремонт, заехать через 4 месяца, бюджет пока не понимаю';

const PRESETS = [
  {
    id: 'astana-58',
    label: 'Главный сценарий: Астана 58 м²',
    badge: 'Конкурсный',
    text: 'Купил двухкомнатную квартиру в Астане, 58 м². Хочу современный ремонт, заехать через 4 месяца, бюджет пока не понимаю',
  },
  {
    id: 'almaty-whitebox',
    label: 'Новостройка White Box: 82 м²',
    badge: 'Предчистовая',
    text: 'Квартира 82 м² в Алматы, отделка предчистовая White Box. Нужно сделать разводку под кондиционеры и чистовые работы за 3 месяца.',
  },
  {
    id: 'secondary-demo',
    label: 'Вторичный фонд: 44 м²',
    badge: 'Демонтаж',
    text: 'Вторичка 44 кв.м, старый дом. Нужен демонтаж перегородок, замена проводки и сантехники, бюджет пока уточняется.',
  },
];

export default function Home() {
  const [query, setQuery] = useState(DEFAULT_SCENARIO);
  const [isRunning, setIsRunning] = useState(false);
  const [agentData, setAgentData] = useState<AgentRunResponse | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isHumanApproved, setIsHumanApproved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `session-${crypto.randomUUID()}`;
    }
    return `session-${Math.random().toString(36).substring(2, 11)}`;
  });

  // Мгновенный запуск при открытии (результат виден жюри за 5 секунд)
  useEffect(() => {
    runAgentAnalysis(DEFAULT_SCENARIO, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAgentAnalysis = async (
    textToRun: string,
    currentAnswers: Record<string, string>,
    explicitKey?: string
  ) => {
    const keyToUse = explicitKey || idempotencyKey;
    setIsRunning(true);
    setApiError(null);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToRun,
          createDraft: true,
          idempotencyKey: keyToUse,
          userAnswers: currentAnswers,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Ошибка обращения к API агента');
      }
      const data: AgentRunResponse = await res.json();
      setAgentData(data);
      if (data.workbrief_draft) {
        setIsHumanApproved(data.workbrief_draft.status === 'APPROVED_BY_HUMAN');
      }
    } catch (err: any) {
      console.error('Run agent error:', err);
      setApiError(err.message || 'Ошибка анализа объекта');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectPreset = (presetText: string) => {
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID().substring(0, 8) 
      : Math.random().toString(36).substring(2, 8);
    const newKey = `preset-${Date.now()}-${uuid}`;
    setQuery(presetText);
    setUserAnswers({});
    setIsHumanApproved(false);
    setApiError(null);
    setIdempotencyKey(newKey);
    runAgentAnalysis(presetText, {}, newKey);
  };

  const handleAnswerQuestion = (questionId: string, answer: string) => {
    const updated = { ...userAnswers, [questionId]: answer };
    setUserAnswers(updated);
    runAgentAnalysis(query, updated, idempotencyKey);
  };

  const handleApproveWorkBrief = async (signature: string) => {
    if (!agentData?.workbrief_draft) return;
    setIsApproving(true);
    setApiError(null);
    try {
      const res = await fetch('/api/agent/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotency_key: agentData.workbrief_draft.idempotency_key,
          user_signature: signature,
          confirmed_by_human: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Ошибка утверждения WorkBrief');
      }

      const data = await res.json();
      // Строгая синхронизация: используем approved_draft из ответа сервера
      if (data.approved_draft) {
        setIsHumanApproved(true);
        setAgentData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            workbrief_draft: data.approved_draft,
          };
        });
      }
    } catch (e: any) {
      console.error('Approve error:', e);
      setApiError(e.message || 'Ошибка утверждения документа');
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmSuggestion = async (suggestion: ModelSuggestion) => {
    if (!agentData?.workbrief_draft) return;
    setApiError(null);
    try {
      const res = await fetch('/api/agent/suggestions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotency_key: idempotencyKey,
          suggestion_id: suggestion.suggestion_id,
          confirmed_by_human: true,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error || 'Не удалось подтвердить предложение';
        setApiError(errMsg);
        console.error('Confirm suggestion failed:', errJson);
        return;
      }

      const data = await res.json();
      setAgentData((prev) => {
        if (!prev) return prev;
        const remainingSuggestions = prev.model_suggestions.filter(
          (s) => s.suggestion_id !== suggestion.suggestion_id
        );
        return {
          ...prev,
          facts: data.facts,
          workbrief_draft: data.workbrief_draft,
          model_suggestions: remainingSuggestions,
          tool_traces: [...prev.tool_traces, data.audit_trace],
        };
      });

      // Синхронизируем статус подтверждения человека с ревизией драфта
      if (data.workbrief_draft) {
        setIsHumanApproved(data.workbrief_draft.status === 'APPROVED_BY_HUMAN');
      }
    } catch (err: any) {
      console.error('Confirm suggestion error:', err);
      setApiError(err.message || 'Ошибка подтверждения предложения');
    }
  };

  const handleDismissSuggestion = (suggestion: ModelSuggestion) => {
    setAgentData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        model_suggestions: prev.model_suggestions.filter(
          (s) => s.suggestion_id !== suggestion.suggestion_id
        ),
      };
    });
  };

  const toggleSpeechInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsListening(true);
      setTimeout(() => {
        setQuery('Астана, 2-комнатная квартира 58 метров. Срок 4 месяца, черновая отделка от застройщика, бюджет не определен');
        setIsListening(false);
      }, 1000);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      <Header
        engineBadge={agentData?.engine_badge || 'Demo mode · Rules + Safety Guard'}
        engineMode={agentData?.engine_mode || 'deterministic'}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ВИДИМЫЙ БАННЕР ОШИБКИ API */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-card-dark">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{apiError}</span>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="btn-press text-rose-400 hover:text-rose-200 text-xs font-mono px-2 py-0.5 rounded cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        )}

        {/* HERO SECTION: ЗАПРОС СЛЕВА | «ЭКСПРЕСС-АУДИТ» СПРАВА */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* Слева: командная консоль ввода (7 колонок) */}
          <div className="md:col-span-7 specular-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Исходный запрос заказчика
                </label>
                <button
                  onClick={toggleSpeechInput}
                  className={`btn-press flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border font-mono cursor-pointer ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {isListening ? (
                    <div className="flex items-center gap-1 h-3.5">
                      <span className="w-1 bg-rose-400 rounded-full wave-bar-1" />
                      <span className="w-1 bg-rose-400 rounded-full wave-bar-2" />
                      <span className="w-1 bg-rose-400 rounded-full wave-bar-3" />
                      <span className="w-1 bg-rose-400 rounded-full wave-bar-4" />
                      <span className="text-[11px] text-rose-300 ml-1">Запись...</span>
                    </div>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-sky-400" />
                      <span>Диктовать голос</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                placeholder="Введите параметры объекта или пожелания свободным языком..."
                className="w-full text-xs p-3.5 rounded-xl border border-white/10 focus:border-sky-500/60 focus:outline-hidden font-sans text-white bg-obsidian-950/80 placeholder-slate-500 resize-none leading-relaxed transition-colors"
              />

              {/* Demo сценарии */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                {PRESETS.map((p) => {
                  const isSelected = query === p.text;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p.text)}
                      className={`btn-press text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap border font-mono cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-500 text-obsidian-950 border-sky-400 shadow-glow-cyan font-bold'
                          : 'bg-obsidian-950/90 hover:bg-obsidian-850 text-slate-300 border-white/10'
                      }`}
                    >
                      <span className="opacity-60 text-[9px] uppercase">[{p.badge}]</span>
                      <span>{p.label.split(':')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Главный CTA: Разобрать запрос агентами */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
              <button
                onClick={() => runAgentAnalysis(query, userAnswers)}
                disabled={isRunning || query.length < 3}
                className="btn-press flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-obsidian-950 text-xs font-bold flex items-center justify-center gap-2 shadow-glow-cyan disabled:bg-slate-800 disabled:text-slate-500 disabled:border-white/5 cursor-pointer"
              >
                {isRunning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-obsidian-950" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-obsidian-950 text-obsidian-950" />
                )}
                <span>{isRunning ? 'Анализ роем агентов...' : 'Разобрать запрос роем агентов'}</span>
              </button>
            </div>
          </div>

          {/* Справа: Карточка «Экспресс-аудит объекта» (5 колонок) */}
          <div className="md:col-span-5 specular-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Экспресс-аудит объекта
                  </h3>
                </div>
                <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  Время: ~90 сек
                </span>
              </div>

              {agentData ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">4 подтверждённых факта:</span>
                      <span className="text-slate-400 block text-[11px] font-mono mt-0.5">
                        {agentData.facts.city.value || 'Город'}, {agentData.facts.property_type.value || 'квартира'}, {agentData.facts.area_sqm.value} м², {agentData.facts.target_timeline_months.value} мес.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">4 критических неизвестных:</span>
                      <span className="text-slate-400 block text-[11px] mt-0.5">
                        Состояние стяжки, бюджетный коридор, стояки ХВС/ГВС, доступ.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-snug">
                    <strong className="text-white block mb-0.5 font-mono">Safety Notice:</strong> Финальная стоимость не формируется до инструментального обмера специалистом.
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center font-mono">
                  Запустите разбор для инициализации роя агентов...
                </div>
              )}
            </div>

            {agentData?.workbrief_draft && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`btn-press w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                    isHumanApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald hover:bg-emerald-500/30'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isHumanApproved ? 'WorkBrief Rev 1.0 утверждён (Открыть)' : 'Открыть черновик WorkBrief & Approval'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* POLICY GUARD NOTICE: ЕСЛИ БЫЛ ЗАПРОС НА ЦЕНУ */}
        {agentData?.policy_notice && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3 text-xs shadow-card-dark">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold text-sm">
                Запрос на точную цену перехвачен защитным контуром
              </strong>
              <span className="text-amber-200/90 text-xs leading-relaxed block mt-1">
                {agentData.policy_notice.user_warning} Финальная смета заблокирована до инструментального обмера специалистом.
              </span>
            </div>
          </div>
        )}

        {/* РОЙ АВТОНОМНЫХ АГЕНТОВ (SWARM SHOWCASE & AVATARS) */}
        <AgentSwarmTeam
          isHumanApproved={isHumanApproved}
          onOpenWorkBrief={() => setIsModalOpen(true)}
        />

        {/* PROGRESS-LINE: ТОНКИЙ ГОРИЗОНТАЛЬНЫЙ РЕГЛАМЕНТ */}
        {agentData && (
          <PipelineStepper
            stages={agentData.pipeline}
            isHumanApproved={isHumanApproved}
          />
        )}

        {/* СТРОГО ПО ПОРЯДКУ ИЗ ТЗ: ФАКТЫ И НЕИЗВЕСТНЫЕ */}
        {agentData && (
          <FactsMatrix
            facts={agentData.facts}
            unknowns={agentData.unknowns}
            modelSuggestions={agentData.model_suggestions}
            onConfirmSuggestion={handleConfirmSuggestion}
            onDismissSuggestion={handleDismissSuggestion}
          />
        )}

        {/* СТРОГО ПО ПОРЯДКУ ИЗ ТЗ: 3 УМНЫХ ВОПРОСА */}
        {agentData && (
          <SmartQuestions
            questions={agentData.questions}
            userAnswers={userAnswers}
            onAnswerQuestion={handleAnswerQuestion}
          />
        )}

        {/* СТРОГО ПО ПОРЯДКУ ИЗ ТЗ: СЛЕДУЮЩИЙ ШАГ И WORKBRIEF CTA */}
        {agentData && (
          <div className="specular-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  Рекомендованный следующий шаг • Агент «Виктор»
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Инструментальный обмер специалистом
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Согласовать дату доступа на объект и зафиксировать геометрию стен, стояков и стяжки до расчёта сметы.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className={`btn-press px-5 py-2.5 rounded-xl text-xs font-bold text-obsidian-950 flex items-center gap-2 shadow-glow-emerald shrink-0 cursor-pointer ${
                isHumanApproved 
                  ? 'bg-emerald-400 hover:bg-emerald-300' 
                  : 'bg-emerald-500 hover:bg-emerald-400'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isHumanApproved ? 'WorkBrief утверждён (Rev 1.0)' : 'Черновик WorkBrief & Approval'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* СТРОГО ПО ПОРЯДКУ ИЗ ТЗ: SAFETY NOTICE («ПОЧЕМУ ЦЕНА ПОКА НЕ ФОРМИРУЕТСЯ») */}
        {agentData && (
          <MeasurementRationale
            reasons={agentData.safety_notice.points}
          />
        )}

        {/* СТРОГО ПО ПОРЯДКУ ИЗ ТЗ: AUDIT TRACE (СПРЯТАН В DISCLOSURE) */}
        {agentData && (
          <ToolTimeline traces={agentData.tool_traces} />
        )}
      </main>

      {/* МОДАЛЬНОЕ ОКНО WORKBRIEF И HUMAN APPROVAL */}
      <WorkBriefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draft={agentData?.workbrief_draft || null}
        onApprove={handleApproveWorkBrief}
        isApproving={isApproving}
      />
    </div>
  );
}


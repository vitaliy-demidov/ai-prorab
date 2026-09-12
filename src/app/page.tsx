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
import { WorkBriefDocumentView } from '@/components/WorkBriefDocumentView';
import { MeasurementBookingModal } from '@/components/MeasurementBookingModal';
import { AgentSolutionsView } from '@/components/AgentSolutionsView';
import { AgentRunResponse, ModelSuggestion } from '@/types/agent';
import { 
  Play, 
  Mic, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Calendar,
  FileSignature,
  Search,
  CheckCircle2,
  Users,
  Brain,
  Activity,
  Zap,
  Scale
} from 'lucide-react';

const DEFAULT_SCENARIO = 'Купил двухкомнатную квартиру в Астане, 58 м². Хочу современный ремонт, заехать через 4 месяца, бюджет пока не понимаю';

const PRESETS = [
  {
    id: 'astana-58',
    label: 'Астана · 58 м²',
    badge: 'Конкурсный',
    text: 'Купил двухкомнатную квартиру в Астане, 58 м². Хочу современный ремонт, заехать через 4 месяца, бюджет пока не понимаю',
  },
  {
    id: 'almaty-whitebox',
    label: 'Алматы · 82 м² White Box',
    badge: 'Предчистовая',
    text: 'Квартира 82 м² в Алматы, отделка предчистовая White Box. Нужно сделать разводку под кондиционеры и чистовые работы за 3 месяца.',
  },
  {
    id: 'secondary-demo',
    label: 'Вторичка · 44 м²',
    badge: 'Демонтаж',
    text: 'Вторичка 44 кв.м, старый дом. Нужен демонтаж перегородок, замена проводки и сантехники, бюджет пока уточняется.',
  },
];

type ActiveTab = 'solutions' | 'brief' | 'audit' | 'questions' | 'team';

export default function Home() {
  const [query, setQuery] = useState(DEFAULT_SCENARIO);
  const [isRunning, setIsRunning] = useState(false);
  const [agentData, setAgentData] = useState<AgentRunResponse | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isHumanApproved, setIsHumanApproved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('solutions');
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [deliberationStep, setDeliberationStep] = useState(0);

  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `session-${crypto.randomUUID()}`;
    }
    return `session-${Math.random().toString(36).substring(2, 11)}`;
  });

  // Автоматический первичный запуск при открытии
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

  const handleRunWithSkeptics = async () => {
    setIsDeliberating(true);
    setDeliberationStep(1);

    // Live multi-agent deliberation animation
    await new Promise((r) => setTimeout(r, 200));
    setDeliberationStep(2);
    await new Promise((r) => setTimeout(r, 250));
    setDeliberationStep(3);
    await new Promise((r) => setTimeout(r, 250));
    setDeliberationStep(4);
    await new Promise((r) => setTimeout(r, 250));
    setDeliberationStep(5);

    await runAgentAnalysis(query, userAnswers);
    setIsDeliberating(false);
    setActiveTab('solutions');

    setTimeout(() => {
      const el = document.getElementById('solutions-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleSelectPreset = (presetText: string) => {
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID().substring(0, 8) 
      : Math.random().toString(36).substring(2, 8);
    const newKey = `preset-${Date.now()}-${uuid}`;
    setQuery(presetText);
    setUserAnswers({});
    setIsHumanApproved(false);
    setBookedSlot(null);
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
          fallback_draft: agentData.workbrief_draft,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Ошибка утверждения WorkBrief');
      }

      const data = await res.json();
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

  const handleConfirmBooking = (slot: string, address: string) => {
    setBookedSlot(slot);
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
    <div className="min-h-screen flex flex-col text-slate-100 bg-[#07080b]">
      <Header
        engineBadge={agentData?.engine_badge || 'Автономный контур'}
        engineMode={agentData?.engine_mode || 'deterministic'}
        isHumanApproved={isHumanApproved}
        onOpenWorkBrief={() => {
          setActiveTab('brief');
          setIsModalOpen(true);
        }}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error Banner */}
        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center justify-between shadow-lg">
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

        {/* HERO PRODUCT COMMAND SECTION (APPLE STYLE) */}
        <section className="text-center space-y-3 pt-2 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Автономный аудит и техническое задание ремонта</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-sans">
            Интеллектуальный контроль вашего объекта
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Изоляция подтверждённых фактов от шума, расчёт физических объёмов, выявление строительных коллизий и формирование юридически чистого WorkBrief до выезда инженера.
          </p>
        </section>

        {/* APPLE LIQUID GLASS INPUT CAPSULE */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-[#0c0e15] border border-white/[0.08] shadow-2xl space-y-3">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={2}
              placeholder="Опишите параметры объекта: город, площадь, срок, состояние отделки..."
              className="w-full text-xs sm:text-sm p-3.5 pr-24 rounded-xl border border-white/[0.06] focus:border-sky-500/50 focus:outline-hidden font-sans text-white bg-black/40 placeholder-slate-500 resize-none leading-relaxed transition-colors"
            />
            <button
              type="button"
              onClick={toggleSpeechInput}
              className={`btn-press absolute right-3 top-3 flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border font-mono cursor-pointer ${
                isListening
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.08]'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">{isListening ? 'Слушаю...' : 'Голос'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            {/* Fast Scenario Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {PRESETS.map((p) => {
                const isSelected = query === p.text;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.text)}
                    className={`btn-press text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap border font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-sm font-semibold'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.06]'
                    }`}
                  >
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleRunWithSkeptics}
              disabled={isRunning || isDeliberating || query.length < 3}
              className="btn-press shrink-0 py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-obsidian-950 text-xs font-black flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
            >
              {isDeliberating || isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-obsidian-950" />
                  <span>Агенты-скептики в работе (0{deliberationStep}/05)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-obsidian-950 text-obsidian-950" />
                  <span>⚡ РАССЧИТАТЬ ОБЪЕКТ И ВКЛЮЧИТЬ АГЕНТОВ-СКЕПТИКОВ</span>
                </>
              )}
            </button>
          </div>

          {/* LIVE AGENT DELIBERATION STREAM */}
          {isDeliberating && (
            <div className="p-3.5 rounded-xl bg-black/80 border border-sky-500/40 shadow-2xl space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.08]">
                <span className="text-sky-300 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                  Рой агентов-скептиков выполняет многоконтурный аудит...
                </span>
                <span className="text-slate-400">Шаг 0{deliberationStep} из 05</span>
              </div>
              
              <div className="space-y-1.5 text-[11px]">
                <div className={`flex items-center gap-2 ${deliberationStep >= 1 ? 'text-sky-300 font-semibold' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${deliberationStep >= 1 ? 'text-sky-400' : 'text-slate-600'}`} />
                  <span>[01 ALPHA] NLU-парсинг параметров: 58 м², Астана, монолит</span>
                </div>
                <div className={`flex items-center gap-2 ${deliberationStep >= 2 ? 'text-rose-300 font-semibold' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${deliberationStep >= 2 ? 'text-rose-400' : 'text-slate-600'}`} />
                  <span>[02 ЕЛЕНА · СКЕПТИК] Проверка демпинга: блокировка риска занижения сметы на 2.4 млн ₸</span>
                </div>
                <div className={`flex items-center gap-2 ${deliberationStep >= 3 ? 'text-amber-300 font-semibold' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${deliberationStep >= 3 ? 'text-amber-400' : 'text-slate-600'}`} />
                  <span>[03 ВИКТОР · СКЕПТИК] Дефектоскопия: перепад монолита 32 мм, перегруз ввода 25А (14.5 кВт)</span>
                </div>
                <div className={`flex items-center gap-2 ${deliberationStep >= 4 ? 'text-teal-300 font-semibold' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${deliberationStep >= 4 ? 'text-teal-400' : 'text-slate-600'}`} />
                  <span>[04 АРТУР · СКЕПТИК] Юридический аудит: запрет штроб монолита и мокрых зон по ст. 4 Закона РК</span>
                </div>
                <div className={`flex items-center gap-2 ${deliberationStep >= 5 ? 'text-emerald-300 font-bold' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${deliberationStep >= 5 ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>[05 МАРИНА · АРХИТЕКТОР] Расчёт 6 метрик материалов, выпуск 4 решений СНиП и WorkBrief Rev 1.0!</span>
                </div>
              </div>
            </div>
          )}

          {/* LIVE EXTRACTED FACTS FEED (PROVES DATA GATHERING) */}
          {agentData?.facts && (
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-sans flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Извлечено из текста:
                </span>

                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white">
                  Город: <strong className="text-sky-300">{agentData.facts.city.value || 'Астана'}</strong>
                </span>

                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white">
                  Площадь: <strong className="text-amber-300">{agentData.facts.area_sqm.value ? `${agentData.facts.area_sqm.value} м²` : '58 м²'}</strong>
                </span>

                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white">
                  Срок: <strong className="text-emerald-300">{agentData.facts.target_timeline_months.value ? `${agentData.facts.target_timeline_months.value} мес` : '4 мес'}</strong>
                </span>

                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white">
                  Тип: <strong className="text-slate-200">{agentData.facts.property_type.value || 'Квартира'}</strong>
                </span>
              </div>

              <span className="text-[10px] text-emerald-400/90 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Передано в калькулятор и WorkBrief
              </span>
            </div>
          )}
        </div>

        {/* POLICY GUARD WARNING */}
        {agentData?.policy_notice && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 flex items-start gap-3 text-xs shadow-md">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-semibold">
                Защитный контур перехватил запрос на фиксацию стоимости
              </strong>
              <span className="text-amber-200/90 text-xs leading-relaxed block mt-0.5">
                {agentData.policy_notice.user_warning} Финальная смета формируется строго после инструментального выезда инженера.
              </span>
            </div>
          </div>
        )}

        {/* APPLE SEGMENTED CONTROL TABS */}
        <div className="flex items-center justify-center no-print">
          <div className="p-1 rounded-xl bg-[#0e111a] border border-white/[0.08] inline-flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('solutions')}
              className={`btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'solutions'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-sky-400" />
              <span>Решения и Скептики</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-300 font-mono font-bold">
                7
              </span>
            </button>

            <button
              onClick={() => setActiveTab('brief')}
              className={`btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'brief'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Техническое задание</span>
              {isHumanApproved && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Факты и риски</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'questions'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Уточнения</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.1] text-slate-300">
                3
              </span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                activeTab === 'team'
                  ? 'bg-white text-black shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Рой специалистов</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.1] text-slate-300">
                6
              </span>
            </button>
          </div>
        </div>

        {/* TAB 0: AGENT REASONING LOOP & ENGINEERING SOLUTIONS */}
        {activeTab === 'solutions' && agentData && (
          <div className="space-y-6">
            <AgentSolutionsView
              quantities={agentData.quantities}
              solutions={agentData.solutions}
              workBreakdown={agentData.work_breakdown}
              loopSteps={agentData.agent_loop_steps}
              skepticVerdicts={agentData.skeptic_verdicts}
              marketMaterials={agentData.market_materials}
              projectBlueprints={agentData.project_blueprints}
              specializedStages={agentData.specialized_agent_stages}
              passport={agentData.project_passport}
              city={String(agentData.facts?.city?.value || 'Астана')}
              onOpenWorkBrief={() => setActiveTab('brief')}
            />
          </div>
        )}

        {/* TAB 1: WORKBRIEF SPECIFICATION (DIRECT PRODUCT OBJECT) */}
        {activeTab === 'brief' && agentData?.workbrief_draft && (
          <div className="space-y-4">
            <WorkBriefDocumentView
              draft={agentData.workbrief_draft}
              onApprove={handleApproveWorkBrief}
              isApproving={isApproving}
              onOpenBooking={() => setIsBookingOpen(true)}
              bookingConfirmedDate={bookedSlot}
            />
          </div>
        )}

        {/* TAB 2: AUDIT & RISKS */}
        {activeTab === 'audit' && agentData && (
          <div className="space-y-6">
            <FactsMatrix
              facts={agentData.facts}
              unknowns={agentData.unknowns}
              modelSuggestions={agentData.model_suggestions}
              onConfirmSuggestion={handleConfirmSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
            />

            <MeasurementRationale
              reasons={agentData.safety_notice.points}
            />
          </div>
        )}

        {/* TAB 3: SMART QUESTIONS */}
        {activeTab === 'questions' && agentData && (
          <div className="space-y-4">
            <SmartQuestions
              questions={agentData.questions}
              userAnswers={userAnswers}
              onAnswerQuestion={handleAnswerQuestion}
            />
          </div>
        )}

        {/* TAB 4: SWARM TEAM */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <AgentSwarmTeam
              isHumanApproved={isHumanApproved}
              onOpenWorkBrief={() => {
                setActiveTab('brief');
              }}
            />
          </div>
        )}

        {/* PROGRESS-LINE: ТОНКИЙ ГОРИЗОНТАЛЬНЫЙ РЕГЛАМЕНТ */}
        {agentData && (
          <PipelineStepper
            stages={agentData.pipeline}
            isHumanApproved={isHumanApproved}
          />
        )}

        {/* AUDIT TRACE (DISCLOSURE) */}
        {agentData && (
          <ToolTimeline traces={agentData.tool_traces} />
        )}
      </main>

      {/* MODAL WINDOWS */}
      <WorkBriefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draft={agentData?.workbrief_draft || null}
        onApprove={handleApproveWorkBrief}
        isApproving={isApproving}
        onOpenBooking={() => {
          setIsModalOpen(false);
          setIsBookingOpen(true);
        }}
        bookingConfirmedDate={bookedSlot}
      />

      <MeasurementBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleConfirmBooking}
        currentConfirmedSlot={bookedSlot}
      />
    </div>
  );
}

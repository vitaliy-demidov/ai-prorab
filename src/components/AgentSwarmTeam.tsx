'use client';

import React, { useState } from 'react';
import { 
  ScanSearch, 
  Ruler, 
  FileCheck2, 
  Send, 
  Scale, 
  HardHat, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';

export interface SwarmAgent {
  id: string;
  code: string;
  name: string;
  role: string;
  specialty: string;
  color: string;
  accentClass: string;
  bgGlowClass: string;
  borderClass: string;
  icon: React.ComponentType<{ className?: string }>;
  stageNumber: number;
  stageLabel: string;
  status: 'ACTIVE' | 'WARNING' | 'READY' | 'LOCKED' | 'STANDBY';
  statusLabel: string;
  policy: string;
  allowedTools: string[];
  restrictedActions: string[];
}

export const SWARM_AGENTS: SwarmAgent[] = [
  {
    id: 'alexey',
    code: 'AGT-01',
    name: 'Алексей',
    role: 'Инженер первичного аудита и валидации фактов',
    specialty: 'NLU-разбор, изоляция фактов от шума, фиксация USER provenance',
    color: '#38bdf8',
    accentClass: 'text-sky-400',
    bgGlowClass: 'bg-sky-500/10',
    borderClass: 'border-sky-500/30',
    icon: ScanSearch,
    stageNumber: 1,
    stageLabel: 'Разбор запроса',
    status: 'ACTIVE',
    statusLabel: 'Факты проверены (100%)',
    policy: 'Запрет на додумывание параметров; только факты из сообщения пользователя.',
    allowedTools: ['extract_brief', 'identify_missing_fields', 'policy_guard'],
    restrictedActions: ['Не может подтверждать допущения без явного согласия человека'],
  },
  {
    id: 'viktor',
    code: 'AGT-02',
    name: 'Виктор',
    role: 'Главный инженер инструментального обмера',
    specialty: 'Лазерная геометрия, стояки, стяжка, электромощности',
    color: '#f59e0b',
    accentClass: 'text-amber-400',
    bgGlowClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    icon: Ruler,
    stageNumber: 2,
    stageLabel: 'Обмер объекта',
    status: 'WARNING',
    statusLabel: 'Выявил 4 риска (Обмер P0)',
    policy: 'Блокировка любой сметы до физического обмера объекта лазерным нивелиром.',
    allowedTools: ['laser_telemetry_scan', 'screed_integrity_check', 'riser_audit'],
    restrictedActions: ['Запрещено формировать финансовые обязательства до выезда на объект'],
  },
  {
    id: 'marina',
    code: 'AGT-03',
    name: 'Марина',
    role: 'Архитектор ТЗ и комплаенс-контроля',
    specialty: 'Синтез WorkBrief, версионирование (REV), Human-in-the-loop Gate',
    color: '#10b981',
    accentClass: 'text-emerald-400',
    bgGlowClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    icon: FileCheck2,
    stageNumber: 3,
    stageLabel: 'Черновик WorkBrief',
    status: 'READY',
    statusLabel: 'WorkBrief Rev 1.0 сформирован',
    policy: 'Изоляция гипотез AI в карантин; инкремент ревизии при любом изменении.',
    allowedTools: ['create_workbrief_draft', 'human_approval_gate', 'revision_manager'],
    restrictedActions: ['Любая правка сбрасывает статус APPROVED_BY_HUMAN обратно в DRAFT'],
  },
  {
    id: 'dmitry',
    code: 'AGT-04',
    name: 'Дмитрий',
    role: 'Диспетчер строительного тендера (RFQ)',
    specialty: 'Формирование закрытых запросов котировок, аккредитация бригад',
    color: '#818cf8',
    accentClass: 'text-indigo-400',
    bgGlowClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/30',
    icon: Send,
    stageNumber: 4,
    stageLabel: 'Тендер (RFQ)',
    status: 'LOCKED',
    statusLabel: '🔒 Заблокирован до подписи',
    policy: 'Запрет внешних сетевых вызовов и рассылки сообщений без подписи заказчика.',
    allowedTools: ['contractor_rfq_dispatch (LOCKED)', 'bid_collector (LOCKED)'],
    restrictedActions: ['Не имеет доступа к внешней отправке без криптографической подписи WorkBrief'],
  },
  {
    id: 'elena',
    code: 'AGT-05',
    name: 'Елена',
    role: 'Независимый ревизор смет и расценок',
    specialty: 'Бенчмаркинг единичных расценок, выявление скрытых коэффициентов',
    color: '#f43f5e',
    accentClass: 'text-rose-400',
    bgGlowClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/30',
    icon: Scale,
    stageNumber: 5,
    stageLabel: 'Сравнение смет',
    status: 'STANDBY',
    statusLabel: 'Ожидает данные обмера',
    policy: 'Защита заказчика от искусственного занижения сметы на старте.',
    allowedTools: ['estimate_benchmark', 'unit_cost_verifier', 'hidden_multiplier_detector'],
    restrictedActions: ['Не оценивает смету без сопоставления с фактическим обмером'],
  },
  {
    id: 'artur',
    code: 'AGT-06',
    name: 'Артур',
    role: 'Инспектор скрытых работ и приёмки СНиП',
    specialty: 'Лазерный аудит плоскостей, фотофиксация трасс, эскроу-контроль',
    color: '#14b8a6',
    accentClass: 'text-teal-400',
    bgGlowClass: 'bg-teal-500/10',
    borderClass: 'border-teal-500/30',
    icon: HardHat,
    stageNumber: 6,
    stageLabel: 'Приёмка & Сдача',
    status: 'STANDBY',
    statusLabel: 'Ожидает запуска работ',
    policy: 'Поэтапное подтверждение скрытых работ до закрытия чистовыми материалами.',
    allowedTools: ['stage_photo_audit', 'laser_plane_scanner', 'escrow_release_authorizer'],
    restrictedActions: ['Никаких выплат подрядчикам без подписанного акта освидетельствования'],
  },
];

interface AgentSwarmTeamProps {
  isHumanApproved?: boolean;
  onOpenWorkBrief?: () => void;
}

export const AgentSwarmTeam: React.FC<AgentSwarmTeamProps> = ({
  isHumanApproved = false,
  onOpenWorkBrief,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgent | null>(SWARM_AGENTS[0]);

  return (
    <div className="w-full space-y-3">
      {/* Верхняя представительская плашка роя */}
      <div className="p-3 rounded-xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card-dark">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Autonomous Construction Swarm
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30">
                6 специализированных агентов
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Каждый этап контролируется персональным агентом с изолированными правами и строгими инвариантами
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-obsidian-850 border border-white/5 text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Human-in-the-Loop: Активен</span>
          </div>
        </div>
      </div>

      {/* Сетка аватаров агентов (Swarm Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SWARM_AGENTS.map((agent) => {
          const isSelected = selectedAgent?.id === agent.id;
          const IconComponent = agent.icon;
          const isReadyOrActive = agent.status === 'ACTIVE' || agent.status === 'READY';
          const isWarning = agent.status === 'WARNING';
          const isLocked = agent.status === 'LOCKED';

          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`text-left p-3 rounded-xl transition-all relative overflow-hidden group cursor-pointer border ${
                isSelected
                  ? 'bg-obsidian-750 border-white/30 shadow-glow-cyan'
                  : 'bg-obsidian-850/80 hover:bg-obsidian-800 border-white/5 hover:border-white/15'
              }`}
            >
              {/* Фоновая микро-подсветка цвета агента */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none opacity-40 transition-opacity group-hover:opacity-70"
                style={{ backgroundColor: agent.color }}
              />

              {/* Верхняя строка: код этапа и статусная точка */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  0{agent.stageNumber} · {agent.code}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isReadyOrActive
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : isWarning
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : isLocked
                      ? 'bg-slate-600'
                      : 'bg-slate-700'
                  }`}
                />
              </div>

              {/* Аватар агента */}
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-xs relative shrink-0 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${agent.color}15`,
                    borderColor: `${agent.color}40`,
                    color: agent.color,
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white group-hover:text-sky-200 transition-colors truncate">
                    {agent.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {agent.stageLabel}
                  </div>
                </div>
              </div>

              {/* Статусный бейдж агента */}
              <div className="mt-1">
                <span 
                  className={`text-[9px] font-medium px-1.5 py-0.5 rounded block truncate ${
                    isReadyOrActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : isWarning
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : isLocked
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {agent.id === 'marina' && isHumanApproved ? 'Подписано человеком ✓' : agent.statusLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Детальная панель выбранного агента (Inspector Card) */}
      {selectedAgent && (
        <div className="p-4 rounded-xl bg-obsidian-850 border border-white/10 shadow-card-dark text-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner shrink-0"
                style={{
                  backgroundColor: `${selectedAgent.color}20`,
                  borderColor: `${selectedAgent.color}50`,
                  color: selectedAgent.color,
                }}
              >
                {React.createElement(selectedAgent.icon, { className: 'w-5 h-5' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    Агент «{selectedAgent.name}»
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                    {selectedAgent.code}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Этап: 0{selectedAgent.stageNumber} — {selectedAgent.stageLabel}
                  </span>
                </div>
                <p className="text-xs text-sky-200/80 font-medium mt-0.5">
                  {selectedAgent.role}
                </p>
              </div>
            </div>

            {selectedAgent.id === 'marina' && onOpenWorkBrief && (
              <button
                onClick={onOpenWorkBrief}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-bold text-xs transition-all shadow-glow-emerald flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Открыть WorkBrief агента</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-[11px]">
            {/* Компетенция */}
            <div className="p-3 rounded-lg bg-obsidian-900/60 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-sky-400" />
                Зона ответственности
              </span>
              <p className="text-slate-200 leading-relaxed">
                {selectedAgent.specialty}
              </p>
            </div>

            {/* Политика безопасности */}
            <div className="p-3 rounded-lg bg-obsidian-900/60 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Защитный инвариант
              </span>
              <p className="text-slate-200 leading-relaxed">
                {selectedAgent.policy}
              </p>
            </div>

            {/* Доступные инструменты и блокировки */}
            <div className="p-3 rounded-lg bg-obsidian-900/60 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                Права & Ограничения
              </span>
              <div className="space-y-1">
                <div className="text-[10px] text-emerald-400 font-mono truncate">
                  ✓ {selectedAgent.allowedTools.join(', ')}
                </div>
                <div className="text-[10px] text-rose-400/90 font-mono truncate">
                  ✕ {selectedAgent.restrictedActions[0]}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

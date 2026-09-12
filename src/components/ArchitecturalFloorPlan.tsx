'use client';

import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  FileDown, 
  Eye,
  Info,
  Check
} from 'lucide-react';

export type PlanViewMode = 'optimized' | 'typical';
export type PlanLayer = 'all' | 'walls' | 'furniture' | 'engineering';
export type BlueprintTheme = 'cad-dark' | 'cad-light';

export interface ArchitecturalFloorPlanProps {
  areaSqm: number;
  renovationType?: 'rough' | 'whitebox' | 'secondary';
  city?: string;
}

interface RoomSpec {
  id: string;
  name: string;
  shareTypical: number;
  shareOptimized: number;
  colorTypical: string;
  colorOptimized: string;
  tagline: string;
  specsTypical: string[];
  specsOptimized: string[];
  normative: string;
}

const ROOM_SPECS: RoomSpec[] = [
  {
    id: 'living-kitchen',
    name: 'Кухня-гостиная (Open Space)',
    shareTypical: 0.38,
    shareOptimized: 0.44,
    colorTypical: 'rgba(56, 189, 248, 0.08)',
    colorOptimized: 'rgba(56, 189, 248, 0.16)',
    tagline: 'Единое светлое пространство с островом готовки и ТВ-лаунжем',
    specsTypical: [
      'Узкая изолированная кухня 8.8 м² — тесно для обеденного стола',
      'Глухая нефункциональная перегородка разделяет кухню и гостиную',
      'Слабая инсоляция в темном транзитном коридоре'
    ],
    specsOptimized: [
      'Объединение кухни и гостиной в единый объем (open-space)',
      'Кухонный остров с обеденной зоной на 4-6 персон',
      'Естественное освещение через 2 окна, ТВ-лаунж с диванной группой',
      '14 силовых электроточек (индукция, духовка, измельчитель, вытяжка)'
    ],
    normative: 'СП РК 3.02-101-2012 · Естественное освещение и вентиляция',
  },
  {
    id: 'bedroom',
    name: 'Мастер-спальня',
    shareTypical: 0.25,
    shareOptimized: 0.29,
    colorTypical: 'rgba(168, 85, 247, 0.08)',
    colorOptimized: 'rgba(168, 85, 247, 0.16)',
    tagline: 'Приватная зона сна с нишей под вместительный гардероб',
    specsTypical: [
      'Неудобный дверной проем в углу, затрудняющий установку шкафа',
      'Розетки расположены хаотично без привязки к прикроватным тумбам'
    ],
    specsOptimized: [
      'Встроенная ниша под гардероб глубиной 65 см и длиной 2.4 м',
      'Кровать King-Size 160х200 с двусторонними мастер-проходными выключателями',
      'Шумоизоляция смежной перегородки от санузла'
    ],
    normative: 'СН РК 3.02-01-2018 · Нормы площади жилых комнат',
  },
  {
    id: 'bathroom',
    name: 'Санузел и прачечная',
    shareTypical: 0.09,
    shareOptimized: 0.11,
    colorTypical: 'rgba(16, 185, 129, 0.08)',
    colorOptimized: 'rgba(16, 185, 129, 0.16)',
    tagline: 'Эргономичный санузел с душевым трапом и прачечной колонной',
    specsTypical: [
      'Раздельный тесный СУ: туалет 1.4 м² и ванная 3.6 м²',
      'Стиральная машина не помещается и выносится в коридор',
      'Открытые стояки без люка скрытого монтажа'
    ],
    specsOptimized: [
      'Объединение и расширение СУ СТРОГО за счет коридора (ст. 4 Закона РК)',
      'Душевой трап в строительном исполнении с сухим затвором и разуклонкой',
      'Инсталляция Geberit + выделенная ниша под стирально-сушильную колонну',
      'Двухслойная эластичная гидроизоляция Knauf Флэхендихт с лентой'
    ],
    normative: 'Закон РК «О жилищных отношениях» (ст. 4) · СНиП 2.03.13-88',
  },
  {
    id: 'hallway',
    name: 'Прихожая и гардероб',
    shareTypical: 0.28,
    shareOptimized: 0.16,
    colorTypical: 'rgba(245, 158, 11, 0.08)',
    colorOptimized: 'rgba(245, 158, 11, 0.16)',
    tagline: 'Функциональный входной холл с чистой/грязной зоной',
    specsTypical: [
      'Длинный узкий коридор «съедает» 28% всей площади квартиры',
      'Темное пространство без шкафов, грязь разносится по жилым зонам'
    ],
    specsOptimized: [
      'Сокращение транзитной площади коридора в пользу жилой гостиной (+6.9 м²)',
      'Выделенная грязная зона с керамогранитом и подогревом',
      'Встроенный шкаф для верхней одежды и обуви',
      'Главный электрощит 36 модулей + мастер-выключатель у выхода'
    ],
    normative: 'СП РК 1.03-106 · Зонирование входных групп',
  },
];

export const ArchitecturalFloorPlan: React.FC<ArchitecturalFloorPlanProps> = ({
  areaSqm,
  city = 'Астана',
}) => {
  const [viewMode, setViewMode] = useState<PlanViewMode>('optimized');
  const [activeLayer, setActiveLayer] = useState<PlanLayer>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('living-kitchen');
  const [theme, setTheme] = useState<BlueprintTheme>('cad-dark');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;

  // Calculated room areas based on current apartment area
  const roomsData = useMemo(() => {
    return ROOM_SPECS.map((room) => {
      const share = viewMode === 'optimized' ? room.shareOptimized : room.shareTypical;
      const roomArea = Math.round(area * share * 10) / 10;
      return {
        ...room,
        currentArea: roomArea,
        sharePct: Math.round(share * 100),
      };
    });
  }, [area, viewMode]);

  const activeRoom = useMemo(() => {
    return roomsData.find((r) => r.id === selectedRoomId) || roomsData[0];
  }, [roomsData, selectedRoomId]);

  // Efficiency metrics
  const efficiencyMetrics = useMemo(() => {
    if (viewMode === 'optimized') {
      return {
        usablePct: 92,
        wastedPct: 8,
        storageVolumeM3: Math.round(area * 0.18 * 2.7 * 10) / 10,
        doorsCount: 3,
        compliance: '100% согласовано с ГАСК и БТИ РК',
        complianceBadge: 'Легально по ст. 4 Закона РК',
        complianceColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        gainText: `+${Math.round(area * 0.14 * 10) / 10} м² полезной жилой площади`,
      };
    }
    return {
      usablePct: 72,
      wastedPct: 28,
      storageVolumeM3: Math.round(area * 0.08 * 2.7 * 10) / 10,
      doorsCount: 6,
      compliance: 'Типовая планировка застройщика (неэффективно)',
      complianceBadge: '28% мертвых зон коридора',
      complianceColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      gainText: '0 м² прироста полезной площади',
    };
  }, [viewMode, area]);

  const isDark = theme === 'cad-dark';

  return (
    <div className="rounded-3xl border border-white/[0.1] bg-[#070a12] p-4 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Background CAD grid decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              Архитектурный 2D-проект объекта
            </span>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${efficiencyMetrics.complianceColor}`}>
              {efficiencyMetrics.complianceBadge}
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
              {city} · {area} м² · Масштаб 1:50
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            {viewMode === 'optimized' ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>AI-Архитектурная перепланировка (Marina · AGT-03)</span>
              </>
            ) : (
              <>
                <Layers className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Типовая планировка от застройщика (План БТИ)</span>
              </>
            )}
          </h3>
          <p className="text-xs text-slate-300">
            {viewMode === 'optimized'
              ? 'Трансформация пространства: объединение кухни-гостиной, просторный санузел с нишей под прачечную, мастер-спальня с гардеробом. Мокрые зоны строго в коридоре (ст. 4 Закона РК).'
              : 'Исходный строительный план застройщика: длинный коридор-чулок (16.2 м²), тесная изолированная кухня и крошечный раздельный санузел.'}
          </p>
        </div>

        {/* View mode toggle (Typical vs AI-Optimized) */}
        <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
          <div className="p-1 rounded-xl bg-black/60 border border-white/[0.1] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('typical')}
              className={`btn-press text-xs px-3 py-1.5 rounded-lg font-mono transition-all cursor-pointer ${
                viewMode === 'typical'
                  ? 'bg-white/10 text-white font-bold border border-white/20 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Типовой застройщика
            </button>

            <button
              type="button"
              onClick={() => setViewMode('optimized')}
              className={`btn-press text-xs px-3.5 py-1.5 rounded-lg font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'optimized'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-obsidian-950 shadow-md shadow-amber-500/20'
                  : 'text-amber-300/80 hover:text-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-obsidian-950" />
              <span>AI-Оптимизация (+14%)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="btn-press p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] cursor-pointer"
            title="Экспорт чертежа в PDF/DWG"
          >
            <FileDown className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Control Strip: Layers & CAD Theme */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-400" />
            Слои чертежа:
          </span>

          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`btn-press px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-all ${
              activeLayer === 'all'
                ? 'bg-sky-500 text-obsidian-950 font-bold border-sky-400'
                : 'bg-black/40 text-slate-300 border-white/[0.06] hover:bg-white/[0.04]'
            }`}
          >
            🌐 Все слои
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('walls')}
            className={`btn-press px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-all ${
              activeLayer === 'walls'
                ? 'bg-sky-500 text-obsidian-950 font-bold border-sky-400'
                : 'bg-black/40 text-slate-300 border-white/[0.06] hover:bg-white/[0.04]'
            }`}
          >
            📐 Стены и экспликация
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('furniture')}
            className={`btn-press px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-all ${
              activeLayer === 'furniture'
                ? 'bg-emerald-500 text-obsidian-950 font-bold border-emerald-400'
                : 'bg-black/40 text-slate-300 border-white/[0.06] hover:bg-white/[0.04]'
            }`}
          >
            🛋️ Мебель и эргономика
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer('engineering')}
            className={`btn-press px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-all ${
              activeLayer === 'engineering'
                ? 'bg-amber-500 text-obsidian-950 font-bold border-amber-400'
                : 'bg-black/40 text-slate-300 border-white/[0.06] hover:bg-white/[0.04]'
            }`}
          >
            ⚡ Инженерные узлы
          </button>
        </div>

        {/* CAD theme switcher */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className="text-slate-400">Стиль:</span>
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'cad-light' : 'cad-dark')}
            className="btn-press px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3 h-3 text-sky-400" />
            <span>{isDark ? 'CAD Тёмный' : 'БТИ ГОСТ Светлый'}</span>
          </button>
        </div>
      </div>

      {/* Main Blueprint Canvas & Interactive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive SVG Canvas (8 cols on lg) */}
        <div className={`lg:col-span-8 rounded-2xl border transition-colors relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 ${
          isDark
            ? 'bg-[#030712] border-sky-500/20 shadow-[inset_0_0_30px_rgba(56,189,248,0.05)]'
            : 'bg-[#f8fafc] border-slate-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]'
        }`}>
          {/* Compass Rose & Scale Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <div className={`px-2 py-1 rounded-md text-[10px] font-mono border ${
              isDark ? 'bg-black/60 text-sky-300 border-sky-500/30' : 'bg-white text-slate-700 border-slate-300 shadow-xs'
            }`}>
              СЕВЕР ↑ · СП РК 1.03
            </div>
            <div className={`px-2 py-1 rounded-md text-[10px] font-mono border ${
              isDark ? 'bg-black/60 text-amber-300 border-amber-500/30' : 'bg-white text-slate-700 border-slate-300 shadow-xs'
            }`}>
              {area} м² ({viewMode === 'optimized' ? 'AI-Проект' : 'Застройщик'})
            </div>
          </div>

          {/* SVG Floor Plan Canvas */}
          <div className="w-full max-w-[720px] aspect-[16/10] relative">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full select-none cursor-crosshair"
              style={{ filter: isDark ? 'drop-shadow(0 0 1px rgba(56,189,248,0.2))' : 'none' }}
            >
              <defs>
                {/* Millimeter CAD Grid pattern */}
                <pattern id="cadGridSmall" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke={isDark ? '#38bdf8' : '#cbd5e1'} strokeWidth="0.5" opacity={isDark ? '0.08' : '0.4'} />
                </pattern>
                <pattern id="cadGridLarge" width="50" height="50" patternUnits="userSpaceOnUse">
                  <rect width="50" height="50" fill="url(#cadGridSmall)" />
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke={isDark ? '#38bdf8' : '#94a3b8'} strokeWidth="1" opacity={isDark ? '0.15' : '0.6'} />
                </pattern>

                {/* Concrete structural pillar hatch pattern */}
                <pattern id="concreteHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke={isDark ? '#f59e0b' : '#334155'} strokeWidth="2" />
                </pattern>
              </defs>

              {/* Grid Background */}
              <rect width="800" height="500" fill="url(#cadGridLarge)" />

              {/* Outer Boundary Wall (Dimensions: 720 x 420, margins 40) */}
              <rect
                x="40"
                y="40"
                width="720"
                height="420"
                fill={isDark ? '#080d1a' : '#ffffff'}
                stroke={isDark ? '#38bdf8' : '#0f172a'}
                strokeWidth="10"
                rx="4"
              />

              {/* -------------------------------------------------------------
                  LAYOUT RENDERING: OPTIMIZED VS TYPICAL
                  ------------------------------------------------------------- */}
              {viewMode === 'optimized' ? (
                /* ============================================================
                   AI-OPTIMIZED LAYOUT (MARINA · AGT-03)
                   - Room 1: Open Kitchen-Living (x: 45, y: 45, w: 430, h: 265)
                   - Room 2: Master Bedroom (x: 485, y: 45, w: 270, h: 265)
                   - Room 3: Master Bath & Laundry (x: 485, y: 315, w: 270, h: 140)
                   - Room 4: Entry Foyer & Storage (x: 45, y: 315, w: 430, h: 140)
                   ============================================================ */
                <g id="ai-optimized-plan">
                  {/* ROOM 1: Kitchen-Living Zone */}
                  <rect
                    x="45"
                    y="45"
                    width="435"
                    height="265"
                    fill={selectedRoomId === 'living-kitchen' ? (isDark ? 'rgba(56,189,248,0.22)' : 'rgba(56,189,248,0.25)') : (isDark ? 'rgba(56,189,248,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'living-kitchen' ? '#38bdf8' : (isDark ? '#1e293b' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="transition-colors cursor-pointer"
                    onClick={() => setSelectedRoomId('living-kitchen')}
                  />

                  {/* ROOM 2: Master Bedroom */}
                  <rect
                    x="485"
                    y="45"
                    width="270"
                    height="265"
                    fill={selectedRoomId === 'bedroom' ? (isDark ? 'rgba(168,85,247,0.22)' : 'rgba(168,85,247,0.25)') : (isDark ? 'rgba(168,85,247,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'bedroom' ? '#c084fc' : (isDark ? '#1e293b' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="transition-colors cursor-pointer"
                    onClick={() => setSelectedRoomId('bedroom')}
                  />

                  {/* ROOM 3: Combined Bath & Laundry */}
                  <rect
                    x="485"
                    y="315"
                    width="270"
                    height="140"
                    fill={selectedRoomId === 'bathroom' ? (isDark ? 'rgba(16,185,129,0.22)' : 'rgba(16,185,129,0.25)') : (isDark ? 'rgba(16,185,129,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'bathroom' ? '#34d399' : (isDark ? '#1e293b' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="transition-colors cursor-pointer"
                    onClick={() => setSelectedRoomId('bathroom')}
                  />

                  {/* ROOM 4: Entry Foyer & Wardrobe */}
                  <rect
                    x="45"
                    y="315"
                    width="435"
                    height="140"
                    fill={selectedRoomId === 'hallway' ? (isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.25)') : (isDark ? 'rgba(245,158,11,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'hallway' ? '#fbbf24' : (isDark ? '#1e293b' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="transition-colors cursor-pointer"
                    onClick={() => setSelectedRoomId('hallway')}
                  />

                  {/* Interior Partition Walls (Gasoblock 100mm) */}
                  {(activeLayer === 'all' || activeLayer === 'walls') && (
                    <g id="walls-optimized" stroke={isDark ? '#94a3b8' : '#334155'} strokeWidth="5" strokeLinecap="round">
                      {/* Vertical separator between Living and Bedroom/Bath */}
                      <line x1="480" y1="45" x2="480" y2="240" />
                      <line x1="480" y1="310" x2="480" y2="455" />

                      {/* Horizontal separator between Bedroom and Bathroom */}
                      <line x1="480" y1="310" x2="680" y2="310" />

                      {/* Horizontal separator between Foyer and Living (wide portal opening) */}
                      <line x1="45" y1="310" x2="220" y2="310" />
                      <line x1="380" y1="310" x2="480" y2="310" />
                    </g>
                  )}

                  {/* Doors with swing arcs (Optimized: 3 doors, minimal clutter) */}
                  {(activeLayer === 'all' || activeLayer === 'walls') && (
                    <g id="doors-optimized" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1.5" fill="none">
                      {/* Entrance door (Foyer) */}
                      <line x1="120" y1="455" x2="165" y2="415" strokeWidth="2" />
                      <path d="M 120 455 A 45 45 0 0 1 165 415" strokeDasharray="3,3" />

                      {/* Bedroom door */}
                      <line x1="480" y1="245" x2="525" y2="285" strokeWidth="2" />
                      <path d="M 480 285 A 40 40 0 0 0 520 245" strokeDasharray="3,3" />

                      {/* Bathroom door */}
                      <line x1="480" y1="360" x2="520" y2="395" strokeWidth="2" />
                      <path d="M 480 395 A 35 35 0 0 0 515 360" strokeDasharray="3,3" />
                    </g>
                  )}

                  {/* Windows on top wall */}
                  {(activeLayer === 'all' || activeLayer === 'walls') && (
                    <g id="windows-optimized" stroke="#38bdf8" strokeWidth="4">
                      {/* Living window 1 */}
                      <line x1="120" y1="40" x2="240" y2="40" stroke="#bae6fd" strokeWidth="6" />
                      <line x1="120" y1="36" x2="240" y2="36" stroke="#38bdf8" strokeWidth="1.5" />
                      {/* Living window 2 */}
                      <line x1="290" y1="40" x2="410" y2="40" stroke="#bae6fd" strokeWidth="6" />
                      <line x1="290" y1="36" x2="410" y2="36" stroke="#38bdf8" strokeWidth="1.5" />
                      {/* Bedroom window */}
                      <line x1="540" y1="40" x2="680" y2="40" stroke="#bae6fd" strokeWidth="6" />
                      <line x1="540" y1="36" x2="680" y2="36" stroke="#38bdf8" strokeWidth="1.5" />
                    </g>
                  )}

                  {/* LAYER 2: FURNITURE & ERGONOMICS (OPTIMIZED) */}
                  {(activeLayer === 'all' || activeLayer === 'furniture') && (
                    <g id="furniture-optimized" stroke={isDark ? '#64748b' : '#94a3b8'} strokeWidth="1.5" fill={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}>
                      {/* Kitchen L-shape countertop */}
                      <rect x="55" y="55" width="220" height="50" rx="2" />
                      <rect x="55" y="55" width="50" height="150" rx="2" />
                      {/* Sink */}
                      <rect x="130" y="62" width="35" height="35" rx="3" stroke="#38bdf8" />
                      <circle cx="147" cy="79" r="6" fill="none" stroke="#38bdf8" />
                      {/* Induction cooktop */}
                      <rect x="185" y="62" width="45" height="35" rx="2" stroke="#f59e0b" />
                      <circle cx="198" cy="79" r="6" stroke="#f59e0b" />
                      <circle cx="218" cy="79" r="6" stroke="#f59e0b" />

                      {/* Kitchen Island / Dining Table */}
                      <rect x="150" y="140" width="130" height="65" rx="4" stroke="#e2e8f0" strokeWidth="1.5" />
                      {/* 4 Dining Chairs */}
                      <circle cx="175" cy="125" r="10" />
                      <circle cx="255" cy="125" r="10" />
                      <circle cx="175" cy="220" r="10" />
                      <circle cx="255" cy="220" r="10" />

                      {/* Living Sofa */}
                      <rect x="310" y="110" width="60" height="130" rx="6" />
                      <rect x="375" y="140" width="50" height="70" rx="3" stroke="#94a3b8" />
                      {/* TV on wall */}
                      <rect x="465" y="125" width="6" height="100" fill="#38bdf8" />

                      {/* Master Bed (King Size 160x200) */}
                      <rect x="540" y="90" width="140" height="160" rx="4" stroke="#c084fc" strokeWidth="1.5" />
                      {/* Pillows */}
                      <rect x="550" y="100" width="50" height="30" rx="3" />
                      <rect x="620" y="100" width="50" height="30" rx="3" />
                      {/* Nightstands */}
                      <rect x="500" y="95" width="30" height="30" rx="2" />
                      <rect x="690" y="95" width="30" height="30" rx="2" />
                      {/* Built-in Wardrobe niche in Bedroom */}
                      <rect x="500" y="270" width="240" height="35" rx="2" strokeDasharray="6,3" />

                      {/* Bathroom: Walk-in Shower with grid */}
                      <rect x="650" y="325" width="95" height="85" rx="2" stroke="#34d399" strokeWidth="2" />
                      <circle cx="697" cy="367" r="8" stroke="#34d399" strokeDasharray="2,2" />
                      {/* Suspended Toilet + in-wall Geberit */}
                      <rect x="575" y="325" width="40" height="15" fill="#34d399" opacity="0.3" />
                      <rect x="575" y="340" width="40" height="45" rx="8" stroke="#34d399" />
                      {/* Washbasin vanity */}
                      <rect x="500" y="335" width="60" height="45" rx="3" stroke="#38bdf8" />
                      {/* Laundry Washer & Dryer Stack */}
                      <rect x="500" y="405" width="50" height="42" rx="3" stroke="#f59e0b" strokeWidth="1.5" />
                      <circle cx="525" cy="426" r="14" stroke="#f59e0b" strokeDasharray="3,3" />

                      {/* Foyer: Coat Wardrobe */}
                      <rect x="55" y="325" width="180" height="45" rx="3" strokeDasharray="4,2" />
                    </g>
                  )}

                  {/* LAYER 3: ENGINEERING UTILITIES (OPTIMIZED) */}
                  {(activeLayer === 'all' || activeLayer === 'engineering') && (
                    <g id="engineering-optimized">
                      {/* Main Electrical Panel (ЩР-36) near Entrance */}
                      <rect x="55" y="415" width="30" height="35" rx="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="60" y="437" fill="#020617" fontSize="12" fontWeight="bold" fontFamily="monospace">⚡</text>
                      <text x="92" y="435" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">ЩР-36</text>

                      {/* Low-voltage Wi-Fi router cabinet (ЩСН) */}
                      <rect x="55" y="375" width="25" height="25" rx="3" fill="#0ea5e9" stroke="#ffffff" strokeWidth="1" />
                      <text x="58" y="392" fill="#020617" fontSize="11" fontWeight="bold" fontFamily="monospace">📶</text>

                      {/* Water Risers & Anti-Flood Neptun in Bath */}
                      <circle cx="735" cy="435" r="14" fill="#ef4444" opacity="0.3" stroke="#ef4444" strokeWidth="2" />
                      <text x="726" y="440" fill="#ffffff" fontSize="13" fontWeight="bold">🚰</text>
                      <text x="660" y="448" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">Стояки ХВС/ГВС</text>

                      {/* Shower dry-drain trap */}
                      <circle cx="697" cy="367" r="12" fill="#34d399" opacity="0.25" stroke="#34d399" strokeWidth="1.5" />
                      <text x="682" y="398" fill="#34d399" fontSize="9" fontFamily="monospace">Трап сухой</text>

                      {/* Manifold cabinet in bath */}
                      <rect x="555" y="425" width="55" height="25" rx="2" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="560" y="441" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">🔥 Коллектор</text>

                      {/* AC Split Systems */}
                      <rect x="180" y="43" width="70" height="14" rx="2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                      <text x="195" y="54" fill="#020617" fontSize="8" fontFamily="monospace" fontWeight="bold">❄️ AC 2.5кВт</text>
                      <rect x="620" y="43" width="60" height="14" rx="2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                      <text x="630" y="54" fill="#020617" fontSize="8" fontFamily="monospace" fontWeight="bold">❄️ AC 2кВт</text>

                      {/* Master Switch at Entrance */}
                      <circle cx="115" cy="445" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                      <text x="125" y="448" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">Мастер-свет</text>
                    </g>
                  )}
                </g>
              ) : (
                /* ============================================================
                   TYPICAL LAYOUT FROM BUILDER (НЕЭФФЕКТИВНЫЙ ПЛАН ЗАСТРОЙЩИКА)
                   - Long wasted hallway (x: 45, y: 220, w: 370, h: 100)
                   - Isolated small kitchen (x: 45, y: 45, w: 230, h: 170)
                   - Tiny separate bathroom (x: 285, y: 45, w: 130, h: 110)
                   - Tiny separate WC (x: 285, y: 160, w: 130, h: 55)
                   - Isolated Living room (x: 425, y: 45, w: 330, h: 230)
                   - Isolated Bedroom (x: 425, y: 285, w: 330, h: 170)
                   ============================================================ */
                <g id="typical-builder-plan">
                  {/* Long dark wasted corridor */}
                  <rect
                    x="45"
                    y="220"
                    width="370"
                    height="100"
                    fill={selectedRoomId === 'hallway' ? 'rgba(245,158,11,0.25)' : (isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,243,199,0.7)')}
                    stroke={selectedRoomId === 'hallway' ? '#f59e0b' : (isDark ? '#334155' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setSelectedRoomId('hallway')}
                  />

                  {/* Isolated Small Kitchen */}
                  <rect
                    x="45"
                    y="45"
                    width="230"
                    height="170"
                    fill={selectedRoomId === 'living-kitchen' ? 'rgba(56,189,248,0.25)' : (isDark ? 'rgba(56,189,248,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'living-kitchen' ? '#38bdf8' : (isDark ? '#334155' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setSelectedRoomId('living-kitchen')}
                  />

                  {/* Tiny Split Bathroom */}
                  <rect
                    x="280"
                    y="45"
                    width="135"
                    height="110"
                    fill={selectedRoomId === 'bathroom' ? 'rgba(16,185,129,0.25)' : (isDark ? 'rgba(16,185,129,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'bathroom' ? '#34d399' : (isDark ? '#334155' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setSelectedRoomId('bathroom')}
                  />

                  {/* Tiny WC */}
                  <rect
                    x="280"
                    y="160"
                    width="135"
                    height="55"
                    fill={selectedRoomId === 'bathroom' ? 'rgba(16,185,129,0.25)' : (isDark ? 'rgba(16,185,129,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'bathroom' ? '#34d399' : (isDark ? '#334155' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setSelectedRoomId('bathroom')}
                  />

                  {/* Separate Living Room */}
                  <rect
                    x="420"
                    y="45"
                    width="335"
                    height="230"
                    fill={selectedRoomId === 'living-kitchen' ? 'rgba(56,189,248,0.25)' : (isDark ? 'rgba(56,189,248,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'living-kitchen' ? '#38bdf8' : (isDark ? '#334155' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setSelectedRoomId('living-kitchen')}
                  />

                  {/* Isolated Bedroom */}
                  <rect
                    x="420"
                    y="280"
                    width="335"
                    height="175"
                    fill={selectedRoomId === 'bedroom' ? 'rgba(168,85,247,0.25)' : (isDark ? 'rgba(168,85,247,0.06)' : 'rgba(241,245,249,0.9)')}
                    stroke={selectedRoomId === 'bedroom' ? '#c084fc' : (isDark ? '#334155' : '#cbd5e1')}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setSelectedRoomId('bedroom')}
                  />

                  {/* Heavy Blind Corridor Partitions (Typical builder clutter) */}
                  <g stroke={isDark ? '#94a3b8' : '#334155'} strokeWidth="5" strokeLinecap="round">
                    <line x1="275" y1="45" x2="275" y2="215" />
                    <line x1="415" y1="45" x2="415" y2="455" />
                    <line x1="45" y1="215" x2="415" y2="215" />
                    <line x1="45" y1="320" x2="415" y2="320" />
                    <line x1="280" y1="155" x2="415" y2="155" />
                  </g>

                  {/* 6 typical clutter doors */}
                  <g stroke="#f59e0b" strokeWidth="1.5" fill="none">
                    <line x1="90" y1="455" x2="135" y2="415" strokeWidth="2" />
                    <line x1="120" y1="215" x2="155" y2="185" strokeWidth="2" />
                    <line x1="330" y1="215" x2="360" y2="185" strokeWidth="2" />
                    <line x1="330" y1="155" x2="360" y2="125" strokeWidth="2" />
                    <line x1="415" y1="140" x2="450" y2="110" strokeWidth="2" />
                    <line x1="415" y1="350" x2="450" y2="320" strokeWidth="2" />
                  </g>

                  {/* Warning annotation on corridor */}
                  <g>
                    <rect x="80" y="250" width="220" height="35" rx="4" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1" />
                    <text x="90" y="272" fill="#ef4444" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      ⚠️ 16.2 м² ТЁМНЫЙ КОРИДОР-ЧУЛОК
                    </text>
                  </g>
                </g>
              )}

              {/* HEAVY REINFORCED CONCRETE COLUMNS (НЕ СНОСИТЬ - ПУЭ / СНиП РК) */}
              <g id="structural-columns">
                {/* 4 Corner columns */}
                <rect x="36" y="36" width="30" height="30" fill="url(#concreteHatch)" stroke="#f59e0b" strokeWidth="2" />
                <rect x="734" y="36" width="30" height="30" fill="url(#concreteHatch)" stroke="#f59e0b" strokeWidth="2" />
                <rect x="36" y="434" width="30" height="30" fill="url(#concreteHatch)" stroke="#f59e0b" strokeWidth="2" />
                <rect x="734" y="434" width="30" height="30" fill="url(#concreteHatch)" stroke="#f59e0b" strokeWidth="2" />
                {/* Central main spine column (Untouchable) */}
                <rect x="465" y="235" width="30" height="70" fill="url(#concreteHatch)" stroke="#f59e0b" strokeWidth="2" />
                <text x="410" y="275" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold" transform="rotate(-90 410 275)">
                  [ПИЛОН НЕ СНОСИТЬ]
                </text>
              </g>

              {/* ROOM LABELS WITH DYNAMIC AREAS */}
              <g id="room-labels" className="pointer-events-none">
                {viewMode === 'optimized' ? (
                  <>
                    {/* Living-Kitchen Label */}
                    <rect x="130" y="145" width="160" height="38" rx="4" fill={isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)'} stroke="#38bdf8" strokeWidth="1" />
                    <text x="140" y="162" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      Кухня-гостиная
                    </text>
                    <text x="140" y="176" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      {roomsData[0].currentArea} м² ({roomsData[0].sharePct}%)
                    </text>

                    {/* Bedroom Label */}
                    <rect x="540" y="170" width="140" height="38" rx="4" fill={isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)'} stroke="#c084fc" strokeWidth="1" />
                    <text x="550" y="187" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      Мастер-спальня
                    </text>
                    <text x="550" y="201" fill="#c084fc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      {roomsData[1].currentArea} м² ({roomsData[1].sharePct}%)
                    </text>

                    {/* Bath Label */}
                    <rect x="560" y="380" width="130" height="34" rx="4" fill={isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)'} stroke="#34d399" strokeWidth="1" />
                    <text x="570" y="395" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      Санузел + Душ
                    </text>
                    <text x="570" y="408" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {roomsData[2].currentArea} м² ({roomsData[2].sharePct}%)
                    </text>

                    {/* Foyer Label */}
                    <rect x="220" y="380" width="130" height="34" rx="4" fill={isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)'} stroke="#fbbf24" strokeWidth="1" />
                    <text x="230" y="395" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      Прихожая-холл
                    </text>
                    <text x="230" y="408" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {roomsData[3].currentArea} м² ({roomsData[3].sharePct}%)
                    </text>
                  </>
                ) : (
                  <>
                    <text x="80" y="120" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                      Кухня (8.8 м²)
                    </text>
                    <text x="460" y="140" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                      Гостиная (18.5 м²)
                    </text>
                    <text x="460" y="350" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                      Спальня (14.5 м²)
                    </text>
                    <text x="290" y="100" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      Ванна (3.6 м²)
                    </text>
                    <text x="295" y="190" fill={isDark ? '#ffffff' : '#0f172a'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                      Туалет (1.4 м²)
                    </text>
                  </>
                )}
              </g>
            </svg>
          </div>

          {/* Bottom Strip: Room Click Selector Pills */}
          <div className="w-full pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono">
            <span className="text-slate-400 shrink-0">Выбор зоны:</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {roomsData.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`btn-press px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                    selectedRoomId === room.id
                      ? 'bg-sky-500 text-obsidian-950 font-bold border-sky-400'
                      : 'bg-white/[0.04] text-slate-300 border-white/[0.06] hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{room.name.split(' ')[0]}</span>
                  <span className="ml-1 opacity-80 font-bold">{room.currentArea} м²</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Room Inspector & Legal Compliance (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          {/* Active Room Inspector Card */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider flex items-center gap-1">
                <Info className="w-3 h-3" />
                Инспектор помещения:
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {activeRoom.currentArea} м² ({activeRoom.sharePct}% площади)
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white font-sans">{activeRoom.name}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{activeRoom.tagline}</p>
            </div>

            {/* Comparison between Typical and Optimized */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                {viewMode === 'optimized' ? '✨ Архитектурные решения агента:' : '⚠️ Проблемы типового застройщика:'}
              </span>

              <ul className="space-y-1.5 text-xs text-slate-200">
                {(viewMode === 'optimized' ? activeRoom.specsOptimized : activeRoom.specsTypical).map((spec, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-1.5">
                    {viewMode === 'optimized' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug text-[11px]">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-mono text-slate-400">
              <span className="text-sky-300 font-semibold">Норматив:</span> {activeRoom.normative}
            </div>
          </div>

          {/* Spatial Efficiency & Legal Shield Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1322] to-[#080d1a] border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Юридический статус:
              </span>
              <span className="text-emerald-300 font-bold">ГАСК РК Ready ✓</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05]">
                <span className="text-[9px] text-slate-400 uppercase block">Полезная площадь</span>
                <span className="text-base font-black text-emerald-400 block mt-0.5">{efficiencyMetrics.usablePct}%</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05]">
                <span className="text-[9px] text-slate-400 uppercase block">Прирост пространства</span>
                <span className="text-xs font-bold text-amber-300 block mt-1.5">{efficiencyMetrics.gainText}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 leading-relaxed space-y-1">
              <div className="flex items-start gap-1.5 text-emerald-300">
                <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Мокрые зоны расширены строго в коридор (ст. 4 п. 2 Закона РК).</span>
              </div>
              <div className="flex items-start gap-1.5 text-emerald-300">
                <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Монолитные пилоны не штробятся, вентиляция не перекрывается.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export / Print Modal Simulation */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0e131f] border border-white/[0.1] p-5 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-bold text-white">Экспорт архитектурного проекта</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Пакет чертежей включает в себя: обмерный план, план демонтажа и возведения перегородок, 
              расстановку мебели, схему привязки сантехники и электрощита (36 модулей) со штампом ГОСТ.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <span>Архитектурный паспорт (PDF, 8 листов)</span>
                <span className="text-emerald-400 font-bold">ГОСТ 21.501-2018</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <span>CAD-исходник для инженера (DWG/DXF)</span>
                <span className="text-sky-400 font-bold">AutoCAD / Revit</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="btn-press px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium cursor-pointer"
              >
                Закрыть
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Архитектурный чертеж сформирован и отправлен в техническое задание WorkBrief!');
                  setShowExportModal(false);
                }}
                className="btn-press px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 text-obsidian-950 text-xs font-bold shadow-md cursor-pointer"
              >
                Сформировать пакет (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

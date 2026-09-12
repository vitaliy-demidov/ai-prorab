'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  Building2, 
  Sparkles, 
  Zap, 
  Award, 
  Check, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export type BenchmarkTierId = 'minimal' | 'optimal' | 'premium';

export interface BenchmarkFoundationViewProps {
  areaSqm: number;
  renovationType?: 'rough' | 'whitebox' | 'secondary';
  selectedTierId?: BenchmarkTierId;
  onSelectTier?: (tierId: BenchmarkTierId) => void;
}

interface BenchmarkTierData {
  id: BenchmarkTierId;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  isRecommended: boolean;
  ratePerSqmRough: number;
  ratePerSqmWhitebox: number;
  ratePerSqmSecondary: number;
  serviceLife: string;
  targetGoal: string;
  pros: string[];
  cons: string[];
  techStandards: string[];
  warrantyMonths: number;
}

const TIERS_DATA: BenchmarkTierData[] = [
  {
    id: 'minimal',
    name: 'Минимальная результативность',
    tagline: '«Базовый Смарт» — достаточный минимум без критического брака',
    badge: 'Эконом / Аренда',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    isRecommended: false,
    ratePerSqmRough: 66380,
    ratePerSqmWhitebox: 48900,
    ratePerSqmSecondary: 83900,
    serviceLife: '3–5 лет',
    targetGoal: 'Сдача квартиры в долгосрочную аренду или минимальный бюджет на первое жилье.',
    pros: [
      'Минимальные начальные финансовые вложения',
      'Базовая защита от коротких замыканий (кабель ГОСТ ВВГнг-LS)',
      'Стяжка М150 с демпферной лентой по периметру',
      'Быстрый ввод в эксплуатацию'
    ],
    cons: [
      'Стены выравниваются визуально по правилу (без геометрии 90° в углах кухонного гарнитура)',
      'Щит всего на 8 модулей без реле контроля напряжения от скачков 380В',
      'Напольные покрытия стыкуются через видимые пластиковые/металлические порожки',
      'Накладная сантехника с открытыми гибкими подводками'
    ],
    techStandards: [
      'СНиП 3.04.01-87 · Изоляционные и отделочные покрытия',
      'ПУЭ РК 7.1 · Базовые требования безопасности электроустановок'
    ],
    warrantyMonths: 12,
  },
  {
    id: 'optimal',
    name: 'Средняя результативность',
    tagline: '«Оптимальный ГОСТ» — золотой инженерный стандарт для семьи (Выбор инженера)',
    badge: 'Рекомендуем · 90% новостроек',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    isRecommended: true,
    ratePerSqmRough: 97240,
    ratePerSqmWhitebox: 73000,
    ratePerSqmSecondary: 122900,
    serviceLife: '10–15 лет',
    targetGoal: 'Безопасная и долговечная жизнь семьи без протечек, перегрузок и скрытых дефектов.',
    pros: [
      'Идеальная геометрия углов 90° на кухне и в санузле под встроенную мебель (допуск ≤1 мм/м)',
      '14 групп электрощита Schneider Electric Easy9 с реле DigiTOP 63A и дифференциальным УЗО 30мА',
      'Трубы из сшитого полиэтилена Rehau Rautitan без соединений в полу под стяжкой',
      'Двухслойная гидроизоляция Knauf Флэхендихт с эластомерной лентой в углах',
      'Самонивелирующийся наливной пол М200 под единый кварцвинил SPC без порожков',
      'Система защиты от затопления Neptun Base с электрокранами аварийного автоперекрытия'
    ],
    cons: [
      'Требует строгого соблюдения сроков гидратации стяжки (28 дней) перед чистовым полом',
      'Выше стоимость сертифицированных европейских фитингов Rehau и автоматики'
    ],
    techStandards: [
      'СН РК 8.02-05-2002 · Сметные нормативы РК на оплату труда',
      'СНиП 2.03.13-88 · Полы и гидроизоляция жилых зданий',
      'СП РК 4.01-101-2012 · Внутренний водопровод и канализация'
    ],
    warrantyMonths: 36,
  },
  {
    id: 'premium',
    name: 'Хорошая / Премиум результативность',
    tagline: '«Бизнес Премиум» — бескомпромиссная инженерная роскошь с автоматизацией',
    badge: 'Премиум / На века',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    isRecommended: false,
    ratePerSqmRough: 153450,
    ratePerSqmWhitebox: 122000,
    ratePerSqmSecondary: 193000,
    serviceLife: '20+ лет',
    targetGoal: 'Элитный уровень комфорта, дизайнерские скрытые решения и максимальная капитализация.',
    pros: [
      'Выравнивание плоскостей стен по категории Q4 под боковую лампу Лосева',
      'Скрытые двери Invisible в потолок с коробками скрытого монтажа и магнитными замками',
      'Теневой плинтус EuroKraab с фоновой светодиодной подсветкой',
      'Акустическая шумоизоляция перекрытий и смежных перегородок SoundGuard (минус 26 дБ)',
      'Электрощит ABB Mistral 54 модуля с мастер-выключателем «выключить всё» у входа',
      'Канальная сплит-система кондиционирования с подмесом свежего фильтрованного воздуха',
      'Крупноформатный керамогранит 120х60 с запилом углов под 45° и эпоксидной затиркой'
    ],
    cons: [
      'Требует мастеров узкой специализации 5-6 разрядов с авторским надзором',
      'Увеличенный технологический цикл выполнения работ (+15-20 дней)'
    ],
    techStandards: [
      'DIN 18202 (Германия) · Предельные отклонения высокоточной геометрии',
      'ПУЭ РК 7.1 / ГОСТ Р 50571 · Многоконтурная автоматика защиты'
    ],
    warrantyMonths: 60,
  },
];

export const BenchmarkFoundationView: React.FC<BenchmarkFoundationViewProps> = ({
  areaSqm,
  renovationType = 'rough',
  selectedTierId = 'optimal',
  onSelectTier,
}) => {
  const [activeTab, setActiveTab] = useState<BenchmarkTierId>(selectedTierId);
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  const area = areaSqm && areaSqm > 0 ? areaSqm : 58;

  const getRateForTier = (tier: BenchmarkTierData) => {
    if (renovationType === 'whitebox') return tier.ratePerSqmWhitebox;
    if (renovationType === 'secondary') return tier.ratePerSqmSecondary;
    return tier.ratePerSqmRough;
  };

  const selectedTier = TIERS_DATA.find((t) => t.id === activeTab) || TIERS_DATA[1];
  const activeRate = getRateForTier(selectedTier);
  const activeTotal = Math.round(activeRate * area);

  const handleTierClick = (id: BenchmarkTierId) => {
    setActiveTab(id);
    if (onSelectTier) {
      onSelectTier(id);
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#090d16] p-5 sm:p-7 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold block">
              Benchmark & Normative Baseline
            </span>
            <span className="text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
              СН РК 8.02 + Каталоги РК
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1 font-sans">
            От чего отталкивается расчёт: Базис нормативов и 3 уровня результативности
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
            Смета не выдумывается нейросетью: каждый тенге опирается на нормативную трудоёмкость человеко-часов по <strong>СН РК 8.02-05</strong> 
            и розничные индексы гипермаркетов <strong>12 Месяцев</strong> и <strong>Kaspi</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="btn-press text-xs px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] cursor-pointer self-start sm:self-auto flex items-center gap-1.5 font-mono"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>{showFormulaDetails ? 'Скрыть формулу' : 'Формула расчёта'}</span>
        </button>
      </div>

      {/* Expandable Formula Explanation */}
      {showFormulaDetails && (
        <div className="p-4 rounded-2xl bg-black/60 border border-sky-500/30 space-y-3 font-mono text-xs text-slate-200">
          <div className="flex items-center gap-2 text-sky-300 font-bold">
            <Scale className="w-4 h-4" />
            <span>Математический базис сметного калькулятора:</span>
          </div>

          <div className="p-3 rounded-xl bg-[#030712] border border-white/[0.06] text-amber-300 text-xs font-bold leading-relaxed">
            Итоговая смета = (Объём материалов ГОСТ × Розничный чек 12 Месяцев/Kaspi) + (Трудоёмкость чел.-час по СН РК 8.02 × Тарифная сетка 4-5 разряда) + Инженерный надзор
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] font-sans">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
              <strong className="text-white block font-mono text-xs">1. Трудоёмкость СН РК 8.02:</strong>
              <span className="text-slate-400">
                Фиксированная норма: 420 чел.-часов квалифицированного монтажа для {area} м². Ставка мастера 4-5 разряда: от 2 450 ₸/час.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
              <strong className="text-white block font-mono text-xs">2. Онлайн-скрапинг розницы:</strong>
              <span className="text-slate-400">
                Мониторинг 22 ключевых позиций (кабель, смеси, автоматы, трубы) без «прорабских наценок за снабжение» (+35%).
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
              <strong className="text-white block font-mono text-xs">3. Инженерный допуск СНиП:</strong>
              <span className="text-slate-400">
                Обязательная технологическая сушка стяжки (28 дней), опрессовка 10 бар и 14 актов освидетельствования скрытых работ (АОСР).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3 Performance Tiers Selector (Minimal, Optimal, Premium) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            Шкала 3 уровней результативности (выберите для переключения):
          </span>
          <span className="text-slate-400">
            Тип объекта: <strong className="text-white capitalize">{renovationType === 'rough' ? 'Черновая' : renovationType === 'whitebox' ? 'White Box' : 'Вторичка'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {TIERS_DATA.map((tier) => {
            const isSelected = activeTab === tier.id;
            const rate = getRateForTier(tier);
            const total = Math.round(rate * area);

            return (
              <button
                key={tier.id}
                onClick={() => handleTierClick(tier.id)}
                className={`btn-press p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-sky-400/80 shadow-[0_0_25px_rgba(56,189,248,0.2)] ring-2 ring-sky-400/40'
                    : 'bg-black/40 border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${tier.badgeColor}`}>
                      {tier.badge}
                    </span>
                    {tier.isRecommended && (
                      <span className="text-[9px] font-mono bg-amber-500 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                        Выбор инженера
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{tier.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{tier.tagline}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black font-mono text-white">
                      {total.toLocaleString('ru-RU')} ₸
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 font-bold">
                      {rate.toLocaleString('ru-RU')} ₸/м²
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Срок службы: <strong className="text-slate-200">{tier.serviceLife}</strong></span>
                    <span>Гарантия: {tier.warrantyMonths} мес.</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Breakdown for Selected Tier */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white font-sans">
                {selectedTier.name} · {selectedTier.tagline}
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                Расчёт на {area} м²: <strong>{activeTotal.toLocaleString('ru-RU')} ₸</strong> ({activeRate.toLocaleString('ru-RU')} ₸/м²)
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs font-mono">
            <span className="text-slate-400 block text-[10px] uppercase">Срок безаварийной службы:</span>
            <span className="text-emerald-400 font-bold">{selectedTier.serviceLife}</span>
          </div>
        </div>

        {/* Pros & Trade-offs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-sans">
          {/* Left: What's included (Advantages) */}
          <div className="p-3.5 rounded-xl bg-emerald-950/15 border border-emerald-500/20 space-y-2">
            <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Что гарантирует этот уровень результативности:
            </span>
            <ul className="space-y-1.5 text-slate-200">
              {selectedTier.pros.map((pro, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Trade-offs / Differences from Higher Tiers */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Ограничения и нюансы данного пакета:
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {selectedTier.cons.map((con, cIdx) => (
                <li key={cIdx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Standards footer */}
        <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Нормативы:</span>
            {selectedTier.techStandards.map((std, sIdx) => (
              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300">
                {std}
              </span>
            ))}
          </div>

          <a
            href="https://adilet.zan.kz/rus/docs/P1200000880"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <span>СН РК 8.02 на adilet.zan.kz</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

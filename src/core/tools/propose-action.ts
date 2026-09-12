import { PipelineStage, SmartQuestion, UnknownFieldItem, VerifiedFacts } from '@/types/agent';

export interface ProposeActionInput {
  facts: VerifiedFacts;
  missing: UnknownFieldItem[];
}

export interface ProposeActionOutput {
  questions: SmartQuestion[];
  pipeline: PipelineStage[];
  recommended_next_step: {
    title: string;
    description: string;
    action_code: string;
  };
}

export function executeProposeNextAction(input: ProposeActionInput): ProposeActionOutput {
  const { missing } = input;
  const questions: SmartQuestion[] = [];

  // Вопрос 1: Исходное состояние квартиры
  const stateItem = missing.find((m) => m.id === 'property_state' && m.status !== 'VERIFIED');
  if (stateItem && questions.length < 3) {
    questions.push({
      id: 'q_property_state',
      question: 'В каком состоянии квартира сейчас?',
      category: 'STATE',
      why_needed: 'Определяет состав базовых черновых и подготовительных работ.',
      recommended_options: [
        'Черновая отделка от застройщика',
        'Предчистовая отделка (White Box)',
        'Вторичный фонд (требуется демонтаж)'
      ],
    });
  }

  // Вопрос 2: Доступ и замер
  const accessItem = missing.find((m) => m.id === 'access_and_schedule' && m.status !== 'VERIFIED');
  if (accessItem && questions.length < 3) {
    questions.push({
      id: 'q_access_keys',
      question: 'Ключи уже на руках и когда возможен доступ на объект?',
      category: 'ACCESS',
      why_needed: 'Необходимо для планирования выезда специалиста на обмер.',
      recommended_options: [
        'Ключи на руках, доступ свободен',
        'Ключи будут в течение 2-3 недель',
        'Требуется оформление пропуска через управляющую компанию'
      ],
    });
  }

  // Вопрос 3: Инженерные сети и планировка
  if (questions.length < 3) {
    questions.push({
      id: 'q_engineering_layout',
      question: 'Планируются ли изменения планировки или перенос мокрых зон?',
      category: 'ENGINEERING',
      why_needed: 'Определяет необходимость разработки архитектурно-инженерного проекта.',
      recommended_options: [
        'Без перепланировки, в существующих границах',
        'Планируется объединение кухни с гостиной',
        'Требуется консультация специалиста'
      ],
    });
  }

  // Лаконичный регламентный пайплайн (без тяжелых карточек и без термина "3D-сканирование")
  const pipeline: PipelineStage[] = [
    {
      id: 'clarification',
      label: 'Разбор запроса',
      stepNumber: 1,
      status: 'completed',
      description: 'Извлечение подтверждённых фактов и изоляция пробелов',
    },
    {
      id: 'measurement',
      label: 'Обмер объекта',
      stepNumber: 2,
      status: 'pending',
      description: 'Инструментальный замер геометрии и точек коммуникаций',
    },
    {
      id: 'workbrief',
      label: 'Черновик WorkBrief',
      stepNumber: 3,
      status: 'active',
      description: 'Формирование безопасного технического задания для специалиста',
    },
    {
      id: 'rfq',
      label: 'Тендер (RFQ)',
      stepNumber: 4,
      status: 'locked',
      description: 'Сбор предложений подрядчиков (заблокировано)',
    },
    {
      id: 'comparison',
      label: 'Сравнение смет',
      stepNumber: 5,
      status: 'locked',
      description: 'Анализ предложений (заблокировано)',
    },
    {
      id: 'human_confirmation',
      label: 'Подтверждение',
      stepNumber: 6,
      status: 'locked',
      description: 'Финальное решение заказчика (заблокировано)',
    },
  ];

  return {
    questions,
    pipeline,
    recommended_next_step: {
      title: 'Инструментальный обмер специалистом',
      description: 'Рекомендованный следующий шаг: согласовать доступ и зафиксировать геометрию объекта и привязки коммуникаций до расчёта сметы.',
      action_code: 'SCHEDULE_MEASUREMENT',
    },
  };
}

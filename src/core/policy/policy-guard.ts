import { PolicyNotice } from '@/types/agent';

export interface PolicyViolation {
  rule: string;
  severity: 'CRITICAL_BLOCK' | 'WARNING';
  message: string;
  suggested_action: string;
}

export class ConstructionPolicyGuard {
  /**
   * Рекурсивная проверка на попытку назвать, запросить или включить в варианты цену/смету/внешнее действие.
   */
  public static validatePriceSafety(textOrData: unknown): { allowed: boolean; notice?: PolicyNotice } {
    if (textOrData === null || textOrData === undefined) {
      return { allowed: true };
    }

    if (typeof textOrData === 'string') {
      const forbiddenPricePatterns = [
        /(?:итоговая|точная|окончательная|гарантированная|фиксированная)\s+(?:цена|стоимость|смета)/i,
        /(?:ремонт\s+обойдется\s+ровно\s+в|будет\s+стоить\s+ровно)/i,
        /(?:цена\s+под\s+ключ\s*:\s*\d+)/i,
        /(?:назови\s+(?:мне\s+)?(?:точную\s+)?цену|посчитай\s+(?:точную\s+)?смету|сколько\s+будет\s+стоить\s+(?:под\s+ключ|точно))/i,
        /(?:дай\s+финальную\s+стоимость|гарантируй\s+бюджет)/i,
        /(?:смета\s+составит|цена\s+составит|стоимость\s+составляет)\s*\d+/i,
        /\d+[\s\d]*\s*(?:тыс|млн|миллион\w*|тг|тенге|руб|usd|\$)\s*(?:под\s+ключ|за\s+все|за\s+всё|итого)/i,
      ];

      for (const pattern of forbiddenPricePatterns) {
        if (pattern.test(textOrData)) {
          return {
            allowed: false,
            notice: {
              blocked: true,
              rule: 'PROHIBIT_PREMATURE_FINAL_PRICE',
              message: `Политика безопасности запрещает рассчитывать или обещать итоговую смету: «${textOrData.slice(0, 80)}...»`,
              user_warning: 'Запрос на точную цену перехвачен: смета не формируется, чтобы не обещать цифру, которую объект не подтвердил.',
            },
          };
        }
      }
    }

    // Рекурсивный обход массивов
    if (Array.isArray(textOrData)) {
      for (const item of textOrData) {
        const itemCheck = this.validatePriceSafety(item);
        if (!itemCheck.allowed) {
          return itemCheck;
        }
      }
      return { allowed: true };
    }

    // Рекурсивный обход объектов
    if (typeof textOrData === 'object') {
      const record = textOrData as Record<string, unknown>;
      const forbiddenKeys = [
        'final_guaranteed_price',
        'estimated_price',
        'final_price',
        'cost_estimate',
        'budget_calculation',
        'financial_advice',
        'external_action',
      ];

      for (const key of forbiddenKeys) {
        if (key in record && record[key] !== null && record[key] !== undefined) {
          return {
            allowed: false,
            notice: {
              blocked: true,
              rule: 'PROHIBIT_PREMATURE_FINAL_PRICE',
              message: `Поле «${key}» заблокировано защитным контуром. Расчёт сметы и внешние действия запрещены.`,
              user_warning: 'Попытка генерации цены или внешнего действия перехвачена: поле удалено.',
            },
          };
        }
      }

      // Рекурсивная проверка всех значений объекта (включая вопросы, options, explanation)
      for (const value of Object.values(record)) {
        const subCheck = this.validatePriceSafety(value);
        if (!subCheck.allowed) {
          return subCheck;
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Проверка на несанкционированные необратимые действия (заказ материалов, отправка подрядчикам).
   */
  public static validateIrreversibleAction(
    actionName: string,
    hasHumanApproval: boolean
  ): { allowed: boolean; violation?: PolicyViolation } {
    const irreversibleActions = [
      'send_rfq_to_contractors',
      'order_building_materials',
      'sign_contract',
      'transfer_deposit',
      'dispatch_contractor',
    ];

    if (irreversibleActions.includes(actionName)) {
      if (!hasHumanApproval) {
        return {
          allowed: false,
          violation: {
            rule: 'HUMAN_APPROVAL_REQUIRED',
            severity: 'CRITICAL_BLOCK',
            message: `Действие «${actionName}» требует явного подтверждения человека.`,
            suggested_action: 'Подтвердить черновик WorkBrief.',
          },
        };
      } else {
        return {
          allowed: false,
          violation: {
            rule: 'EXTERNAL_ACTION_LOCKED',
            severity: 'CRITICAL_BLOCK',
            message: `Внешнее действие «${actionName}» заблокировано. В демо-версии подтверждается исключительно черновик ТЗ, внешние интеграции отключены.`,
            suggested_action: 'Переход к реальным подрядчикам и закупкам не производится.',
          },
        };
      }
    }

    return { allowed: true };
  }
}

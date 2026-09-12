import { PolicyNotice } from '@/types/agent';

export interface PolicyViolation {
  rule: string;
  severity: 'CRITICAL_BLOCK' | 'WARNING';
  message: string;
  suggested_action: string;
}

export class ConstructionPolicyGuard {
  /**
   * Проверка на попытку назвать или запросить финальную/фиксированную цену/смету до обмера.
   */
  public static validatePriceSafety(textOrData: unknown): { allowed: boolean; notice?: PolicyNotice } {
    if (typeof textOrData === 'string') {
      const forbiddenPricePatterns = [
        /(?:итоговая|точная|окончательная|гарантированная|фиксированная)\s+(?:цена|стоимость|смета)/i,
        /(?:ремонт\s+обойдется\s+ровно\s+в|будет\s+стоить\s+ровно)/i,
        /(?:цена\s+под\s+ключ\s*:\s*\d+)/i,
        /(?:назови\s+(?:мне\s+)?(?:точную\s+)?цену|посчитай\s+(?:точную\s+)?смету|сколько\s+будет\s+стоить\s+(?:под\s+ключ|точно))/i,
        /(?:дай\s+финальную\s+стоимость|гарантируй\s+бюджет)/i,
      ];

      for (const pattern of forbiddenPricePatterns) {
        if (pattern.test(textOrData)) {
          return {
            allowed: false,
            notice: {
              blocked: true,
              rule: 'PROHIBIT_PREMATURE_FINAL_PRICE',
              message: 'Политика безопасности запрещает рассчитывать или обещать итоговую смету до инструментального обмера специалистом.',
              user_warning: 'Запрос на точную цену перехвачен: смета не формируется, чтобы не обещать цифру, которую объект не подтвердил.',
            },
          };
        }
      }
    }

    if (typeof textOrData === 'object' && textOrData !== null) {
      const record = textOrData as Record<string, unknown>;
      const forbiddenKeys = [
        'final_guaranteed_price',
        'estimated_price',
        'final_price',
        'cost_estimate',
        'budget_calculation',
        'financial_advice',
      ];

      for (const key of forbiddenKeys) {
        if (key in record && record[key] !== null && record[key] !== undefined) {
          return {
            allowed: false,
            notice: {
              blocked: true,
              rule: 'PROHIBIT_PREMATURE_FINAL_PRICE',
              message: `Поле «${key}» заблокировано защитным контуром. Расчёт сметы запрещен до проведения инструментального обмера.`,
              user_warning: 'Попытка генерации цены или сметы перехвачена: поле удалено.',
            },
          };
        }
      }

      // Рекурсивный поиск запрещенных ценовых фраз в строковых полях
      for (const [k, v] of Object.entries(record)) {
        if (typeof v === 'string') {
          const stringCheck = this.validatePriceSafety(v);
          if (!stringCheck.allowed) {
            return stringCheck;
          }
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

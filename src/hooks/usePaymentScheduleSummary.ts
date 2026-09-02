import { useMemo } from "react";
import { BudgetItem } from "@/src/types";

export type PaymentScheduleField =
  | "paymentAdvance"
  | "payment30d"
  | "payment45d"
  | "payment60d"
  | "payment90d"
  | "payment120d";

export interface PaymentScheduleColumn {
  field: PaymentScheduleField;
  label: string;
}

export type PaymentScheduleTotals = Record<PaymentScheduleField, number>;

/** Acréscimo aplicado aos prazos exibidos no cronograma de pagamento (slots permanecem os mesmos). */
export const PAYMENT_SCHEDULE_DAY_OFFSET = 7;

const PAYMENT_SCHEDULE_SLOT_BASE_DAYS: Record<
  Exclude<PaymentScheduleField, "paymentAdvance">,
  number
> = {
  payment30d: 30,
  payment45d: 45,
  payment60d: 60,
  payment90d: 90,
  payment120d: 120,
};

function paymentScheduleDayLabel(
  field: Exclude<PaymentScheduleField, "paymentAdvance">,
): string {
  return `${PAYMENT_SCHEDULE_SLOT_BASE_DAYS[field] + PAYMENT_SCHEDULE_DAY_OFFSET} dias`;
}

export const PAYMENT_SCHEDULE_COLUMNS: PaymentScheduleColumn[] = [
  { field: "paymentAdvance", label: "Antecipado" },
  { field: "payment30d", label: paymentScheduleDayLabel("payment30d") },
  { field: "payment45d", label: paymentScheduleDayLabel("payment45d") },
  { field: "payment60d", label: paymentScheduleDayLabel("payment60d") },
  { field: "payment90d", label: paymentScheduleDayLabel("payment90d") },
  { field: "payment120d", label: paymentScheduleDayLabel("payment120d") },
];

export const emptyPaymentScheduleTotals = (): PaymentScheduleTotals => ({
  paymentAdvance: 0,
  payment30d: 0,
  payment45d: 0,
  payment60d: 0,
  payment90d: 0,
  payment120d: 0,
});

export function calculatePaymentScheduleTotals(
  items: BudgetItem[],
): PaymentScheduleTotals {
  return items.reduce<PaymentScheduleTotals>((totals, item) => {
    if (item.total < 0) return totals;

    PAYMENT_SCHEDULE_COLUMNS.forEach(({ field }) => {
      totals[field] += Number(item[field]) || 0;
    });

    return totals;
  }, emptyPaymentScheduleTotals());
}

export function calculatePaymentScheduleGrandTotal(
  totals: PaymentScheduleTotals,
) {
  return PAYMENT_SCHEDULE_COLUMNS.reduce(
    (sum, column) => sum + totals[column.field],
    0,
  );
}

export function usePaymentScheduleSummary(items: BudgetItem[]) {
  return useMemo(() => {
    const totals = calculatePaymentScheduleTotals(items);

    return {
      totals,
      grandTotal: calculatePaymentScheduleGrandTotal(totals),
    };
  }, [items]);
}

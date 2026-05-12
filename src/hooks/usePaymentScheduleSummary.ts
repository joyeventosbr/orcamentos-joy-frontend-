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

export const PAYMENT_SCHEDULE_COLUMNS: PaymentScheduleColumn[] = [
  { field: "paymentAdvance", label: "Antecipado" },
  { field: "payment30d", label: "30 dias" },
  { field: "payment45d", label: "45 dias" },
  { field: "payment60d", label: "60 dias" },
  { field: "payment90d", label: "90 dias" },
  { field: "payment120d", label: "120 dias" },
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

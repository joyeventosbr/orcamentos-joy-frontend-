import { BudgetBillingType, BudgetItem } from "@/src/types";
import { calculateReferenceLineAmount } from "@/src/lib/budgetFactory";
import { calculateGrossUpTax } from "@/src/lib/profitability";
import { useMemo } from "react";

export type BillingSummaryKey = "client" | "joy" | "joyInvoiceTax" | "optional" | "excluded" | "unfilled";

export interface BillingSummaryMetric {
  key: BillingSummaryKey;
  label: string;
  spreadsheetLabel: string;
  amount: number;
  itemCount: number;
}

export interface BudgetBillingSummary {
  metrics: BillingSummaryMetric[];
  secondaryMetrics: BillingSummaryMetric[];
  billingTypeIssues: BillingSummaryMetric;
  honorariumBase: number;
  totalSuppliers: number;
  filledAmount: number;
  unfilledAmount: number;
  unfilledItemCount: number;
}

const billingTypeToSummaryKey: Record<BudgetBillingType, BillingSummaryKey> = {
  "VIA CLIENTE": "client",
  "ND OU REPASSE": "joy",
  "VIA NF": "joy",
  OPCIONAL: "optional",
  EXCLUÍDO: "excluded",
};

const getBillingSummaryKey = (billingType: BudgetItem["billingType"]): BillingSummaryKey => {
  if (!billingType) return "unfilled";

  return billingTypeToSummaryKey[billingType];
};

export function calculateBudgetBillingSummary(items: BudgetItem[], taxNfRate: number): BudgetBillingSummary {
  const summaryByKey: Record<BillingSummaryKey, BillingSummaryMetric> = {
      client: {
        key: "client",
        label: "Fornecedores via Cliente",
        spreadsheetLabel: "Subtotal 1: faturamento FORNECEDORES via CLIENTE",
        amount: 0,
        itemCount: 0,
      },
      joy: {
        key: "joy",
        label: "Fornecedores via Joy",
        spreadsheetLabel: "Subtotal 1: faturamento FORNECEDORES via JOY",
        amount: 0,
        itemCount: 0,
      },
      joyInvoiceTax: {
        key: "joyInvoiceTax",
        label: "Imposto NF Joy Eventos",
        spreadsheetLabel: "IMPOSTO NF JOY EVENTOS",
        amount: 0,
        itemCount: 0,
      },
      optional: {
        key: "optional",
        label: "Opcional",
        spreadsheetLabel: "OPCIONAL",
        amount: 0,
        itemCount: 0,
      },
      excluded: {
        key: "excluded",
        label: "Excluído",
        spreadsheetLabel: "EXCLUÍDO",
        amount: 0,
        itemCount: 0,
      },
      unfilled: {
        key: "unfilled",
        label: "Itens sem tipo de faturamento",
        spreadsheetLabel: "ITENS NAO PREENCHIDOS",
        amount: 0,
        itemCount: 0,
      },
    };

    items.forEach((item) => {
      const key = getBillingSummaryKey(item.billingType);
      const amount =
        key === "optional" || key === "excluded"
          ? calculateReferenceLineAmount(item)
          : item.total;

      summaryByKey[key].amount += amount;
      summaryByKey[key].itemCount += 1;

      if (item.billingType === "VIA NF") {
        summaryByKey.joyInvoiceTax.amount += calculateGrossUpTax(
          item.total,
          taxNfRate,
        );
        summaryByKey.joyInvoiceTax.itemCount += 1;
      }
    });

    const billingTypeIssues = items.reduce<BillingSummaryMetric>(
      (issueSummary, item) => {
        if (!item.billingType && item.total > 0) {
          return {
            ...issueSummary,
            amount: issueSummary.amount + item.total,
            itemCount: issueSummary.itemCount + 1,
          };
        }

        return issueSummary;
      },
      {
        key: "unfilled",
        label: "Pendências de faturamento",
        spreadsheetLabel: "Itens com valor sem Tipo Faturamento",
        amount: 0,
        itemCount: 0,
      },
    );

  const totalSuppliers = summaryByKey.client.amount + summaryByKey.joy.amount + summaryByKey.joyInvoiceTax.amount;

  return {
    metrics: [summaryByKey.client, summaryByKey.joy, summaryByKey.joyInvoiceTax, summaryByKey.unfilled],
    secondaryMetrics: [summaryByKey.optional, summaryByKey.excluded],
    billingTypeIssues,
    honorariumBase: summaryByKey.client.amount + summaryByKey.joy.amount,
    totalSuppliers,
    filledAmount: totalSuppliers,
    unfilledAmount: summaryByKey.unfilled.amount,
    unfilledItemCount: summaryByKey.unfilled.itemCount,
  };
}

export function useBudgetBillingSummary(items: BudgetItem[], taxNfRate: number): BudgetBillingSummary {
  return useMemo(() => calculateBudgetBillingSummary(items, taxNfRate), [items, taxNfRate]);
}

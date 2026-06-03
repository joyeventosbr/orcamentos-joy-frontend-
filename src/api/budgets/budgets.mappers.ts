import { Budget, BudgetItem } from "@/src/types";
import {
  BillingType,
  BudgetDetail,
  BudgetLine,
  BulkUpdateBudgetLinesRequest,
  CreateBudgetLineRequest,
  PaymentTerm,
  UpdateBudgetLineRequest,
  UpdateBudgetRequest,
} from "@/src/types/api.types";

export const PAYMENT_TERM_TO_DEADLINE: Record<PaymentTerm, string> = {
  [PaymentTerm.THIRTY_DAYS]: "30",
  [PaymentTerm.FORTY_FIVE_DAYS]: "45",
  [PaymentTerm.SIXTY_DAYS]: "60",
  [PaymentTerm.NINETY_DAYS]: "90",
  [PaymentTerm.ONE_HUNDRED_TWENTY_DAYS]: "120",
};

export const DEADLINE_TO_PAYMENT_TERM: Record<string, PaymentTerm> = {
  "30": PaymentTerm.THIRTY_DAYS,
  "45": PaymentTerm.FORTY_FIVE_DAYS,
  "60": PaymentTerm.SIXTY_DAYS,
  "90": PaymentTerm.NINETY_DAYS,
  "120": PaymentTerm.ONE_HUNDRED_TWENTY_DAYS,
};

function emptyToUndefined(value?: string): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function mapDetailToBudget(detail: BudgetDetail): Budget {
  return {
    id: detail.id,
    jobId: detail.folderId,
    name: detail.name,
    status: detail.status,
    isEditable: detail.isEditable,
    isDeletable: detail.isDeletable,
    parentId: detail.parentId,
    version: detail.version,
    totalValue: 0,
    lastUpdated: detail.updatedAt ?? detail.createdAt,
    createdBy: detail.createdBy,
    updatedBy: detail.updatedBy ?? null,
    items: [],
    client: detail.customerName,
    job: detail.jobDescription ?? "",
    deadline: detail.paymentTerm ? PAYMENT_TERM_TO_DEADLINE[detail.paymentTerm] : "",
    location: detail.location ?? "",
    date: detail.eventDate ?? "",
    participants: detail.participants ?? "",
    taxNf: detail.taxNf,
  };
}

export function mapLineToItem(line: BudgetLine): BudgetItem {
  return {
    id: line.id,
    categoryId: line.categoryCode,
    itemNumber: `${line.categoryCode}.${line.order}`,
    name: line.name,
    description: line.description,
    billingType: (line.billingType ?? "") as BudgetItem["billingType"],
    quantity: line.quantity,
    days: line.dailyRates,
    unitPrice: line.unitValue,
    total: line.totalValue,
    paymentAdvance: line.upfrontPayment,
    payment30d: line.installment30Days,
    payment45d: line.installment45Days,
    payment60d: line.installment60Days,
    payment90d: line.installment90Days,
    payment120d: line.installment120Days ?? 0,
    fornecedorName: line.supplier ?? "",
    fornecedorValue: line.supplierValue ?? 0,
    percentBV: line.percentBv ?? 0,
    percentNfOver: line.percentNfOver ?? 0,
  };
}

function toApiBillingType(billingType: BudgetItem["billingType"]): BillingType | null {
  if (!billingType) return null;
  return billingType as BillingType;
}

function toApiSupplier(name: string): string | null {
  const trimmed = name.trim();
  return trimmed === "" ? null : trimmed;
}

function mapItemProfitabilityToApi(item: BudgetItem) {
  return {
    supplier: toApiSupplier(item.fornecedorName),
    supplierValue: item.fornecedorValue,
    percentBv: item.percentBV,
    percentNfOver: item.percentNfOver,
  };
}

function extractOrder(itemNumber: string): number {
  const parts = itemNumber.split(".");
  const last = parts[parts.length - 1];
  return parseInt(last, 10) || 0;
}

export function mapItemToCreateRequest(item: BudgetItem, budgetId: string): CreateBudgetLineRequest {
  return {
    budgetId,
    categoryCode: item.categoryId,
    order: extractOrder(item.itemNumber),
    name: item.name,
    description: item.description,
    billingType: toApiBillingType(item.billingType),
    quantity: item.quantity,
    dailyRates: item.days,
    unitValue: item.unitPrice,
    totalValue: item.total,
    upfrontPayment: item.paymentAdvance,
    installment30Days: item.payment30d,
    installment45Days: item.payment45d,
    installment60Days: item.payment60d,
    installment90Days: item.payment90d,
    installment120Days: item.payment120d,
    ...mapItemProfitabilityToApi(item),
  };
}

export function mapItemToUpdateRequest(item: BudgetItem): UpdateBudgetLineRequest & { id: string } {
  return {
    id: item.id,
    categoryCode: item.categoryId,
    order: extractOrder(item.itemNumber),
    name: item.name,
    description: item.description,
    billingType: toApiBillingType(item.billingType),
    quantity: item.quantity,
    dailyRates: item.days,
    unitValue: item.unitPrice,
    totalValue: item.total,
    upfrontPayment: item.paymentAdvance,
    installment30Days: item.payment30d,
    installment45Days: item.payment45d,
    installment60Days: item.payment60d,
    installment90Days: item.payment90d,
    installment120Days: item.payment120d,
    ...mapItemProfitabilityToApi(item),
  };
}

export function mapBudgetToUpdateRequest(budget: Budget): UpdateBudgetRequest {
  return {
    name: budget.name,
    jobDescription: budget.job,
    location: emptyToUndefined(budget.location),
    eventDate: emptyToUndefined(budget.date),
    participants: emptyToUndefined(budget.participants),
    paymentTerm: budget.deadline ? DEADLINE_TO_PAYMENT_TERM[budget.deadline] : undefined,
  };
}

export function buildBulkRequest(
  currentItems: BudgetItem[],
  originalIds: Set<string>,
  budgetId: string,
): BulkUpdateBudgetLinesRequest {
  const currentIds = new Set(currentItems.map((i) => i.id));

  const toCreate = currentItems
    .filter((i) => !originalIds.has(i.id))
    .map((i) => mapItemToCreateRequest(i, budgetId));

  const toUpdate = currentItems
    .filter((i) => originalIds.has(i.id))
    .map((i) => mapItemToUpdateRequest(i));

  const toDelete = [...originalIds].filter((id) => !currentIds.has(id));

  return {
    id: budgetId,
    ...(toCreate.length > 0 && { create: toCreate }),
    ...(toUpdate.length > 0 && { update: toUpdate }),
    ...(toDelete.length > 0 && { delete: toDelete }),
  };
}

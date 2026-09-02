export { BudgetStatus } from "@/src/types/api.types";

import { getBudgetFolderTab } from "@/src/lib/budgetStatus";
import { BudgetStatus } from "@/src/types/api.types";

export const BUDGET_FOLDER_OPTIONS = ["concorrencia", "aprovados", "producao"] as const;

export type BudgetFolder = (typeof BUDGET_FOLDER_OPTIONS)[number];

export const BILLING_TYPE_OPTIONS = ["VIA CLIENTE", "ND OU REPASSE", "VIA NF", "OPCIONAL", "EXCLUÍDO"] as const;

export type BudgetBillingType = (typeof BILLING_TYPE_OPTIONS)[number];

export function isInternalServiceCategory(categoryId: string): boolean {
  return categoryId.startsWith("2.");
}

export const HONORARIUM_PERCENTAGE_OPTIONS = [5, 10, 15, 20, 25] as const;

export type HonorariumPercentage = (typeof HONORARIUM_PERCENTAGE_OPTIONS)[number];

export interface BudgetCategory {
  id: string;
  name: string;
}

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: "1.1", name: "1.1 - Local | Hotel | Sala" },
  { id: "1.2", name: "1.2 - A&B" },
  { id: "1.3", name: "1.3 - Técnica" },
  { id: "1.4", name: "1.4 - Cenografia" },
  { id: "1.5", name: "1.5 - Material Gráfico | Promocional" },
  { id: "1.6", name: "1.6 - Conteúdo" },
  { id: "1.7", name: "1.7 - Atração" },
  { id: "1.8", name: "1.8 - Equipe de apoio" },
  { id: "1.9", name: "1.9 - Logística" },
  { id: "1.10", name: "1.10 - Taxas e licenças" },
  { id: "1.11", name: "1.11 - Diversos" },
  { id: "1.12", name: "1.12 - Extras" },
  { id: "2.1", name: "2 - Serviços internos" },
];

export interface BudgetItem {
  id: string;
  categoryId: string;
  itemNumber: string;
  name: string;
  description: string;
  billingType: BudgetBillingType | "";
  quantity: number;
  days: number;
  unitPrice: number;
  total: number;
  paymentAdvance: number;
  payment30d: number;
  payment45d: number;
  payment60d: number;
  payment90d: number;
  payment120d: number;
  fornecedorName: string;
  fornecedorValue: number;
  percentBV: number;
  /** % NF sobre BV; se omitido, usa % BV em itens VIA NF */
  percentNfBV?: number;
  percentNfOver: number;
  nfReceived: string | null;
}

export interface Budget {
  id: string;
  jobId: string;
  name: string;
  status: BudgetStatus;
  isEditable: boolean;
  isDeletable: boolean;
  parentId: string | null;
  version: number;
  totalValue: number;
  lastUpdated: string;
  /** Nome do criador (ADMIN only na API) */
  createdBy?: string;
  /** Nome do último editor; null se ainda não editado (ADMIN only na API) */
  updatedBy?: string | null;
  items: BudgetItem[];
  client?: string;
  job?: string;
  deadline?: string;
  location?: string;
  date?: string;
  participants?: string;
  honorariumPercentage?: HonorariumPercentage;
  /** Valor de planejamento informado manualmente e persistido pela API como projectedValue. */
  projectedValue: number;
  /** Fator NF gravado na criação do orçamento (snapshot da API). */
  taxNf: number;
}

export type TBudgetItemUpdater = (id: string, field: keyof BudgetItem, value: string | number | null) => void;

export function getBudgetFolder(budget: Budget): BudgetFolder {
  return getBudgetFolderTab(budget.status);
}

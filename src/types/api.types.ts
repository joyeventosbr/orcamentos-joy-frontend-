export interface Customer {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
  name: string;
}

export interface UpdateCustomerRequest {
  name: string;
}

export interface Folder {
  id: string;
  customerId: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFolderRequest {
  customerId: string;
  name: string;
}

export interface UpdateFolderRequest {
  name: string;
}

export enum PaymentTerm {
  THIRTY_DAYS = "30_DAYS",
  FORTY_FIVE_DAYS = "45_DAYS",
  SIXTY_DAYS = "60_DAYS",
  NINETY_DAYS = "90_DAYS",
  ONE_HUNDRED_TWENTY_DAYS = "120_DAYS",
}

export enum BudgetStatus {
  Concorrencia = 1,
  AprovadoConcorrencia = 2,
  Producao = 3,
  AprovadoProducao = 4,
}

export interface ApiBudget {
  id: string;
  name: string;
  customerId: string;
  folderId: string;
  taxNf: number;
  honorariumPercentage?: number | null;
  honorariumMinimumFee?: number | null;
  status: BudgetStatus;
  isEditable: boolean;
  isDeletable: boolean;
  parentId: string | null;
  version: number;
  createdAt: string;
  jobDescription?: string;
  location?: string;
  eventDate?: string;
  participants?: string;
  paymentTerm?: PaymentTerm;
  updatedAt?: string;
  /** Visível apenas para ADMIN */
  createdBy?: string;
  /** Visível apenas para ADMIN; null enquanto o orçamento não foi editado */
  updatedBy?: string | null;
}

export interface CreateBudgetRequest {
  name: string;
  customerId: string;
  folderId: string;
}

export interface UpdateBudgetRequest {
  name?: string;
  customerId?: string;
  folderId?: string;
  projectedValue?: number;
  jobDescription?: string;
  location?: string;
  eventDate?: string;
  participants?: string;
  paymentTerm?: PaymentTerm;
  honorariumPercentage?: number | null;
  honorariumMinimumFee?: number | null;
}

// --- Budget Detail (GET /budgets/:id/details) ---

export interface Setting {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt?: string | null;
}

export const SETTING_KEY_TAX_NF = "TAX_NF" as const;

export interface UpdateSettingRequest {
  value?: string;
  key?: string;
}

export interface BudgetDetail extends ApiBudget {
  customerName: string;
  folderName: string;
  taxNf: number;
  projectedValue: number;
  lines: BudgetLine[];
}

// --- Categories ---

export interface Category {
  id: string;
  name: string;
  code: string;
  order: number;
}

export interface CreateCategoryRequest {
  name: string;
  code: string;
  order: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  code?: string;
  order?: number;
}

// --- Budget Lines ---

export enum BillingType {
  VIA_CLIENTE = "VIA CLIENTE",
  ND_OU_REPASSE = "ND OU REPASSE",
  VIA_NF = "VIA NF",
  OPCIONAL = "OPCIONAL",
  EXCLUIDO = "EXCLUÍDO",
}

export interface BudgetLine {
  id: string;
  budgetId: string;
  categoryCode: string;
  parentId: string | null;
  order: number;
  name: string;
  description: string;
  billingType: BillingType | null;
  quantity: number;
  dailyRates: number;
  unitValue: number;
  totalValue: number;
  upfrontPayment: number;
  installment30Days: number;
  installment45Days: number;
  installment60Days: number;
  installment90Days: number;
  installment120Days: number;
  billingUnitValue: number;
  billingTotalValue: number;
  supplier: string | null;
  supplierValue: number | null;
  percentBv: number | null;
  percentNfBv: number | null;
  percentNfOver: number | null;
  nfReceived: string | null;
}

export interface CreateBudgetLineRequest {
  budgetId: string;
  categoryCode: string;
  parentId?: string | null;
  order: number;
  name: string;
  description?: string;
  billingType?: BillingType | null;
  quantity?: number;
  dailyRates?: number;
  unitValue?: number;
  totalValue?: number;
  upfrontPayment?: number;
  installment30Days?: number;
  installment45Days?: number;
  installment60Days?: number;
  installment90Days?: number;
  installment120Days?: number;
  billingUnitValue?: number;
  billingTotalValue?: number;
  supplier?: string | null;
  supplierValue?: number | null;
  percentBv?: number | null;
  percentNfBv?: number | null;
  percentNfOver?: number | null;
  nfReceived?: string | null;
}

export interface UpdateBudgetLineRequest {
  categoryCode?: string;
  parentId?: string | null;
  order?: number;
  name?: string;
  description?: string;
  billingType?: BillingType | null;
  quantity?: number;
  dailyRates?: number;
  unitValue?: number;
  totalValue?: number;
  upfrontPayment?: number;
  installment30Days?: number;
  installment45Days?: number;
  installment60Days?: number;
  installment90Days?: number;
  installment120Days?: number;
  billingUnitValue?: number;
  billingTotalValue?: number;
  supplier?: string | null;
  supplierValue?: number | null;
  percentBv?: number | null;
  percentNfBv?: number | null;
  percentNfOver?: number | null;
  nfReceived?: string | null;
}

export interface BulkUpdateBudgetLinesRequest {
  id: string;
  create?: CreateBudgetLineRequest[];
  update?: Array<UpdateBudgetLineRequest & { id: string }>;
  delete?: string[];
}

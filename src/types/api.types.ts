export interface Customer {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
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

export enum PaymentTerm {
  THIRTY_DAYS = "30_DAYS",
  FORTY_FIVE_DAYS = "45_DAYS",
  SIXTY_DAYS = "60_DAYS",
  NINETY_DAYS = "90_DAYS",
  ONE_HUNDRED_TWENTY_DAYS = "120_DAYS",
}

export interface BudgetEditorInfo {
  name: string;
  email: string;
}

export interface ApiBudget {
  id: string;
  name: string;
  customerId: string;
  folderId: string;
  createdAt: string;
  jobDescription?: string;
  location?: string;
  eventDate?: string;
  participants?: string;
  paymentTerm?: PaymentTerm;
  updatedAt?: string;
  lastEditedBy?: BudgetEditorInfo;
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
  jobDescription?: string;
  location?: string;
  eventDate?: string;
  participants?: string;
  paymentTerm?: PaymentTerm;
}

// --- Budget Detail (GET /budgets/:id/details) ---

export interface BudgetDetail extends ApiBudget {
  customerName: string;
  folderName: string;
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
  billingType: BillingType;
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
}

export interface CreateBudgetLineRequest {
  budgetId: string;
  categoryCode: string;
  parentId?: string | null;
  order: number;
  name: string;
  description?: string;
  billingType?: BillingType;
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
}

export interface UpdateBudgetLineRequest {
  categoryCode?: string;
  parentId?: string | null;
  order?: number;
  name?: string;
  description?: string;
  billingType?: BillingType;
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
}

export interface BulkUpdateBudgetLinesRequest {
  create?: CreateBudgetLineRequest[];
  update?: Array<UpdateBudgetLineRequest & { id: string }>;
  delete?: string[];
}

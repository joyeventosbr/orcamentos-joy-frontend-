import { Budget, BUDGET_CATEGORIES, BudgetBillingType, BudgetItem, BudgetStatus } from "@/src/types";

const createId = (prefix: string) => `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface CreateBudgetParams {
  projectId: string;
  name: string;
  status?: BudgetStatus;
}

const INTERNAL_SERVICE_BILLING_TYPE: BudgetBillingType = "VIA NF";

const INTERNAL_SERVICE_TEMPLATE: Array<Pick<BudgetItem, "name" | "description">> = [
  { name: "Verba de produção", description: "" },
  { name: "Rádios HT", description: "" },
  { name: "Clear com", description: "" },
  { name: "Logística equipe", description: "Transporte equipe, evento e material evento" },
  { name: "Visita Técnica", description: "aéreo, terrestre, hospedagem" },
  { name: "Produtor Executivo", description: "" },
  { name: "Produtor", description: "Montagem e desmontagem" },
  { name: "Produtor", description: "Evento" },
  { name: "Produtor Financeiro", description: "orçamentos acima de 800k" },
  { name: "Diretor técnico", description: "" },
  { name: "Diretor artístico", description: "" },
  { name: "Diretor artístico online", description: "qdo evento é híbrido" },
  { name: "Roteiro MC", description: "Considerar dias de evento - R$ 4.500,00/ dia" },
  { name: "Conteúdo Site", description: "" },
  { name: "Curadoria Site", description: "de acordo com cada assunto - avaliar a cada projeto" },
  { name: "Projeto Técnico Cenográfico", description: "valor Ademir" },
  { name: "Eletricista", description: "avaliar necessidades ceno/técnica" },
  { name: "Pacote Criação", description: "KV" },
  { name: "Pacote Criação", description: "Save" },
  { name: "Pacote Criação", description: "Convite" },
  { name: "Pacote Criação", description: "Reminder" },
  { name: "Pacote Criação", description: "Crachá" },
  { name: "Pacote Criação", description: "Cordão crachá" },
  { name: "Pacote Criação", description: "Pacote cenográfico" },
  { name: "Pacote Criação", description: "Site" },
  { name: "", description: "" },
  { name: "", description: "" },
  { name: "", description: "" },
  { name: "", description: "" },
  { name: "", description: "" },
];

export function createBudgetItem(
  categoryId: string,
  itemNumber: string,
  overrides: Partial<BudgetItem> = {},
): BudgetItem {
  return {
    id: createId("i"),
    categoryId,
    itemNumber,
    name: "",
    description: "",
    billingType: "",
    quantity: 1,
    days: 1,
    unitPrice: 0,
    total: 0,
    paymentAdvance: 0,
    payment30d: 0,
    payment45d: 0,
    payment60d: 0,
    payment90d: 0,
    ...overrides,
  };
}

export function createDefaultBudgetItems(): BudgetItem[] {
  return BUDGET_CATEGORIES.flatMap((category) => {
    if (category.id !== "2.1") {
      return createBudgetItem(category.id, `${category.id}.1`);
    }

    return INTERNAL_SERVICE_TEMPLATE.map((item, index) =>
      createBudgetItem("2.1", `2.1.${index + 1}`, {
        ...item,
        billingType: INTERNAL_SERVICE_BILLING_TYPE,
      }),
    );
  });
}

export function createBudget({ projectId, name, status = "Rascunho" }: CreateBudgetParams): Budget {
  return {
    id: createId("b"),
    projectId,
    name,
    status,
    totalValue: 0,
    lastUpdated: new Date().toISOString(),
    honorariumPercentage: 10,
    items: createDefaultBudgetItems(),
  };
}

export function recalculateBudgetTotal(items: BudgetItem[]) {
  return items.reduce((sum, item) => sum + item.total, 0);
}

export function recalculateBudgetItemTotal(item: BudgetItem): BudgetItem {
  return {
    ...item,
    total: Number(item.quantity) * Number(item.days) * Number(item.unitPrice),
  };
}

export function createDuplicatedBudget(budget: Budget, relatedBudgets: Budget[]): Budget {
  let baseName = budget.name;
  const versionMatch = budget.name.match(/^(.*?)(?:\s+v(\d+))?$/);

  if (versionMatch?.[1]) {
    baseName = versionMatch[1];
  }

  const sameBaseBudgets = relatedBudgets.filter(
    (item) => item.projectId === budget.projectId && item.name.startsWith(baseName),
  );

  const maxVersion = sameBaseBudgets.reduce((max, item) => {
    const match = item.name.match(/^(.*?)(?:\s+v(\d+))?$/);

    if (!match || match[1] !== baseName) return max;

    return Math.max(max, match[2] ? parseInt(match[2], 10) : 1);
  }, 0);

  return {
    ...budget,
    id: createId("b"),
    name: `${baseName} v${maxVersion + 1}`,
    lastUpdated: new Date().toISOString(),
    items: budget.items.map((item) => ({
      ...item,
      id: createId("i"),
    })),
  };
}

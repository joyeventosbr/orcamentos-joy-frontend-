import { Badge } from "@/src/components/ui/Badge/Badge";
import { Button } from "@/src/components/ui/Button/Button";
import { Card, CardContent } from "@/src/components/ui/Card/Card";
import { useBudgetCardMetrics } from "@/src/hooks/useBudgetCardMetrics";
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  BUDGET_STATUS_LABEL,
  canDeleteBudget,
  canDuplicateBudget,
  getStatusBadgeVariant,
  shouldShowBudgetVersion,
} from "@/src/lib/budgetStatus";
import { DashboardReturnState, buildDashboardReturnState } from "@/src/lib/dashboardNavigation";
import { formatCurrencyBRL, formatProfitabilityPercent } from "@/src/lib/formatters";
import { ApiBudget } from "@/src/types/api.types";
import { format } from "date-fns";
import { Calendar, CircleDollarSign, Copy, FileText, MoreHorizontal, Search, Trash2, TrendingUp, UserRound } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface BudgetsViewProps {
  budgets: ApiBudget[];
  viewMode: "grid" | "table";
  dashboardReturnState: DashboardReturnState;
  onDuplicate: (budgetId: string) => void;
  onDelete: (budget: ApiBudget) => void;
  duplicatingBudgetId?: string | null;
  deletingBudgetId?: string | null;
  onClearFilters: () => void;
}

function BudgetActionsMenu({
  budget,
  onDuplicate,
  onDelete,
  duplicatingBudgetId,
  deletingBudgetId,
}: {
  budget: ApiBudget;
  onDuplicate: (budgetId: string) => void;
  onDelete: (budget: ApiBudget) => void;
  duplicatingBudgetId: string | null;
  deletingBudgetId: string | null;
}) {
  const showDuplicate = canDuplicateBudget(budget.status);
  const showDelete = canDeleteBudget(budget);
  const isDuplicating = duplicatingBudgetId === budget.id;
  const isDeleting = deletingBudgetId === budget.id;

  if (!showDuplicate && !showDelete) return null;

  return (
    <div className="relative group/menu inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity p-1"
        aria-label="Ações do orçamento"
      >
        <MoreHorizontal size={20} />
      </button>
      <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
        <div className="p-1">
          {showDuplicate && (
            <button
              type="button"
              disabled={isDuplicating || isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(budget.id);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md whitespace-nowrap disabled:opacity-50"
            >
              <Copy size={14} />
              {isDuplicating ? "Duplicando…" : "Duplicar"}
            </button>
          )}
          {showDelete && (
            <button
              type="button"
              disabled={isDuplicating || isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(budget);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md whitespace-nowrap disabled:opacity-50"
            >
              <Trash2 size={14} />
              {isDeleting ? "Excluindo…" : "Excluir"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getBudgetDisplayDate(budget: ApiBudget): string {
  return budget.updatedAt ?? budget.createdAt;
}

function BudgetMetricsValue({
  metrics,
  formatValue,
}: {
  metrics: { grandTotal: number; pctRentabilidade: number | null } | undefined;
  formatValue: (metrics: { grandTotal: number; pctRentabilidade: number | null }) => string;
}) {
  if (!metrics) {
    return <span className="text-gray-300">—</span>;
  }

  return <span className="tabular-nums">{formatValue(metrics)}</span>;
}

export function BudgetsView({
  budgets,
  viewMode,
  dashboardReturnState,
  onDuplicate,
  onDelete,
  duplicatingBudgetId = null,
  deletingBudgetId = null,
  onClearFilters,
}: BudgetsViewProps) {
  const navigate = useNavigate();
  const budgetIds = useMemo(() => budgets.map((budget) => budget.id), [budgets]);
  const { metricsByBudgetId } = useBudgetCardMetrics(budgetIds);

  const openBudget = (budget: ApiBudget) => {
    navigate(`/editor/${budget.id}`, {
      state: buildDashboardReturnState({
        ...dashboardReturnState,
        status: budget.status,
      }),
    });
  };
  const { canViewEditHistory } = usePermissions();

  if (budgets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Search size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum orçamento encontrado</h3>
        <p className="text-gray-500 max-w-sm mb-6">Não encontramos nenhum orçamento nesta pasta.</p>
        <Button onClick={onClearFilters} variant="outline">
          Limpar filtros
        </Button>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <Card
            key={budget.id}
            className="group hover:border-brand-primary/30 hover:shadow-md transition-all cursor-pointer flex flex-col"
            onClick={() => openBudget(budget)}
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <FileText size={20} />
                </div>
                <BudgetActionsMenu
                  budget={budget}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  duplicatingBudgetId={duplicatingBudgetId}
                  deletingBudgetId={deletingBudgetId}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">{budget.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={getStatusBadgeVariant(budget.status)}>{BUDGET_STATUS_LABEL[budget.status]}</Badge>
                {shouldShowBudgetVersion(budget) && <span className="text-xs text-gray-500">v{budget.version}</span>}
              </div>
              {budget.jobDescription && <p className="text-sm text-gray-500 truncate">{budget.jobDescription}</p>}
              <div className="mt-auto pt-6 space-y-2 text-sm">
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <CircleDollarSign size={14} />
                  Valor total:{" "}
                  <BudgetMetricsValue
                    metrics={metricsByBudgetId.get(budget.id)}
                    formatValue={(value) => formatCurrencyBRL(value.grandTotal)}
                  />
                </div>
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <TrendingUp size={14} />
                  Rentabilidade:{" "}
                  <BudgetMetricsValue
                    metrics={metricsByBudgetId.get(budget.id)}
                    formatValue={(value) => formatProfitabilityPercent(value.pctRentabilidade)}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar size={14} />
                  {format(new Date(getBudgetDisplayDate(budget)), "dd/MM/yyyy")}
                </div>
                {canViewEditHistory && budget.createdBy && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <UserRound size={13} />
                    <span className="truncate">Criado por {budget.createdBy}</span>
                  </div>
                )}
                {canViewEditHistory && budget.updatedBy && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <UserRound size={13} />
                    <span className="truncate">
                      Editado por {budget.updatedBy} em {format(new Date(getBudgetDisplayDate(budget)), "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
          <tr>
            <th className="px-6 py-4 font-medium">Nome do Orçamento</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Descrição</th>
            <th className="px-6 py-4 font-medium">Valor total</th>
            <th className="px-6 py-4 font-medium">Rentabilidade</th>
            <th className="px-6 py-4 font-medium">{canViewEditHistory ? "Última Atualização" : "Data de Criação"}</th>
            {canViewEditHistory && <th className="px-6 py-4 font-medium">Editado por</th>}
            <th className="px-6 py-4 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {budgets.map((budget) => (
            <tr
              key={budget.id}
              className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
              onClick={() => openBudget(budget)}
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {budget.name}
                {shouldShowBudgetVersion(budget) && (
                  <span className="ml-2 text-xs text-gray-400">v{budget.version}</span>
                )}
              </td>
              <td className="px-6 py-4">
                <Badge variant={getStatusBadgeVariant(budget.status)}>{BUDGET_STATUS_LABEL[budget.status]}</Badge>
              </td>
              <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                {budget.jobDescription ?? <span className="text-gray-300">—</span>}
              </td>
              <td className="px-6 py-4 font-medium tabular-nums text-gray-700">
                <BudgetMetricsValue
                  metrics={metricsByBudgetId.get(budget.id)}
                  formatValue={(value) => formatCurrencyBRL(value.grandTotal)}
                />
              </td>
              <td className="px-6 py-4 font-medium tabular-nums text-gray-700">
                <BudgetMetricsValue
                  metrics={metricsByBudgetId.get(budget.id)}
                  formatValue={(value) => formatProfitabilityPercent(value.pctRentabilidade)}
                />
              </td>
              <td className="px-6 py-4 text-gray-500">
                {format(new Date(canViewEditHistory ? getBudgetDisplayDate(budget) : budget.createdAt), "dd/MM/yyyy")}
              </td>
              {canViewEditHistory && (
                <td className="px-6 py-4 text-gray-500">
                  {budget.updatedBy ? (
                    <div className="flex items-center gap-1.5">
                      <UserRound size={13} />
                      <span>{budget.updatedBy}</span>
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              )}
              <td className="px-6 py-4">
                <BudgetActionsMenu
                  budget={budget}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  duplicatingBudgetId={duplicatingBudgetId}
                  deletingBudgetId={deletingBudgetId}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

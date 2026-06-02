import { Button } from "@/src/components/ui/Button/Button";
import { Card, CardContent } from "@/src/components/ui/Card/Card";
import { usePermissions } from "@/src/hooks/use-permissions";
import { ApiBudget } from "@/src/types/api.types";
import { format } from "date-fns";
import { Calendar, FileText, MoreHorizontal, Search, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BudgetsViewProps {
  budgets: ApiBudget[];
  viewMode: "grid" | "table";
  onClearFilters: () => void;
}

function getBudgetDisplayDate(budget: ApiBudget): string {
  return budget.updatedAt ?? budget.createdAt;
}

export function BudgetsView({ budgets, viewMode, onClearFilters }: BudgetsViewProps) {
  const navigate = useNavigate();
  const { canViewEditHistory } = usePermissions();

  if (budgets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Search size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum orçamento encontrado</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          Não encontramos nenhum orçamento nesta pasta.
        </p>
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
            onClick={() => navigate(`/editor/${budget.id}`)}
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <FileText size={20} />
                </div>
                <div className="relative group/menu inline-block" onClick={(e) => e.stopPropagation()}>
                  <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">{budget.name}</h3>
              {budget.jobDescription && (
                <p className="text-sm text-gray-500 truncate">{budget.jobDescription}</p>
              )}
              <div className="mt-auto pt-6 space-y-2 text-sm">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar size={14} />
                  {format(new Date(getBudgetDisplayDate(budget)), "dd/MM/yyyy")}
                </div>
                {canViewEditHistory && budget.lastEditedBy && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <UserRound size={13} />
                    <span className="truncate">Última edição: {budget.lastEditedBy.name}</span>
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
          <tr>
            <th className="px-6 py-4 font-medium">Nome do Orçamento</th>
            <th className="px-6 py-4 font-medium">Descrição</th>
            <th className="px-6 py-4 font-medium">
              {canViewEditHistory ? "Última Atualização" : "Data de Criação"}
            </th>
            {canViewEditHistory && <th className="px-6 py-4 font-medium">Editado por</th>}
            <th className="px-6 py-4 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {budgets.map((budget) => (
            <tr
              key={budget.id}
              className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/editor/${budget.id}`)}
            >
              <td className="px-6 py-4 font-medium text-gray-900">{budget.name}</td>
              <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                {budget.jobDescription ?? <span className="text-gray-300">—</span>}
              </td>
              <td className="px-6 py-4 text-gray-500">
                {format(
                  new Date(canViewEditHistory ? getBudgetDisplayDate(budget) : budget.createdAt),
                  "dd/MM/yyyy",
                )}
              </td>
              {canViewEditHistory && (
                <td className="px-6 py-4 text-gray-500">
                  {budget.lastEditedBy ? (
                    <div className="flex items-center gap-1.5">
                      <UserRound size={13} />
                      <span>{budget.lastEditedBy.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              )}
              <td className="px-6 py-4">
                <div className="relative group/menu inline-block" onClick={(e) => e.stopPropagation()}>
                  <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { Input } from "@/src/components/ui/Input/Input";
import { BudgetStatus } from "@/src/types";
import { LayoutGrid, List, Search } from "lucide-react";

const STATUS_FILTER_OPTIONS = ["Todos", "Rascunho", "Em andamento", "Aprovado"] as const;

interface DashboardToolbarProps {
  isProjectView: boolean;
  searchQuery: string;
  statusFilter: BudgetStatus | "Todos";
  viewMode: "grid" | "table";
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: BudgetStatus | "Todos") => void;
  onViewModeChange: (mode: "grid" | "table") => void;
}

export function DashboardToolbar({
  isProjectView,
  searchQuery,
  statusFilter,
  viewMode,
  onSearchChange,
  onStatusFilterChange,
  onViewModeChange,
}: DashboardToolbarProps) {
  return (
    <div className="px-8 py-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center flex-shrink-0">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder={isProjectView ? "Buscar projetos..." : "Buscar orçamentos..."}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {!isProjectView && (
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {STATUS_FILTER_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status === "Todos" ? "Todos" : status as BudgetStatus)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === status
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900"}`}
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => onViewModeChange("table")}
          className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900"}`}
        >
          <List size={16} />
        </button>
      </div>
    </div>
  );
}

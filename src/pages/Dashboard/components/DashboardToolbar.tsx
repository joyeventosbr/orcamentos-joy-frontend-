import { Input } from "@/src/components/ui/Input/Input";
import { LayoutGrid, List, Search } from "lucide-react";

interface DashboardToolbarProps {
  level: "customers" | "folders" | "budgets";
  searchQuery: string;
  viewMode: "grid" | "table";
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: "grid" | "table") => void;
}

export function DashboardToolbar({
  level,
  searchQuery,
  viewMode,
  onSearchChange,
  onViewModeChange,
}: DashboardToolbarProps) {
  const searchPlaceholder =
    level === "customers"
      ? "Buscar clientes..."
      : level === "folders"
        ? "Buscar pastas..."
        : "Buscar orçamentos...";

  return (
    <div className="px-8 py-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-1.5 rounded-md transition-colors ${
            viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900"
          }`}
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => onViewModeChange("table")}
          className={`p-1.5 rounded-md transition-colors ${
            viewMode === "table" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900"
          }`}
        >
          <List size={16} />
        </button>
      </div>
    </div>
  );
}

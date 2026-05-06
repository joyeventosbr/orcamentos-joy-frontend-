import { Button } from "@/src/components/ui/Button/Button";
import { Budget, BudgetStatus } from "@/src/types";
import { ArrowLeft, Download, FileSpreadsheet, FileText, LayoutTemplate, Save } from "lucide-react";

interface BudgetEditorHeaderProps {
  budget: Budget;
  isSidebarOpen: boolean;
  onBudgetChange: (updates: Partial<Budget>) => void;
  onToggleSidebar: () => void;
  onSave: () => void;
  onNavigateBack: () => void;
}

export function BudgetEditorHeader({
  budget,
  isSidebarOpen,
  onBudgetChange,
  onToggleSidebar,
  onSave,
  onNavigateBack,
}: BudgetEditorHeaderProps) {
  return (
    <header className="flex flex-col border-b border-gray-200 bg-white flex-shrink-0">
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateBack}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={budget.name}
                onChange={(e) => onBudgetChange({ name: e.target.value })}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-brand-primary rounded px-1 -ml-1 transition-all w-80 hover:bg-gray-50"
              />
              <select
                value={budget.status}
                onChange={(e) => onBudgetChange({ status: e.target.value as BudgetStatus })}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border-none outline-none cursor-pointer transition-colors appearance-none text-center ${
                  budget.status === "Aprovado"
                    ? "bg-green-100 text-green-800"
                    : budget.status === "Em andamento"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                <option value="Rascunho">Rascunho</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Aprovado">Aprovado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onToggleSidebar}
            className="gap-2 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/5"
          >
            <LayoutTemplate size={16} />
            {isSidebarOpen ? "Ocultar Resumo" : "Resumo"}
          </Button>
          <div className="relative group">
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Exportar
            </Button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-1">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Excel (.xlsx)
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <FileText size={16} className="text-red-500" />
                  PDF Download
                </button>
              </div>
            </div>
          </div>
          <Button onClick={onSave} className="gap-2 bg-brand-primary hover:bg-[#721545] text-white">
            <Save size={16} />
            Salvar
          </Button>
        </div>
      </div>

      {/* Budget Details Row */}
      <div className="px-6 pb-4 pt-1 flex items-center gap-6 overflow-x-auto scrollbar-none border-t border-slate-100/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Cliente:</span>
          <input
            type="text"
            value={budget.client || ""}
            onChange={(e) => onBudgetChange({ client: e.target.value })}
            className="text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 hover:bg-slate-50 placeholder-slate-300 rounded px-2 py-1 w-40 transition-colors"
            placeholder="Nome do cliente"
          />
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Job:</span>
          <input
            type="text"
            value={budget.job || ""}
            onChange={(e) => onBudgetChange({ job: e.target.value })}
            className="text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 hover:bg-slate-50 placeholder-slate-300 rounded px-2 py-1 w-48 transition-colors"
            placeholder="Descrição do job"
          />
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Prazo:</span>
          <select
            value={budget.deadline || ""}
            onChange={(e) => onBudgetChange({ deadline: e.target.value })}
            className="text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 hover:bg-slate-50 rounded px-2 py-1 transition-colors bg-transparent cursor-pointer"
          >
            <option value="">-- dias</option>
            <option value="30">30 dias</option>
            <option value="45">45 dias</option>
            <option value="60">60 dias</option>
            <option value="90">90 dias</option>
            <option value="120">120 dias</option>
          </select>
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Local:</span>
          <input
            type="text"
            value={budget.location || ""}
            onChange={(e) => onBudgetChange({ location: e.target.value })}
            className="text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 hover:bg-slate-50 placeholder-slate-300 rounded px-2 py-1 w-40 transition-colors"
            placeholder="Local do evento"
          />
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Data:</span>
          <input
            type="text"
            value={budget.date || ""}
            onChange={(e) => onBudgetChange({ date: e.target.value })}
            className="text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 hover:bg-slate-50 placeholder-slate-300 rounded px-2 py-1 w-32 transition-colors"
            placeholder="DD/MM/AAAA"
          />
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Nº Part.:</span>
          <input
            type="text"
            value={budget.participants || ""}
            onChange={(e) => onBudgetChange({ participants: e.target.value })}
            className="text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 hover:bg-slate-50 placeholder-slate-300 rounded px-2 py-1 w-24 transition-colors"
            placeholder="Ex: 100"
          />
        </div>
      </div>
    </header>
  );
}

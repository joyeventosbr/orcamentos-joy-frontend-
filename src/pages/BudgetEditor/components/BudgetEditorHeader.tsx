import { Badge } from "@/src/components/ui/Badge/Badge";
import { Button } from "@/src/components/ui/Button/Button";
import { getBudgetDisplayStatus, getStatusBadgeVariant } from "@/src/lib/budgetStatus";
import { Budget } from "@/src/types";
import { ArrowLeft, Download, FileSpreadsheet, FileText, LayoutTemplate, Lock, Save, TrendingUp } from "lucide-react";
import { BudgetStatusSelect } from "./BudgetStatusSelect";

interface BudgetEditorHeaderProps {
  budget: Budget;
  activeSidebar: "summary" | "profitability" | null;
  isLocked: boolean;
  onBudgetChange: (updates: Partial<Budget>) => void;
  onToggleSidebar: () => void;
  onToggleProfitability: () => void;
  onSave: () => void;
  onNavigateBack: () => void;
}

export function BudgetEditorHeader({
  budget,
  activeSidebar,
  isLocked,
  onBudgetChange,
  onToggleSidebar,
  onToggleProfitability,
  onSave,
  onNavigateBack,
}: BudgetEditorHeaderProps) {
  const displayStatus = getBudgetDisplayStatus(budget);
  const phaseLabel = budget.phase === "concorrencia" ? "Concorrência" : "Produção";

  const isClientEmpty = !isLocked && !budget.client?.trim();
  const isJobEmpty = !isLocked && !budget.job?.trim();
  const isDeadlineEmpty = !isLocked && !budget.deadline;

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
                disabled={isLocked}
                className={`text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-brand-primary rounded px-1 -ml-1 transition-all w-80 ${
                  isLocked ? "cursor-default opacity-75" : "hover:bg-gray-50"
                }`}
              />

              <div className="w-px h-5 bg-gray-200" aria-hidden />

              {isLocked ? (
                <Badge variant={getStatusBadgeVariant(displayStatus)} className="gap-1.5">
                  <Lock size={12} />
                  {displayStatus}
                </Badge>
              ) : (
                <BudgetStatusSelect
                  value={budget.status}
                  onChange={(status) => onBudgetChange({ status })}
                />
              )}

              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                {phaseLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={activeSidebar === "profitability" ? "default" : "outline"}
            onClick={onToggleProfitability}
            className={`gap-2 ${activeSidebar === "profitability" ? "bg-black hover:bg-gray-800 text-white border-black" : "text-gray-900 border-gray-300 hover:bg-gray-100"}`}
          >
            <TrendingUp size={16} />
            Rentabilidade
          </Button>
          <Button
            variant={activeSidebar === "summary" ? "default" : "outline"}
            onClick={onToggleSidebar}
            className={`gap-2 ${activeSidebar === "summary" ? "bg-black hover:bg-gray-800 text-white border-black" : "text-gray-900 border-gray-300 hover:bg-gray-100"}`}
          >
            <LayoutTemplate size={16} />
            {activeSidebar === "summary" ? "Ocultar Resumo" : "Resumo"}
          </Button>
          <div className="relative group">
            <Button variant="outline" className="gap-2 text-gray-900 border-gray-300 hover:bg-gray-100">
              <Download size={16} />
              Exportar
            </Button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-1">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <FileSpreadsheet size={16} className="text-gray-900" />
                  Excel (.xlsx)
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <FileText size={16} className="text-gray-900" />
                  PDF Download
                </button>
              </div>
            </div>
          </div>
          {!isLocked && (
            <Button onClick={onSave} className="gap-2 bg-black hover:bg-gray-800 text-white border-black">
              <Save size={16} />
              Salvar
            </Button>
          )}
        </div>
      </div>

      {/* Budget Details Row */}
      <div className="px-6 pb-4 pt-1 flex items-center gap-6 overflow-x-auto scrollbar-none border-t border-slate-100/50">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold whitespace-nowrap transition-colors ${isClientEmpty ? "text-red-500" : "text-slate-800"}`}>
            Cliente:{!isLocked && <span className="text-red-400 ml-0.5 text-xs">*</span>}
          </span>
          <input
            type="text"
            value={budget.client || ""}
            onChange={(e) => onBudgetChange({ client: e.target.value })}
            disabled={isLocked}
            title={isClientEmpty ? "Campo obrigatório" : undefined}
            className={`text-sm font-medium border-none outline-none rounded px-2 py-1 w-40 transition-all ${
              isLocked
                ? "cursor-default bg-transparent text-slate-600"
                : isClientEmpty
                  ? "bg-red-50 ring-1 ring-red-200 text-slate-600 placeholder-red-300 focus:ring-red-300"
                  : "text-slate-600 hover:bg-slate-50 placeholder-slate-300 focus:ring-1 focus:ring-brand-primary/30"
            }`}
            placeholder={isClientEmpty ? "Obrigatório" : "Nome do cliente"}
          />
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold whitespace-nowrap transition-colors ${isJobEmpty ? "text-red-500" : "text-slate-800"}`}>
            Job:{!isLocked && <span className="text-red-400 ml-0.5 text-xs">*</span>}
          </span>
          <input
            type="text"
            value={budget.job || ""}
            onChange={(e) => onBudgetChange({ job: e.target.value })}
            disabled={isLocked}
            title={isJobEmpty ? "Campo obrigatório" : undefined}
            className={`text-sm font-medium border-none outline-none rounded px-2 py-1 w-48 transition-all ${
              isLocked
                ? "cursor-default bg-transparent text-slate-600"
                : isJobEmpty
                  ? "bg-red-50 ring-1 ring-red-200 text-slate-600 placeholder-red-300 focus:ring-red-300"
                  : "text-slate-600 hover:bg-slate-50 placeholder-slate-300 focus:ring-1 focus:ring-brand-primary/30"
            }`}
            placeholder={isJobEmpty ? "Obrigatório" : "Descrição do job"}
          />
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold whitespace-nowrap transition-colors ${isDeadlineEmpty ? "text-red-500" : "text-slate-800"}`}>
            Prazo:{!isLocked && <span className="text-red-400 ml-0.5 text-xs">*</span>}
          </span>
          <select
            value={budget.deadline || ""}
            onChange={(e) => onBudgetChange({ deadline: e.target.value })}
            disabled={isLocked}
            title={isDeadlineEmpty ? "Campo obrigatório" : undefined}
            className={`text-sm font-medium border-none outline-none rounded px-2 py-1 transition-all ${
              isLocked
                ? "cursor-default bg-transparent text-slate-600"
                : isDeadlineEmpty
                  ? "bg-red-50 ring-1 ring-red-200 text-red-300 cursor-pointer focus:ring-red-300"
                  : "text-slate-600 bg-transparent cursor-pointer hover:bg-slate-50 focus:ring-1 focus:ring-brand-primary/30"
            }`}
          >
            <option value="">{isDeadlineEmpty ? "Obrigatório" : "-- dias"}</option>
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
            disabled={isLocked}
            className={`text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 placeholder-slate-300 rounded px-2 py-1 w-40 transition-colors ${
              isLocked ? "cursor-default bg-transparent" : "hover:bg-slate-50"
            }`}
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
            disabled={isLocked}
            className={`text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 placeholder-slate-300 rounded px-2 py-1 w-32 transition-colors ${
              isLocked ? "cursor-default bg-transparent" : "hover:bg-slate-50"
            }`}
            placeholder="DD/MM/AAAA"
          />
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">N Part.:</span>
          <input
            type="text"
            value={budget.participants || ""}
            onChange={(e) => onBudgetChange({ participants: e.target.value })}
            disabled={isLocked}
            className={`text-sm font-medium text-slate-600 border-none outline-none focus:ring-1 focus:ring-brand-primary/30 placeholder-slate-300 rounded px-2 py-1 w-24 transition-colors ${
              isLocked ? "cursor-default bg-transparent" : "hover:bg-slate-50"
            }`}
            placeholder="Ex: 100"
          />
        </div>
      </div>
    </header>
  );
}

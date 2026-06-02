import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useDashboardFilters } from "@/src/hooks/useDashboardFilters";
import { CreateEntityModal } from "./components/CreateEntityModal";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardToolbar } from "./components/DashboardToolbar";
import { ClientsView } from "./components/ClientsView";
import { JobsView } from "./components/JobsView";
import { BudgetsView } from "./components/BudgetsView";

type DashboardLevel = "customers" | "folders" | "budgets";

export function Dashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { customers, folders, budgets, isLoading, addCustomer, addFolder, addBudget } = useAppData();

  const { currentCustomer, currentFolder, filteredCustomers, filteredFolders, filteredBudgets } =
    useDashboardFilters({
      customers,
      folders,
      budgets,
      currentCustomerId,
      currentFolderId,
      searchQuery,
    });

  const level: DashboardLevel = currentFolderId ? "budgets" : currentCustomerId ? "folders" : "customers";

  const handleBack = () => {
    setSearchQuery("");
    if (currentFolderId) {
      setCurrentFolderId(null);
    } else if (currentCustomerId) {
      setCurrentCustomerId(null);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSearchQuery("");
    setCurrentCustomerId(customerId);
  };

  const handleSelectFolder = (folderId: string) => {
    setSearchQuery("");
    setCurrentFolderId(folderId);
  };

  const handleNew = () => setIsModalOpen(true);

  const handleCreateEntity = async (name: string) => {
    if (level === "customers") {
      await addCustomer(name);
    } else if (level === "folders" && currentCustomerId) {
      await addFolder(currentCustomerId, name);
    } else if (level === "budgets" && currentFolderId && currentCustomerId) {
      const budget = await addBudget({ folderId: currentFolderId, customerId: currentCustomerId, name });
      setIsModalOpen(false);
      navigate(`/editor/${budget.id}`);
      return;
    }
    setIsModalOpen(false);
  };

  const getModalConfig = () => {
    switch (level) {
      case "customers":
        return { title: "Novo Cliente", placeholder: "Nome do cliente", submitLabel: "Criar Cliente" };
      case "folders":
        return { title: "Nova Pasta", placeholder: "Nome da pasta / evento", submitLabel: "Criar Pasta" };
      case "budgets":
        return { title: "Novo Orçamento", placeholder: "Nome do orçamento", submitLabel: "Criar Orçamento" };
    }
  };

  const newButtonLabel =
    level === "customers" ? "Novo Cliente" : level === "folders" ? "Nova Pasta" : "Novo Orçamento";

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-gray-50/50">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Carregando</div>
          <div className="mt-2 text-sm text-slate-500">Buscando dados da API...</div>
        </div>
      </div>
    );
  }

  const modalConfig = getModalConfig();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <DashboardHeader
        currentCustomer={currentCustomer}
        currentFolder={currentFolder}
        onBack={handleBack}
        onNew={handleNew}
        newButtonLabel={newButtonLabel}
      />

      <DashboardToolbar
        level={level}
        searchQuery={searchQuery}
        viewMode={viewMode}
        onSearchChange={setSearchQuery}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 overflow-auto px-8 pb-8">
        {level === "customers" && (
          <ClientsView
            customers={filteredCustomers}
            folders={folders}
            viewMode={viewMode}
            onSelectCustomer={handleSelectCustomer}
            onClearSearch={() => setSearchQuery("")}
          />
        )}
        {level === "folders" && (
          <JobsView
            folders={filteredFolders}
            budgets={budgets}
            viewMode={viewMode}
            onSelectFolder={handleSelectFolder}
            onClearSearch={() => setSearchQuery("")}
          />
        )}
        {level === "budgets" && (
          <BudgetsView
            budgets={filteredBudgets}
            viewMode={viewMode}
            onClearFilters={() => setSearchQuery("")}
          />
        )}
      </div>

      {isModalOpen && (
        <CreateEntityModal
          title={modalConfig.title}
          placeholder={modalConfig.placeholder}
          submitLabel={modalConfig.submitLabel}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleCreateEntity}
        />
      )}
    </div>
  );
}

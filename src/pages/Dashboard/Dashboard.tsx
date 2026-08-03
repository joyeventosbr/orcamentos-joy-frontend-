import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useDashboardFilters } from "@/src/hooks/useDashboardFilters";
import { BUDGET_FOLDER_OPTIONS, BudgetFolder } from "@/src/types";
import { buildDashboardReturnState, DashboardReturnState } from "@/src/lib/dashboardNavigation";
import { CreateEntityModal } from "./components/CreateEntityModal";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardToolbar } from "./components/DashboardToolbar";
import { ClientsView } from "./components/ClientsView";
import { JobsView } from "./components/JobsView";
import { BudgetsView } from "./components/BudgetsView";
import { DeleteBudgetModal } from "./components/DeleteBudgetModal";
import { ApiBudget, Customer, Folder } from "@/src/types/api.types";

type DashboardLevel = "customers" | "folders" | "budgets";

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetFolderTab, setBudgetFolderTab] = useState<BudgetFolder>("concorrencia");
  const [duplicatingBudgetId, setDuplicatingBudgetId] = useState<string | null>(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<ApiBudget | null>(null);
  const [customerToRename, setCustomerToRename] = useState<Customer | null>(null);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    customers,
    folders,
    budgets,
    isLoading,
    addCustomer,
    renameCustomer,
    addFolder,
    renameFolder,
    addBudget,
    copyBudget,
    deleteBudget,
  } = useAppData();

  const { currentCustomer, currentFolder, filteredCustomers, filteredFolders, filteredBudgets } =
    useDashboardFilters({
      customers,
      folders,
      budgets,
      currentCustomerId,
      currentFolderId,
      searchQuery,
      budgetFolderTab: currentFolderId ? budgetFolderTab : undefined,
    });

  const level: DashboardLevel = currentFolderId ? "budgets" : currentCustomerId ? "folders" : "customers";

  useEffect(() => {
    const state = location.state as DashboardReturnState | null;
    if (!state?.customerId || !state?.folderId) return;
    setCurrentCustomerId(state.customerId);
    setCurrentFolderId(state.folderId);
    if (state.budgetFolderTab) setBudgetFolderTab(state.budgetFolderTab);
  }, [location.key, location.state]);

  const dashboardReturnState =
    currentCustomerId && currentFolderId
      ? buildDashboardReturnState({
          customerId: currentCustomerId,
          folderId: currentFolderId,
          budgetFolderTab,
        })
      : null;

  const navigateToEditor = (budgetId: string, status?: ApiBudget["status"]) => {
    const state =
      dashboardReturnState ??
      (currentCustomerId && currentFolderId
        ? buildDashboardReturnState({
            customerId: currentCustomerId,
            folderId: currentFolderId,
            budgetFolderTab,
            status,
          })
        : undefined);
    navigate(`/editor/${budgetId}`, state ? { state } : undefined);
  };

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
    setBudgetFolderTab("concorrencia");
    setCurrentFolderId(folderId);
  };

  const budgetTabLabels: Record<BudgetFolder, string> = {
    concorrencia: "Concorrência",
    aprovados: "Aprovados",
    producao: "Produção",
  };

  const handleNew = () => setIsModalOpen(true);

  const handleRequestDeleteBudget = (budget: ApiBudget) => {
    setDeleteError(null);
    setBudgetToDelete(budget);
  };

  const handleConfirmDeleteBudget = async () => {
    if (!budgetToDelete) return;
    setDeletingBudgetId(budgetToDelete.id);
    setDeleteError(null);
    try {
      await deleteBudget(budgetToDelete.id);
      toast.success("Orçamento excluído com sucesso!");
      setBudgetToDelete(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Falha ao excluir orçamento");
    } finally {
      setDeletingBudgetId(null);
    }
  };

  const handleDuplicateBudget = async (budgetId: string) => {
    setDuplicatingBudgetId(budgetId);
    try {
      const copied = await copyBudget(budgetId);
      toast.success("Orçamento duplicado com sucesso!");
      navigateToEditor(copied.id, copied.status);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao duplicar orçamento");
    } finally {
      setDuplicatingBudgetId(null);
    }
  };

  const handleRenameFolder = async (name: string) => {
    if (!folderToRename) return;
    const normalizedName = name.trim();
    if (normalizedName === folderToRename.name) {
      setFolderToRename(null);
      return;
    }

    try {
      await renameFolder(folderToRename.id, normalizedName);
      toast.success("Pasta renomeada com sucesso!");
      setFolderToRename(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao renomear pasta");
      throw error;
    }
  };

  const handleRenameCustomer = async (name: string) => {
    if (!customerToRename) return;
    const normalizedName = name.trim();
    if (normalizedName === customerToRename.name) {
      setCustomerToRename(null);
      return;
    }

    try {
      await renameCustomer(customerToRename.id, normalizedName);
      toast.success("Cliente renomeado com sucesso!");
      setCustomerToRename(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao renomear cliente");
      throw error;
    }
  };

  const handleCreateEntity = async (name: string) => {
    if (level === "customers") {
      await addCustomer(name);
    } else if (level === "folders" && currentCustomerId) {
      await addFolder(currentCustomerId, name);
    } else if (level === "budgets" && currentFolderId && currentCustomerId) {
      const budget = await addBudget({ folderId: currentFolderId, customerId: currentCustomerId, name });
      setIsModalOpen(false);
      navigateToEditor(budget.id);
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
    return null;
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

      {level === "budgets" && (
        <div className="px-8 pb-4 flex gap-2">
          {BUDGET_FOLDER_OPTIONS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setBudgetFolderTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                budgetFolderTab === tab
                  ? "bg-brand-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {budgetTabLabels[tab]}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto px-8 pb-8">
        {level === "customers" && (
          <ClientsView
            customers={filteredCustomers}
            folders={folders}
            viewMode={viewMode}
            onSelectCustomer={handleSelectCustomer}
            onRenameCustomer={setCustomerToRename}
            onClearSearch={() => setSearchQuery("")}
          />
        )}
        {level === "folders" && (
          <JobsView
            folders={filteredFolders}
            budgets={budgets}
            viewMode={viewMode}
            onSelectFolder={handleSelectFolder}
            onRenameFolder={setFolderToRename}
            onClearSearch={() => setSearchQuery("")}
          />
        )}
        {level === "budgets" && dashboardReturnState && (
          <BudgetsView
            budgets={filteredBudgets}
            viewMode={viewMode}
            dashboardReturnState={dashboardReturnState}
            onDuplicate={handleDuplicateBudget}
            onDelete={handleRequestDeleteBudget}
            duplicatingBudgetId={duplicatingBudgetId}
            deletingBudgetId={deletingBudgetId}
            onClearFilters={() => setSearchQuery("")}
          />
        )}
      </div>

      {budgetToDelete && (
        <DeleteBudgetModal
          budgetName={budgetToDelete.name}
          error={deleteError}
          isDeleting={deletingBudgetId === budgetToDelete.id}
          onConfirm={() => void handleConfirmDeleteBudget()}
          onCancel={() => {
            setBudgetToDelete(null);
            setDeleteError(null);
          }}
        />
      )}

      {isModalOpen && (
        <CreateEntityModal
          title={modalConfig.title}
          placeholder={modalConfig.placeholder}
          submitLabel={modalConfig.submitLabel}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleCreateEntity}
        />
      )}

      {folderToRename && (
        <CreateEntityModal
          title="Renomear Pasta"
          placeholder="Nome da pasta / evento"
          submitLabel="Salvar"
          submittingLabel="Salvando..."
          initialName={folderToRename.name}
          onCancel={() => setFolderToRename(null)}
          onSubmit={handleRenameFolder}
        />
      )}

      {customerToRename && (
        <CreateEntityModal
          title="Renomear Cliente"
          placeholder="Nome do cliente"
          submitLabel="Salvar"
          submittingLabel="Salvando..."
          initialName={customerToRename.name}
          onCancel={() => setCustomerToRename(null)}
          onSubmit={handleRenameCustomer}
        />
      )}
    </div>
  );
}

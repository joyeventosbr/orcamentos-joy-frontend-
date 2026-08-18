import { useDashboardFilters } from "@/src/hooks/useDashboardFilters";
import { buildDashboardReturnState, DashboardReturnState } from "@/src/lib/dashboardNavigation";
import { BUDGET_FOLDER_OPTIONS, BudgetFolder } from "@/src/types";
import { ApiBudget, Customer, Folder } from "@/src/types/api.types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { BudgetsView } from "./components/BudgetsView";
import { ClientsView } from "./components/ClientsView";
import { CreateEntityModal } from "./components/CreateEntityModal";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardToolbar } from "./components/DashboardToolbar";
import { DeleteBudgetModal } from "./components/DeleteBudgetModal";
import { DeleteCustomerModal } from "./components/DeleteCustomerModal";
import { DeleteFolderModal } from "./components/DeleteFolderModal";
import { JobsView } from "./components/JobsView";

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
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    customers,
    folders,
    budgets,
    isLoading,
    addCustomer,
    renameCustomer,
    deleteCustomer,
    addFolder,
    renameFolder,
    deleteFolder,
    addBudget,
    copyBudget,
    deleteBudget,
  } = useAppData();

  const { currentCustomer, currentFolder, filteredCustomers, filteredFolders, filteredBudgets } = useDashboardFilters({
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

  const handleRequestDeleteCustomer = (customer: Customer) => {
    setDeleteError(null);
    setCustomerToDelete(customer);
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeletingCustomer(true);
    setDeleteError(null);
    try {
      await deleteCustomer(customerToDelete.id);
      toast.success("Cliente excluído com sucesso!");
      setCustomerToDelete(null);
      if (currentCustomerId === customerToDelete.id) {
        setCurrentCustomerId(null);
        setCurrentFolderId(null);
      }
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Falha ao excluir cliente");
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  const handleRequestDeleteFolder = (folder: Folder) => {
    setDeleteError(null);
    setFolderToDelete(folder);
  };

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsDeletingFolder(true);
    setDeleteError(null);
    try {
      await deleteFolder(folderToDelete.id);
      toast.success("Pasta excluída com sucesso!");
      setFolderToDelete(null);
      if (currentFolderId === folderToDelete.id) {
        setCurrentFolderId(null);
      }
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Falha ao excluir pasta");
    } finally {
      setIsDeletingFolder(false);
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

  const handleCreateEntity = async (name: string, projectedValue?: number) => {
    if (level === "customers") {
      await addCustomer(name);
    } else if (level === "folders" && currentCustomerId) {
      await addFolder(currentCustomerId, name);
    } else if (level === "budgets" && currentFolderId && currentCustomerId) {
      const budget = await addBudget({
        folderId: currentFolderId,
        customerId: currentCustomerId,
        name,
        projectedValue: projectedValue ?? 0,
      });
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

  const newButtonLabel = level === "customers" ? "Novo Cliente" : level === "folders" ? "Nova Pasta" : "Novo Orçamento";

  const customerDeleteFolderCount = customerToDelete
    ? folders.filter((folder) => folder.customerId === customerToDelete.id).length
    : 0;
  const customerDeleteBudgetCount = customerToDelete
    ? budgets.filter((budget) => budget.customerId === customerToDelete.id).length
    : 0;
  const folderDeleteBudgetCount = folderToDelete
    ? budgets.filter((budget) => budget.folderId === folderToDelete.id).length
    : 0;

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
            onDeleteCustomer={handleRequestDeleteCustomer}
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
            onDeleteFolder={handleRequestDeleteFolder}
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

      {customerToDelete && (
        <DeleteCustomerModal
          customerName={customerToDelete.name}
          folderCount={customerDeleteFolderCount}
          budgetCount={customerDeleteBudgetCount}
          error={deleteError}
          isDeleting={isDeletingCustomer}
          onConfirm={() => void handleConfirmDeleteCustomer()}
          onCancel={() => {
            setCustomerToDelete(null);
            setDeleteError(null);
          }}
        />
      )}

      {folderToDelete && (
        <DeleteFolderModal
          folderName={folderToDelete.name}
          budgetCount={folderDeleteBudgetCount}
          error={deleteError}
          isDeleting={isDeletingFolder}
          onConfirm={() => void handleConfirmDeleteFolder()}
          onCancel={() => {
            setFolderToDelete(null);
            setDeleteError(null);
          }}
        />
      )}

      {isModalOpen && (
        <CreateEntityModal
          title={modalConfig.title}
          placeholder={modalConfig.placeholder}
          submitLabel={modalConfig.submitLabel}
          includeProjectedValue={level === "budgets"}
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

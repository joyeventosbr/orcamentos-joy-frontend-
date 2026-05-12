import { CreateEntityModal } from "./components/CreateEntityModal";
import { useAppData } from "../../context/AppDataContext";
import { useDashboardFilters } from "@/src/hooks/useDashboardFilters";
import { BudgetFolder } from "@/src/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardToolbar } from "./components/DashboardToolbar";
import { ClientsView } from "./components/ClientsView";
import { JobsView } from "./components/JobsView";
import { BudgetsView } from "./components/BudgetsView";

type DashboardLevel = "clients" | "jobs" | "budgets";

export function Dashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState<BudgetFolder>("concorrencia");
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const { clients, jobs, budgets, isLoading, addClient, addJob, addBudget, duplicateBudget } = useAppData();

  const { currentClient, currentJob, filteredClients, filteredJobs, filteredBudgets } = useDashboardFilters({
    clients,
    jobs,
    budgets,
    currentClientId,
    currentJobId,
    activeFolder,
    searchQuery,
  });

  const level: DashboardLevel = currentJobId ? "budgets" : currentClientId ? "jobs" : "clients";

  const handleBack = () => {
    setSearchQuery("");
    if (currentJobId) {
      setCurrentJobId(null);
      setActiveFolder("concorrencia");
    } else if (currentClientId) {
      setCurrentClientId(null);
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSearchQuery("");
    setCurrentClientId(clientId);
  };

  const handleSelectJob = (jobId: string) => {
    setSearchQuery("");
    setCurrentJobId(jobId);
    setActiveFolder("concorrencia");
  };

  const handleNew = () => {
    setNewItemName("");
    setIsModalOpen(true);
  };

  const handleCreateEntity = async () => {
    const name = newItemName.trim();
    if (!name) return;

    if (level === "clients") {
      await addClient(name);
    } else if (level === "jobs" && currentClientId) {
      await addJob(currentClientId, name);
    } else if (level === "budgets" && currentJobId) {
      const budget = await addBudget({ jobId: currentJobId, name });
      setIsModalOpen(false);
      setNewItemName("");
      navigate(`/editor/${budget.id}`);
      return;
    }

    setNewItemName("");
    setIsModalOpen(false);
  };

  const getModalConfig = () => {
    switch (level) {
      case "clients":
        return { title: "Novo Cliente", placeholder: "Nome do cliente", submitLabel: "Criar Cliente" };
      case "jobs":
        return { title: "Novo Job", placeholder: "Nome do job / evento", submitLabel: "Criar Job" };
      case "budgets":
        return { title: "Novo Orçamento", placeholder: "Nome do orçamento", submitLabel: "Criar Orçamento" };
    }
  };

  const showNewButton = level !== "budgets" || activeFolder === "concorrencia";
  const newButtonLabel = level === "clients" ? "Novo Cliente" : level === "jobs" ? "Novo Job" : "Novo Orçamento";

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-gray-50/50">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Carregando dados mockados
          </div>
          <div className="mt-2 text-sm text-slate-500">Simulando busca inicial da futura API.</div>
        </div>
      </div>
    );
  }

  const modalConfig = getModalConfig();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <DashboardHeader
        currentClient={currentClient}
        currentJob={currentJob}
        onBack={handleBack}
        onNew={handleNew}
        showNewButton={showNewButton}
        newButtonLabel={newButtonLabel}
      />

      <DashboardToolbar
        level={level}
        searchQuery={searchQuery}
        activeFolder={activeFolder}
        viewMode={viewMode}
        onSearchChange={setSearchQuery}
        onFolderChange={setActiveFolder}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 overflow-auto px-8 pb-8">
        {level === "clients" && (
          <ClientsView
            clients={filteredClients}
            jobs={jobs}
            viewMode={viewMode}
            onSelectClient={handleSelectClient}
            onClearSearch={() => setSearchQuery("")}
          />
        )}
        {level === "jobs" && (
          <JobsView
            jobs={filteredJobs}
            budgets={budgets}
            viewMode={viewMode}
            onSelectJob={handleSelectJob}
            onClearSearch={() => setSearchQuery("")}
          />
        )}
        {level === "budgets" && (
          <BudgetsView
            budgets={filteredBudgets}
            viewMode={viewMode}
            onDuplicate={duplicateBudget}
            onClearFilters={() => setSearchQuery("")}
          />
        )}
      </div>

      {isModalOpen && (
        <CreateEntityModal
          title={modalConfig.title}
          placeholder={modalConfig.placeholder}
          value={newItemName}
          submitLabel={modalConfig.submitLabel}
          onChange={setNewItemName}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={() => void handleCreateEntity()}
        />
      )}
    </div>
  );
}

import { CreateEntityModal } from "./components/CreateEntityModal";
import { useAppData } from "../../context/AppDataContext";
import { useDashboardFilters } from "@/src/hooks/useDashboardFilters";
import { BudgetStatus } from "@/src/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardToolbar } from "./components/DashboardToolbar";
import { ProjectsView } from "./components/ProjectsView";
import { BudgetsView } from "./components/BudgetsView";

export function Dashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | "Todos">("Todos");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const { projects, budgets, isLoading, addProject, duplicateBudget, addBudget } = useAppData();

  const { currentProject, filteredProjects, filteredBudgets } = useDashboardFilters({
    projects,
    budgets,
    currentProjectId,
    searchQuery,
    statusFilter,
  });

  const handleCreateProject = async () => {
    const name = newItemName.trim();
    if (!name) return;
    await addProject(name);
    setNewItemName("");
    setIsProjectModalOpen(false);
  };

  const handleCreateBudget = async () => {
    const name = newItemName.trim();
    if (!name || !currentProjectId) return;
    const budget = await addBudget({ projectId: currentProjectId, name });
    setNewItemName("");
    setIsBudgetModalOpen(false);
    navigate(`/editor/${budget.id}`);
  };

  const handleNew = () => {
    setNewItemName("");
    if (currentProjectId) {
      setIsBudgetModalOpen(true);
    } else {
      setIsProjectModalOpen(true);
    }
  };

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
      <DashboardHeader
        currentProject={currentProject}
        onBack={() => setCurrentProjectId(null)}
        onNew={handleNew}
      />

      <DashboardToolbar
        isProjectView={!currentProjectId}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        viewMode={viewMode}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 overflow-auto px-8 pb-8">
        {!currentProjectId ? (
          <ProjectsView
            projects={filteredProjects}
            budgets={budgets}
            viewMode={viewMode}
            onSelectProject={setCurrentProjectId}
            onClearSearch={() => setSearchQuery("")}
          />
        ) : (
          <BudgetsView
            budgets={filteredBudgets}
            viewMode={viewMode}
            onDuplicate={duplicateBudget}
            onClearFilters={() => { setSearchQuery(""); setStatusFilter("Todos"); }}
          />
        )}
      </div>

      {isProjectModalOpen && (
        <CreateEntityModal
          title="Novo Projeto"
          placeholder="Nome do projeto"
          value={newItemName}
          submitLabel="Criar Projeto"
          onChange={setNewItemName}
          onCancel={() => setIsProjectModalOpen(false)}
          onSubmit={() => void handleCreateProject()}
        />
      )}

      {isBudgetModalOpen && currentProjectId && (
        <CreateEntityModal
          title="Novo Orçamento"
          placeholder="Nome do orçamento"
          value={newItemName}
          submitLabel="Criar Orçamento"
          onChange={setNewItemName}
          onCancel={() => setIsBudgetModalOpen(false)}
          onSubmit={() => void handleCreateBudget()}
        />
      )}
    </div>
  );
}

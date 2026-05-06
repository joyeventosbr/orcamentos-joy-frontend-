import { Button } from "@/src/components/ui/Button/Button";
import { Project } from "@/src/types";
import { ArrowLeft, Plus } from "lucide-react";

interface DashboardHeaderProps {
  currentProject: Project | undefined;
  onBack: () => void;
  onNew: () => void;
}

export function DashboardHeader({ currentProject, onBack, onNew }: DashboardHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-4">
        {currentProject && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          {currentProject ? currentProject.name : "Projetos"}
        </h1>
      </div>
      <Button onClick={onNew} className="gap-2">
        <Plus size={16} />
        {currentProject ? "Novo Orçamento" : "Novo Projeto"}
      </Button>
    </header>
  );
}

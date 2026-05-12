import { Button } from "@/src/components/ui/Button/Button";
import { Client, Job } from "@/src/types";
import { ArrowLeft, Plus } from "lucide-react";

interface DashboardHeaderProps {
  currentClient: Client | null;
  currentJob: Job | null;
  onBack: () => void;
  onNew: () => void;
  showNewButton: boolean;
  newButtonLabel: string;
}

export function DashboardHeader({
  currentClient,
  currentJob,
  onBack,
  onNew,
  showNewButton,
  newButtonLabel,
}: DashboardHeaderProps) {
  const showBack = !!currentClient;

  let title = "Clientes";
  if (currentClient && currentJob) {
    title = currentJob.name;
  } else if (currentClient) {
    title = currentClient.name;
  }

  let breadcrumb: string | null = null;
  if (currentClient && currentJob) {
    breadcrumb = `${currentClient.name}`;
  }

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="min-w-0">
          {breadcrumb && (
            <p className="text-xs text-gray-400 truncate">{breadcrumb}</p>
          )}
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>
      {showNewButton && (
        <Button onClick={onNew} className="gap-2 flex-shrink-0">
          <Plus size={16} />
          {newButtonLabel}
        </Button>
      )}
    </header>
  );
}

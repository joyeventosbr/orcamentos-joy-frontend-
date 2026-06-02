import { Button } from "@/src/components/ui/Button/Button";
import { Customer, Folder } from "@/src/types/api.types";
import { ArrowLeft, Plus } from "lucide-react";

interface DashboardHeaderProps {
  currentCustomer: Customer | null;
  currentFolder: Folder | null;
  onBack: () => void;
  onNew: () => void;
  newButtonLabel: string;
}

export function DashboardHeader({
  currentCustomer,
  currentFolder,
  onBack,
  onNew,
  newButtonLabel,
}: DashboardHeaderProps) {
  const showBack = !!currentCustomer;

  let title = "Clientes";
  if (currentCustomer && currentFolder) {
    title = currentFolder.name;
  } else if (currentCustomer) {
    title = currentCustomer.name;
  }

  const breadcrumb = currentCustomer && currentFolder ? currentCustomer.name : null;

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="min-w-0">
          {breadcrumb && (
            <p className="text-xs text-gray-400 truncate">{breadcrumb}</p>
          )}
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight truncate">{title}</h1>
        </div>
      </div>
      <Button onClick={onNew} className="gap-2 shrink-0">
        <Plus size={16} />
        {newButtonLabel}
      </Button>
    </header>
  );
}

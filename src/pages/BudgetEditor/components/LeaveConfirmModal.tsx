import { Button } from "@/src/components/ui/Button/Button";
import { AlertTriangle } from "lucide-react";

interface LeaveConfirmModalProps {
  isSaving?: boolean;
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
  onCancel: () => void;
}

export function LeaveConfirmModal({
  isSaving = false,
  onSaveAndLeave,
  onLeaveWithoutSaving,
  onCancel,
}: LeaveConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Alterações não salvas</h3>
        </div>
        <p className="text-slate-600 mb-6 font-medium">
          Você tem alterações que ainda não foram salvas. O que deseja fazer?
        </p>
        <div className="flex justify-center gap-1">
          <Button type="button" size="default" variant="outline" onClick={onCancel} disabled={isSaving}>
            Continuar editando
          </Button>
          <Button type="button" size="default" variant="danger" onClick={onLeaveWithoutSaving} disabled={isSaving}>
            Sair sem salvar
          </Button>
          <Button
            type="button"
            size="default"
            onClick={onSaveAndLeave}
            disabled={isSaving}
            className="bg-black hover:bg-gray-800 text-white border-black"
          >
            {isSaving ? "Salvando..." : "Salvar e sair"}
          </Button>
        </div>
      </div>
    </div>
  );
}

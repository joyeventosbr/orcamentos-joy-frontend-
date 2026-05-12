import { Button } from "@/src/components/ui/Button/Button";
import { Budget } from "@/src/types";
import { AlertTriangle, Lock, Copy } from "lucide-react";

interface ApprovalConfirmModalProps {
  budget: Budget;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ApprovalConfirmModal({ budget, error, onConfirm, onCancel }: ApprovalConfirmModalProps) {
  const isConcorrencia = budget.phase === "concorrencia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Confirmar Aprovação</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Ao aprovar o orçamento <strong>"{budget.name}"</strong>, as seguintes ações serão executadas:
          </p>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Lock size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Bloqueio de edição</p>
                <p className="text-xs text-gray-500">Este orçamento será bloqueado permanentemente para edição.</p>
              </div>
            </div>

            {isConcorrencia && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Copy size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cópia de Produção</p>
                  <p className="text-xs text-gray-500">
                    Uma cópia editável será criada automaticamente na pasta Produção.
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-black hover:bg-gray-800 text-white border-black"
          >
            Confirmar Aprovação
          </Button>
        </div>
      </div>
    </div>
  );
}

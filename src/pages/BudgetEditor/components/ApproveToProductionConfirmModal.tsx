import { Button } from "@/src/components/ui/Button/Button";
import { Budget } from "@/src/types";
import { AlertTriangle, Factory } from "lucide-react";

interface ApproveToProductionConfirmModalProps {
  budget: Budget;
  error: string | null;
  isAdminOverride?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ApproveToProductionConfirmModal({
  budget,
  error,
  isAdminOverride = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ApproveToProductionConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Enviar para Produção</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Isso cria uma cópia em Produção a partir do orçamento <strong>"{budget.name}"</strong>. Continuar?
          </p>

          {isAdminOverride && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Exceção de administrador</p>
                <p className="text-xs text-amber-700">
                  Este orçamento não possui rentabilidade positiva. Ao confirmar, você autoriza o envio como administrador.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg mb-4">
            <Factory size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Cópia em Produção</p>
              <p className="text-xs text-gray-500">
                O orçamento atual permanece em Concorrência. Uma cópia editável será criada na aba Produção.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-black hover:bg-gray-800 text-white border-black"
          >
            {isLoading ? "Enviando..." : "Confirmar envio"}
          </Button>
        </div>
      </div>
    </div>
  );
}

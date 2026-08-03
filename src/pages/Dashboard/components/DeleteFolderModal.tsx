import { Button } from "@/src/components/ui/Button/Button";

interface DeleteFolderModalProps {
  folderName: string;
  budgetCount: number;
  error?: string | null;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteFolderModal({
  folderName,
  budgetCount,
  error,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteFolderModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir pasta</h3>
        <p className="text-slate-600 mb-2">
          Tem certeza que deseja excluir <strong className="text-gray-900">"{folderName}"</strong>?
        </p>
        {budgetCount > 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            Esta ação também excluirá <strong>{budgetCount}</strong> orçamento
            {budgetCount !== 1 ? "s" : ""} vinculados. Não pode ser desfeita.
          </p>
        ) : (
          <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Excluindo…" : "Excluir"}
          </Button>
        </div>
      </div>
    </div>
  );
}

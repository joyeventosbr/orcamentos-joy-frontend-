import { Button } from "@/src/components/ui/Button/Button";

interface DeleteUserModalProps {
  userName: string;
  userEmail: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteUserModal({
  userName,
  userEmail,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteUserModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir usuário</h3>
        <p className="text-slate-600 mb-2">
          Tem certeza que deseja deletar{" "}
          <strong className="text-gray-900">{userName}</strong> ({userEmail})?
        </p>
        <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>

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

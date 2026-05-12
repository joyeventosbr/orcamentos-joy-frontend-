import { Button } from "@/src/components/ui/Button/Button";

interface DeleteCategoryModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteCategoryModal({ onConfirm, onCancel }: DeleteCategoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Categoria</h3>
        <p className="text-slate-600 mb-6 font-medium">
          Remover esta categoria apagará <span className="font-bold text-gray-900">TODOS</span> os seus itens. Deseja
          continuar?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Sim, Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/src/components/ui/Button/Button";
import { Input } from "@/src/components/ui/Input/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { entitySchema, type EntityFormValues } from "./entity.schema";

interface CreateEntityModalProps {
  title: string;
  placeholder: string;
  submitLabel: string;
  submittingLabel?: string;
  initialName?: string;
  onCancel: () => void;
  onSubmit: (name: string) => void | Promise<void>;
}

export function CreateEntityModal({
  title,
  placeholder,
  submitLabel,
  submittingLabel = "Criando...",
  initialName = "",
  onCancel,
  onSubmit,
}: CreateEntityModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: { name: initialName },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit(({ name }) => onSubmit(name))}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900">{title}</h3>

        <div className="mb-6 space-y-1.5">
          <Input
            placeholder={placeholder}
            aria-invalid={!!errors.name}
            autoFocus
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

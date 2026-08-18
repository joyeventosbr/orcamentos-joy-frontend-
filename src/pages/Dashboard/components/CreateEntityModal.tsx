import { Button } from "@/src/components/ui/Button/Button";
import { CurrencyInput } from "@/src/components/ui/CurrencyInput/CurrencyInput";
import { Input } from "@/src/components/ui/Input/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { entitySchema, type EntityFormValues } from "./entity.schema";

interface CreateEntityModalProps {
  title: string;
  placeholder: string;
  submitLabel: string;
  submittingLabel?: string;
  initialName?: string;
  includeProjectedValue?: boolean;
  onCancel: () => void;
  onSubmit: (name: string, projectedValue?: number) => void | Promise<void>;
}

export function CreateEntityModal({
  title,
  placeholder,
  submitLabel,
  submittingLabel = "Criando...",
  initialName = "",
  includeProjectedValue = false,
  onCancel,
  onSubmit,
}: CreateEntityModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: { name: initialName, projectedValue: 0 },
  });

  const submit = async ({ name, projectedValue }: EntityFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(name, includeProjectedValue ? (projectedValue ?? 0) : undefined);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível concluir a operação.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit(submit)}
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

          {includeProjectedValue && (
            <div className="space-y-1.5 pt-3">
              <label htmlFor="projected-value" className="block text-sm font-medium text-gray-700">
                Planejamento
              </label>
              <Controller
                name="projectedValue"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    id="projected-value"
                    ariaLabel="Valor de planejamento"
                    value={field.value ?? 0}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              <p className="text-xs text-gray-400">Deixe em branco para R$ 0,00.</p>
              {errors.projectedValue && <p className="text-xs text-red-500">{errors.projectedValue.message}</p>}
            </div>
          )}

          {submitError && <p className="pt-2 text-xs text-red-500">{submitError}</p>}
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

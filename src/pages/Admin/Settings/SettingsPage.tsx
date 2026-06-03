import { useTaxNfSettingQuery, useUpdateTaxNfSettingMutation } from "@/src/api/settings/settings.caller";
import { Button } from "@/src/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card/Card";
import { PercentageInput } from "@/src/components/ui/PercentageInput/PercentageInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  parseTaxNfSettingValue,
  taxConfigSchema,
  taxNfFormInputToApiValue,
  taxNfValueToFormInput,
  type TaxConfigFormValues,
} from "./tax-config.schema";

export function SettingsPage() {
  const { data: setting, isLoading, isError, error } = useTaxNfSettingQuery();
  const updateMutation = useUpdateTaxNfSettingMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TaxConfigFormValues>({
    resolver: zodResolver(taxConfigSchema),
    defaultValues: { taxNfPercentInput: "" },
  });

  useEffect(() => {
    if (!setting) return;
    try {
      reset({ taxNfPercentInput: taxNfValueToFormInput(parseTaxNfSettingValue(setting.value)) });
    } catch {
      toast.error("A parametrização TAX_NF retornou um valor inválido.");
    }
  }, [setting, reset]);

  const onSubmit = async (data: TaxConfigFormValues) => {
    if (!setting) {
      toast.error("Parametrização TAX_NF não encontrada.");
      return;
    }

    try {
      const apiValue = taxNfFormInputToApiValue(data.taxNfPercentInput);
      await updateMutation.mutateAsync({
        id: setting.id,
        body: { value: String(apiValue) },
      });
      toast.success("Configurações salvas com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar TAX_NF.");
    }
  };

  const saving = isSubmitting || updateMutation.isPending;
  const formDisabled = isLoading || isError || !setting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500 mt-0.5">Parâmetros fiscais e do sistema</p>
        </div>
        <Button type="submit" size="sm" className="gap-2" disabled={saving || !isDirty || formDisabled}>
          <Save size={15} />
          {saving ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-2xl space-y-6">
        {isLoading && <p className="text-sm text-gray-500">Carregando parametrização TAX_NF...</p>}

        {isError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">TAX_NF não configurada</p>
            <p className="mt-1 text-amber-800">
              {error instanceof Error ? error.message : "Verifique se a migration v009 foi aplicada no ambiente."}
            </p>
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Nota Fiscal — Imposto NF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5">
              <Info size={13} className="mt-0.5 shrink-0 text-gray-400" />
              <span>
                Percentual global usado ao <strong>criar novos orçamentos</strong>. Orçamentos já existentes mantêm o
                valor gravado na criação alterar aqui não atualiza orçamentos antigos.
              </span>
            </div>

            <div className="max-w-xs space-y-1.5">
              <label htmlFor="tax-nf-percent" className="text-sm font-medium text-gray-700">
                Imposto NF (%)
              </label>
              <Controller
                name="taxNfPercentInput"
                control={control}
                render={({ field }) => (
                  <PercentageInput
                    id="tax-nf-percent"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={formDisabled}
                    invalid={!!errors.taxNfPercentInput}
                    placeholder="0,00"
                  />
                )}
              />
              {errors.taxNfPercentInput && <p className="text-xs text-red-500">{errors.taxNfPercentInput.message}</p>}
              <p className="text-xs text-gray-500">Ex.: 8,65 ou 1,1 — use vírgula para decimais.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

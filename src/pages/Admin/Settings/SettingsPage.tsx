import { Button } from "@/src/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card/Card";
import { Input } from "@/src/components/ui/Input/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { taxConfigSchema, type TaxConfigFormValues } from "./tax-config.schema";

// Valores iniciais — substituir por useQuery quando API estiver pronta
const DEFAULT_VALUES: TaxConfigFormValues = {
  nfTaxPercentage: 8.65,
};

export function SettingsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TaxConfigFormValues>({
    resolver: zodResolver(taxConfigSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = async (_data: TaxConfigFormValues) => {
    // TODO: chamar API — PATCH /settings/tax
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Configurações salvas com sucesso.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500 mt-0.5">Parâmetros fiscais e do sistema</p>
        </div>
        <Button type="submit" size="sm" className="gap-2" disabled={isSubmitting || !isDirty}>
          <Save size={15} />
          {isSubmitting ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Nota Fiscal — Impostos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5">
              <Info size={13} className="mt-0.5 shrink-0 text-gray-400" />
              <span>
                Estes percentuais são aplicados automaticamente nos itens faturados via Nota Fiscal
                (tipo <strong>VIA NF</strong>) ao calcular o valor final do orçamento.
              </span>
            </div>

            <div className="max-w-xs space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Imposto NF (%)</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  aria-invalid={!!errors.nfTaxPercentage}
                  {...register("nfTaxPercentage", { valueAsNumber: true })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  %
                </span>
              </div>
              {errors.nfTaxPercentage && (
                <p className="text-xs text-red-500">{errors.nfTaxPercentage.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

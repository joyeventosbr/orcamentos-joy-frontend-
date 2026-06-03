import { formatPercentForInput, parsePercentInput } from "@/src/lib/percentInput";
import { z } from "zod";

export const taxConfigSchema = z.object({
  taxNfPercentInput: z
    .string()
    .min(1, "Informe um valor")
    .refine((value) => {
      const parsed = parsePercentInput(value);
      return parsed != null && parsed > 0;
    }, "O valor deve ser maior que zero"),
});

export type TaxConfigFormValues = z.infer<typeof taxConfigSchema>;

export function parseTaxNfSettingValue(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Valor TAX_NF inválido na API");
  }
  return parsed;
}

export function taxNfValueToFormInput(value: number): string {
  return formatPercentForInput(value);
}

export function taxNfFormInputToApiValue(input: string): number {
  const parsed = parsePercentInput(input);
  if (parsed == null || parsed <= 0) {
    throw new Error("Valor de imposto NF inválido");
  }
  return parsed;
}

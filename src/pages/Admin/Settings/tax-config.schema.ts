import { z } from "zod";

const percentage = z
  .number({ error: "Informe um valor válido" })
  .min(0, "Valor mínimo é 0%")
  .max(100, "Valor máximo é 100%");

export const taxConfigSchema = z.object({
  nfTaxPercentage: percentage,
});

export type TaxConfigFormValues = z.infer<typeof taxConfigSchema>;

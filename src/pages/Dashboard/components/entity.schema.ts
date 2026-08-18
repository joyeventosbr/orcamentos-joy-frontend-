import { z } from 'zod';

export const entitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  projectedValue: z
    .number()
    .finite('Valor de planejamento inválido')
    .nonnegative('Valor de planejamento inválido')
    .optional(),
});

export type EntityFormValues = z.infer<typeof entitySchema>;

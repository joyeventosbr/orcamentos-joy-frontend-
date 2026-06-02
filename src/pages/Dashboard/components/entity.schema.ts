import { z } from 'zod';

export const entitySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
});

export type EntityFormValues = z.infer<typeof entitySchema>;

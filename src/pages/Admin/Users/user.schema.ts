import { z } from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    role: z.enum(['customer', 'admin', 'temporary']),
    folderIds: z.array(z.string()).optional(),
    roleDescription: z.string().optional(),
    password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.role !== 'temporary' || (data.folderIds?.length ?? 0) > 0, { message: 'Selecione pelo menos um job', path: ['folderIds'] })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.role !== 'customer' || (data.roleDescription && data.roleDescription.trim().length > 0), {
    message: 'Função é obrigatória para perfil Cliente',
    path: ['roleDescription'],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

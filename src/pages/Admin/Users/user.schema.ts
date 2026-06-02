import { z } from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    role: z.enum(['customer', 'admin']),
    cdCliente: z.string().optional(),
    password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.role !== 'customer' || (data.cdCliente && data.cdCliente.trim().length > 0), {
    message: 'Código do cliente é obrigatório para perfil Cliente',
    path: ['cdCliente'],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

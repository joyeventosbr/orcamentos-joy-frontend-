import { Button } from "@/src/components/ui/Button/Button";
import { Input } from "@/src/components/ui/Input/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createUserSchema, type CreateUserFormValues } from "./user.schema";

interface CreateUserModalProps {
  onCancel: () => void;
  onSubmit: (data: CreateUserFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function CreateUserModal({
  onCancel,
  onSubmit,
  isSubmitting: externalSubmitting = false,
}: CreateUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", role: "customer", cdCliente: "", password: "", confirmPassword: "" },
  });

  const role = watch("role");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Novo usuário</h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <Input placeholder="Nome completo" autoFocus aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <Input type="email" placeholder="nome@empresa.com" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Perfil</label>
            <select
              aria-invalid={!!errors.role}
              className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
              {...register("role")}
            >
              <option value="customer">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          {role === "customer" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Função</label>
              <Input
                placeholder="Ex: Financeiro, Contabilidade..."
                aria-invalid={!!errors.cdCliente}
                {...register("cdCliente")}
              />
              {errors.cdCliente && <p className="text-xs text-red-500">{errors.cdCliente.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Confirmar senha</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={externalSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={externalSubmitting}>
            {externalSubmitting ? "Criando..." : "Criar usuário"}
          </Button>
        </div>
      </form>
    </div>
  );
}

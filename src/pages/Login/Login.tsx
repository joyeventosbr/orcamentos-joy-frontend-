import joyLogo from "@/src/assets/joy-logo.png";
import oLogo from "@/src/assets/PRETO_o_logo_joy.png";
import { useLoginMutation } from "@/src/api/auth/auth.caller";
import { Button } from "@/src/components/ui/Button/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/Card/Card";
import { Input } from "@/src/components/ui/Input/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "./login.schema";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = (data: LoginFormValues) => {
    setApiError(null);
    loginMutation.mutate(data, {
      onSuccess: () => navigate("/"),
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "E-mail ou senha inválidos.";
        setApiError(message);
        toast.error(message);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-clip">
      <img src={oLogo} alt="" className="absolute w-[600px] opacity-[0.04] pointer-events-none -right-32 -bottom-32" />
      <img src={oLogo} alt="" className="absolute w-[300px] opacity-[0.03] pointer-events-none -left-20 -top-20" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <img src={joyLogo} alt="Joy Eventos" className="h-14 object-contain" />
        </div>

        <div className="relative flex items-center justify-center overflow-visible">
          <img
            src={oLogo}
            alt=""
            className="absolute w-[1000px] max-w-none opacity-[0.02] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />

          <Card className="border-gray-200 shadow-sm relative z-10 w-full">
            <CardHeader className="space-y-1 pb-6 text-center">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Bem-vindo ao Sistema JOY
              </CardTitle>
              <CardDescription>
                Insira suas credenciais para acessar seu espaço de trabalho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-gray-700">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="nome@empresa.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-gray-700">
                    Senha
                  </label>
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
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {apiError && (
                  <p className="text-sm text-red-500 text-center" role="alert">
                    {apiError}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

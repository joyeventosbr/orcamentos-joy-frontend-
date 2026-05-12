import joyLogo from "@/src/assets/joy-logo.png";
import oLogo from "@/src/assets/PRETO_o_logo_joy.png";
import { Button } from "@/src/components/ui/Button/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/Card/Card";
import { Input } from "@/src/components/ui/Input/Input";
import { useAuth } from "@/src/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("felipe@joyeventos.com.br");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    login(nameFromEmail(trimmed), trimmed);
    navigate("/");
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
              <CardTitle className="text-2xl font-semibold tracking-tight">Bem-vindo ao Sistema JOY</CardTitle>
              <CardDescription>Insira suas credenciais para acessar seu espaço de trabalho</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-gray-700">E-mail</label>
                  <Input
                    type="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-gray-700">Senha</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      defaultValue="password123"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-2 cursor-pointer hover:bg-brand-primary/90" size="lg">
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

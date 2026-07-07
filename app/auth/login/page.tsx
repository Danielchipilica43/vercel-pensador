// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  GraduationCap,
  AlertCircle
} from "lucide-react";

// Schema Zod para validação
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const watchedFields = watch();

  // app/auth/login/page.tsx (parte do onSubmit - corrigido)
const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);
  setError("");

  const toastId = toast.loading("Verificando credenciais...");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Erro ao fazer login");
    }

    toast.success(result.message || "Login realizado com sucesso!", {
      id: toastId,
      description: `Bem-vindo, ${result.user.nome}!`,
      duration: 2000,
    });

    // ✅ Aguardar um pouco antes de redirecionar para garantir que o cookie seja salvo
    setTimeout(() => {
      // ✅ Usar window.location.href em vez de router.push para garantir
      window.location.href = "/adm/dashboard";
    }, 500);
    
  } catch (err) {
    console.error("Erro no login:", err);
    
    toast.error("Erro de autenticação", {
      id: toastId,
      description: err instanceof Error ? err.message : "Credenciais inválidas",
      duration: 4000,
    });
    
    setError(err instanceof Error ? err.message : "Erro ao fazer login");
  } finally {
    setIsLoading(false);
  }
};

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full opacity-20"
        />
      </div>

      {/* Card de Login */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Botão Voltar flutuante */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600 hover:text-orange-600 hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o site
          </Button>
        </motion.div>

        <Card className="border-orange-100 shadow-xl">
          {/* Header com gradiente */}
          <CardHeader className="bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Área Administrativa
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Acesse o sistema com suas credenciais
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Alerta de erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    className={`pl-10 transition-all duration-200 ${
                      errors.email 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : watchedFields.email && !errors.email
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300"
                    }`}
                    {...register("email")}
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  {watchedFields.email && !errors.email && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </motion.div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 transition-all duration-200 ${
                      errors.password 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : watchedFields.password && !errors.password
                        ? "border-green-500 focus:border-green-500"
                        : "border-gray-300"
                    }`}
                    {...register("password")}
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  
                  {/* Botão mostrar/ocultar senha */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Lembrar-me e Esqueci senha */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-600">Lembrar-me</span>
                </label>
                <Link 
                  href="/auth/recuperar-senha"
                  className="text-orange-600 hover:text-orange-700 hover:underline transition"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de submit */}
              <Button
                type="submit"
                className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-6 text-lg mt-6 transition-all duration-200 disabled:opacity-50"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Autenticando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Entrar no Sistema
                  </span>
                )}
              </Button>

              {/* Informações adicionais */}
              <div className="text-center text-xs text-gray-500 mt-4">
                <p>Ao entrar, você concorda com nossos</p>
                <Link href="/termos" className="text-orange-600 hover:underline">
                  Termos de Uso
                </Link>
                {' e '}
                <Link href="/privacidade" className="text-orange-600 hover:underline">
                  Política de Privacidade
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-4">
          &copy; 2026 Pensador do Futuro. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}
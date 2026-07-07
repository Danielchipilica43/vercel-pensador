// app/auth/nova-senha/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const schema = z.object({
  novaSenha: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .regex(/[a-z]/, "Deve conter letra minúscula")
    .regex(/[0-9]/, "Deve conter número"),
  confirmarSenha: z.string().min(1, "Confirme sua senha"),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type FormData = z.infer<typeof schema>;

function NovaSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [tokenInvalido, setTokenInvalido] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      setTokenInvalido(true);
    }
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token inválido", {
        description: "Link de recuperação inválido. Solicite um novo.",
      });
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Redefinindo senha...");

    try {
      const res = await fetch("/api/auth/nova-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha: data.novaSenha }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao redefinir senha");
      }

      toast.success("Senha redefinida com sucesso!", { id: toastId });
      setSucesso(true);

      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao redefinir senha", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenInvalido) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle>Link inválido</CardTitle>
          <CardDescription>
            Este link de recuperação é inválido ou expirou.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Solicite um novo link de recuperação.
          </p>
          <Link href="/auth/recuperar-senha">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Solicitar novo link
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (sucesso) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Senha redefinida!</CardTitle>
          <CardDescription>
            Sua senha foi alterada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Você será redirecionado para a página de login.
          </p>
          <Link href="/auth/login">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Ir para o login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔐 Criar nova senha</CardTitle>
        <CardDescription>
          Digite sua nova senha abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="novaSenha">Nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="novaSenha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="••••••"
                className="pl-10 pr-10"
                {...register("novaSenha")}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.novaSenha && (
              <p className="text-red-500 text-sm">{errors.novaSenha.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Mínimo de 6 caracteres, com letra minúscula e número
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmarSenha"
                type={mostrarConfirmar ? "text" : "password"}
                placeholder="••••••"
                className="pl-10 pr-10"
                {...register("confirmarSenha")}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmarSenha && (
              <p className="text-red-500 text-sm">{errors.confirmarSenha.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 py-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Redefinindo...
              </>
            ) : (
              "Redefinir senha"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function NovaSenhaPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para login
            </Button>
          </Link>
        </div>
        <Suspense fallback={
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
              <p className="mt-4 text-gray-500">Carregando...</p>
            </CardContent>
          </Card>
        }>
          <NovaSenhaContent />
        </Suspense>
      </div>
    </div>
  );
}
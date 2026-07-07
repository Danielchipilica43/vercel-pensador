// app/auth/recuperar-senha/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido (ex: nome@dominio.com)"),
});

type FormData = z.infer<typeof schema>;

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const toastId = toast.loading("Enviando solicitação...");

    try {
      const res = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao processar");
      }

      toast.success(result.message || "Link enviado com sucesso!", { 
        id: toastId,
        duration: 5000,
      });
      
      setEmailEnviado(data.email);
      setEnviado(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar solicitação", { 
        id: toastId,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviar = () => {
    const email = getValues("email");
    if (email) {
      onSubmit({ email });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para login
            </Button>
          </Link>
        </div>

        <Card className="border-orange-100 shadow-lg">
          <CardHeader className="bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">🔐 Recuperar Senha</CardTitle>
            <CardDescription className="text-orange-100">
              Digite seu email para receber um link de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!enviado ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    E-mail cadastrado
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      className="pl-10 py-6"
                      {...register("email")}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enviaremos um link para redefinir sua senha
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Link de Recuperação"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-700 ml-2">
                    <span className="font-medium">Email enviado!</span>
                    <br />
                    Verifique sua caixa de entrada <strong>{emailEnviado}</strong> e siga as instruções.
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    📬 <strong>Não recebeu?</strong> Verifique a pasta de spam ou lixo eletrônico.
                  </p>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleReenviar}
                    disabled={isLoading}
                    className="text-orange-500 hover:text-orange-600 text-sm underline"
                  >
                    {isLoading ? "Enviando..." : "Reenviar email"}
                  </button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => router.push("/auth/login")}
                  className="w-full mt-2"
                >
                  Voltar para o login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informação adicional */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            O link de recuperação é válido por <strong>1 hora</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
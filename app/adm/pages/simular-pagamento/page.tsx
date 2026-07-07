// app/adm/pages/simular-pagamento/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function SimularPagamentoPage() {
  const [referencia, setReferencia] = useState("");
  const [processando, setProcessando] = useState(false);

  const handleSimular = async (aprovar: boolean) => {
    if (!referencia.trim()) {
      toast.error("Digite a referência do pagamento");
      return;
    }

    setProcessando(true);
    const toastId = toast.loading(
      aprovar ? "Simulando aprovação..." : "Simulando rejeição..."
    );

    try {
      const res = await fetch("/api/pagamento/comprovativo-simulado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          referencia, 
          simularAprovacao: aprovar 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro na simulação");
      }

      toast.success(data.message, { id: toastId });
      
      if (aprovar) {
        toast.success("Matrícula aprovada! Aluno criado com sucesso.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro na simulação", { id: toastId });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-500" />
            Simular Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-700">
              Esta ferramenta simula o processo de pagamento sem necessidade de integração real.
              Útil para testes e demonstração do sistema.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Referência do Pagamento</Label>
            <Input
              placeholder="Ex: IPP20240101123456"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Digite a referência gerada na página de matrícula
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => handleSimular(true)}
              disabled={processando || !referencia}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {processando ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Simular Aprovação
            </Button>
            <Button
              onClick={() => handleSimular(false)}
              disabled={processando || !referencia}
              variant="destructive"
              className="flex-1"
            >
              {processando ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Simular Rejeição
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Como simular um pagamento:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal pl-4">
              <li>Candidate faz uma matrícula</li>
              <li>Na página de pagamento, é gerada uma referência</li>
              <li>Copie a referência gerada</li>
              <li>Cole aqui e clique em Simular Aprovação</li>
              <li>O sistema processa como se o pagamento tivesse sido confirmado</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
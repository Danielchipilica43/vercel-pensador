// app/api/pagamento/comprovativo-simulado/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referencia, simularAprovacao } = body;

    if (!referencia) {
      return NextResponse.json(
        { error: "Referência é obrigatória" },
        { status: 400 }
      );
    }

    // Buscar pagamento
    const pagamento = await prisma.pagamento.findUnique({
      where: { referencia },
      include: { matriculas: true }
    });

    if (!pagamento) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar expiração
    if (new Date() > pagamento.dataExpiracao) {
      return NextResponse.json(
        { error: "Pagamento expirado" },
        { status: 400 }
      );
    }

    // Simular envio de comprovativo
    const comprovativoSimulado = `/uploads/comprovantes/simulado_${referencia}.png`;

    // Atualizar status baseado na simulação
    const novoStatus = simularAprovacao ? "APROVADO" : "REJEITADO";
    const statusRecord = await prisma.statusPagamento.findFirst({
      where: { nome: novoStatus }
    });

    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: {
        comprovativoUrl: comprovativoSimulado,
        statusId: statusRecord?.id,
        dataPagamento: new Date(),
        observacao: simularAprovacao ? null : "Comprovativo não confiável (simulação)"
      }
    });

    // Se aprovado, atualizar matrícula para ATIVA
    if (simularAprovacao && pagamento.matriculas[0]) {
      const statusAtiva = await prisma.statusMatricula.findFirst({
        where: { nome: "ATIVA" }
      });
      
      if (statusAtiva) {
        await prisma.matricula.update({
          where: { id: pagamento.matriculas[0].id },
          data: { statusId: statusAtiva.id }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: simularAprovacao 
        ? "Pagamento simulado e aprovado com sucesso!"
        : "Pagamento simulado e rejeitado",
      status: novoStatus
    });
  } catch (error) {
    console.error("Erro na simulação:", error);
    return NextResponse.json(
      { error: "Erro na simulação" },
      { status: 500 }
    );
  }
}
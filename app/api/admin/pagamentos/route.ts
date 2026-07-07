// app/api/admin/pagamentos/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { valor, formaPagamento } = body;

    if (!valor || !formaPagamento) {
      return NextResponse.json(
        { error: "Valor e forma de pagamento são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar status PENDENTE
    const statusPendente = await prisma.statusPagamento.findFirst({
      where: { nome: "PENDENTE" }
    });

    if (!statusPendente) {
      return NextResponse.json(
        { error: "Status de pagamento não configurado" },
        { status: 500 }
      );
    }

    // Gerar referência única
    const referencia = `PAG_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Criar pagamento
    const pagamento = await prisma.pagamento.create({
      data: {
        valor: parseFloat(valor),
        formaPagamento,
        statusId: statusPendente.id,
        referencia,
        dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      },
    });

    return NextResponse.json(pagamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento" },
      { status: 500 }
    );
  }
}

// GET para listar pagamentos
export async function GET() {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      include: {
        status: true
      },
      orderBy: { valor: "asc" }
    });
    return NextResponse.json(pagamentos);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
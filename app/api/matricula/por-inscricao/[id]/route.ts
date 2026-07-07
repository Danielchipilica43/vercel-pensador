// app/api/matricula/por-inscricao/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inscricaoId = Number(id);

    if (isNaN(inscricaoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const matricula = await prisma.matricula.findUnique({
      where: { inscricaoId },
      include: {
        status: true,
        pagamento: {
          include: {
            status: true,
          },
        },
      },
    });

    if (!matricula) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json({
      id: matricula.id,
      status: matricula.status?.nome,
      birthDate: matricula.birthDate,
      createdAt: matricula.createdAt,
      pagamento: matricula.pagamento ? {
        id: matricula.pagamento.id,
        referencia: matricula.pagamento.referencia,
        valor: matricula.pagamento.valor,
        formaPagamento: matricula.pagamento.formaPagamento,
        status: matricula.pagamento.status?.nome,
        dataExpiracao: matricula.pagamento.dataExpiracao,
        dataPagamento: matricula.pagamento.dataPagamento,
        comprovativoUrl: matricula.pagamento.comprovativoUrl,
      } : null,
    });
  } catch (error) {
    console.error("Erro ao buscar matrícula:", error);
    return NextResponse.json(
      { error: "Erro ao buscar matrícula" },
      { status: 500 }
    );
  }
}
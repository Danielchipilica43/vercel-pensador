// app/api/status/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // 'id' aqui representa o BI

    const inscricao = await prisma.inscricao.findUnique({
      where: { bi: id },
      include: {
        matricula: {
          include: {
            periodo: true,
            status: true,
            pagamento: {
              include: { status: true },
            },
          },
        },
        curso: true,
        classe: true,
        genero: true,
        status: true,
      },
    });

    if (!inscricao) {
      return NextResponse.json(
        { error: "Inscrição não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(inscricao);
  } catch (error) {
    console.error("Erro na rota /api/status/[id]:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
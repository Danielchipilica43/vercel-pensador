// app/api/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bi = searchParams.get("bi");

  if (!bi) {
    return NextResponse.json({ error: "BI não informado" }, { status: 400 });
  }

  try {
    const inscricao = await prisma.inscricao.findUnique({
      where: { bi },
      include: {
        curso: true,
        classe: true,
        genero: true,
        status: true,
        matricula: {
          include: {
            periodo: true,
            status: true,
            pagamento: {
              include: { status: true },
            },
          },
        },
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
    console.error("Erro na rota /api/status:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
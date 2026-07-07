import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Aguarda os parâmetros da URL

    const inscricao = await prisma.inscricao.findUnique({
      where: { bi: id }, // Usa 'id' (do [id]) para buscar pelo 'bi' na DB
    });

    if (!inscricao) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 });
    }

    return NextResponse.json(inscricao);
  } catch (error) {
    console.error("Erro na rota /api/status/[id]:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
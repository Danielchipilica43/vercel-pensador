// app/api/ficha-inscricao/[id]/route.ts
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

    const inscricao = await prisma.inscricao.findUnique({
      where: { id: inscricaoId },
      include: {
        curso: {
          select: { nome: true, duracao: true }
        },
        classe: {
          select: { nome: true }
        },
        genero: {
          select: { nome: true }
        },
        status: {
          select: { nome: true }
        }
      }
    });

    if (!inscricao) {
      return NextResponse.json(
        { error: "Inscrição não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(inscricao);
  } catch (error) {
    console.error("Erro ao buscar ficha:", error);
    return NextResponse.json(
      { error: "Erro ao gerar ficha" },
      { status: 500 }
    );
  }
}
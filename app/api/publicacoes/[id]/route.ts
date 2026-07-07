// app/api/publicacoes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicacaoId = parseInt(id);

    if (isNaN(publicacaoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Incrementar visualizações
    await prisma.publicacao.update({
      where: { id: publicacaoId },
      data: { visualizacoes: { increment: 1 } }
    });

    const publicacao = await prisma.publicacao.findUnique({
      where: { id: publicacaoId }
    });

    if (!publicacao) {
      return NextResponse.json(
        { error: "Publicação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(publicacao);
  } catch (error) {
    console.error("Erro ao buscar publicação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar publicação" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { titulo, conteudo, resumo, imagemUrl, autor, categoria, destaque, publicado } = body;

    const publicacaoId = parseInt(id);
    if (isNaN(publicacaoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const publicacao = await prisma.publicacao.update({
      where: { id: publicacaoId },
      data: {
        titulo,
        conteudo,
        resumo,
        imagemUrl,
        autor,
        categoria,
        destaque,
        publicado,
      },
    });

    return NextResponse.json(publicacao);
  } catch (error) {
    console.error("Erro ao atualizar publicação:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar publicação" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publicacaoId = parseInt(id);

    if (isNaN(publicacaoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    await prisma.publicacao.delete({
      where: { id: publicacaoId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar publicação:", error);
    return NextResponse.json(
      { error: "Erro ao deletar publicação" },
      { status: 500 }
    );
  }
}
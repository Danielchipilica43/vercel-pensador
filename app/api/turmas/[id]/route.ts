// app/api/turmas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, descricao, cursoId, anoLetivo, turnoId, vagasTotais } = body;

    const turmaId = parseInt(id);
    if (isNaN(turmaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const turma = await prisma.turma.update({
      where: { id: turmaId },
      data: {
        nome: nome,
        descricao: descricao,
        cursoId: cursoId ? parseInt(cursoId) : undefined,
        anoLetivo: anoLetivo,
        turnoId: turnoId ? parseInt(turnoId) : undefined,
        vagasTotais: vagasTotais ? parseInt(vagasTotais) : undefined,
      }
    });

    return NextResponse.json(turma);
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar turma" },
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
    const turmaId = parseInt(id);

    if (isNaN(turmaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se há alunos na turma
    const alunos = await prisma.aluno.findMany({
      where: { turmaId },
      take: 1
    });

    if (alunos.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir turma com alunos matriculados" },
        { status: 400 }
      );
    }

    await prisma.turma.delete({
      where: { id: turmaId }
    });

    return NextResponse.json({ success: true, message: "Turma removida" });
  } catch (error) {
    console.error("Erro ao remover turma:", error);
    return NextResponse.json(
      { error: "Erro ao remover turma" },
      { status: 500 }
    );
  }
}
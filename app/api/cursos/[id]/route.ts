// app/api/cursos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Buscar um curso específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cursoId = parseInt(id);

    if (isNaN(cursoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        turmas: true,
        _count: {
          select: {
            inscricoes: true,
            turmas: true
          }
        }
      }
    });

    if (!curso) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(curso);
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    return NextResponse.json(
      { error: "Erro ao buscar curso" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar um curso
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, duracao, descricao, vagas, ativo } = body;

    const cursoId = parseInt(id);
    if (isNaN(cursoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // 🔥 Preparar dados com conversões seguras
    const data: any = {};
    
    if (nome !== undefined) {
      data.nome = nome.toUpperCase();
    }
    
    if (duracao !== undefined) {
      const duracaoInt = parseInt(duracao);
      if (isNaN(duracaoInt) || duracaoInt <= 0) {
        return NextResponse.json(
          { error: "Duração deve ser um número válido maior que zero" },
          { status: 400 }
        );
      }
      data.duracao = duracaoInt;
    }
    
    if (descricao !== undefined) {
      data.descricao = descricao;
    }
    
    if (vagas !== undefined) {
      const vagasInt = parseInt(vagas);
      if (isNaN(vagasInt) || vagasInt <= 0) {
        return NextResponse.json(
          { error: "Vagas deve ser um número válido maior que zero" },
          { status: 400 }
        );
      }
      data.vagas = vagasInt;
    }
    
    if (ativo !== undefined) {
      data.ativo = ativo;
    }

    // Verificar se o curso existe
    const cursoExistente = await prisma.curso.findUnique({
      where: { id: cursoId }
    });

    if (!cursoExistente) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    const curso = await prisma.curso.update({
      where: { id: cursoId },
      data,
      include: {
        turmas: true,
        _count: {
          select: {
            inscricoes: true,
            turmas: true
          }
        }
      }
    });

    return NextResponse.json(curso);
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar curso" },
      { status: 500 }
    );
  }
}

// DELETE - Remover um curso
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cursoId = parseInt(id);

    if (isNaN(cursoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se o curso existe
    const cursoExistente = await prisma.curso.findUnique({
      where: { id: cursoId }
    });

    if (!cursoExistente) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se há turmas associadas
    const turmas = await prisma.turma.findMany({
      where: { cursoId },
      take: 1
    });

    if (turmas.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir curso com turmas associadas" },
        { status: 400 }
      );
    }

    await prisma.curso.delete({
      where: { id: cursoId }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Curso removido com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao remover curso:", error);
    return NextResponse.json(
      { error: "Erro ao remover curso" },
      { status: 500 }
    );
  }
}
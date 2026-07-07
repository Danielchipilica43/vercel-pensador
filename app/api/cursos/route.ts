// app/api/cursos/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        turmas:true,
        _count: {
          select: {
            inscricoes: true,
            turmas: true
          }
        }
      },
      orderBy: { nome: "asc" }
    });

    return NextResponse.json(cursos);
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, duracao, descricao, vagas, ativo } = body;

    if (!nome || !duracao) {
      return NextResponse.json(
        { error: "Nome e duração são obrigatórios" },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.create({
      data: {
        nome: nome.toUpperCase(),
        duracao: parseInt(duracao),
        descricao: descricao || null,
        vagas: vagas || 40,
        ativo: ativo !== undefined ? ativo : true,
      }
    });

    return NextResponse.json(curso, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    return NextResponse.json(
      { error: "Erro ao criar curso" },
      { status: 500 }
    );
  }
}
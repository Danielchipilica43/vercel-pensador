// app/api/turmas/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        curso: {
          select: { nome: true }
        },
        turno: {
          select: { nome: true }
        },
        _count: {
          select: { alunos: true }
        }
      },
      orderBy: [
        { anoLetivo: "desc" },
        { curso: { nome: "asc" } },
        { turno: { nome: "asc" } }
      ]
    });

    return NextResponse.json(turmas);
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, descricao, cursoId, anoLetivo, turnoId, vagasTotais } = body;

    if (!nome || !cursoId || !anoLetivo || !turnoId) {
      return NextResponse.json(
        { error: "Nome, curso, ano letivo e turno são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe turma com mesmo nome e ano
    const existing = await prisma.turma.findFirst({
      where: {
        nome,
        anoLetivo
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma turma com este nome no ano letivo" },
        { status: 409 }
      );
    }

    const turma = await prisma.turma.create({
      data: {
        nome,
        descricao: descricao || null,
        cursoId: parseInt(cursoId),
        anoLetivo,
        turnoId: parseInt(turnoId),
        vagasTotais: vagasTotais || 30,
        vagasDisponiveis: vagasTotais || 30,
      },
      include: {
        curso: true,
        turno: true
      }
    });

    return NextResponse.json(turma, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return NextResponse.json(
      { error: "Erro ao criar turma" },
      { status: 500 }
    );
  }
}
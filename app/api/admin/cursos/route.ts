// app/api/cursos/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        duracao: true,
        descricao: true,
        vagas: true,
        ativo: true,
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
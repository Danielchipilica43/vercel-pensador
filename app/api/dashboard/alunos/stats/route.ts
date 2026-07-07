import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: {
        matricula: {
          include: {
            inscricao: {
              include: { curso: true }
            }
          }
        }
      }
    });

    const total = alunos.length;
    const porCurso: Record<string, number> = {};

    alunos.forEach(aluno => {
      const curso = aluno.matricula?.inscricao?.curso?.nome;
      if (curso) {
        porCurso[curso] = (porCurso[curso] || 0) + 1;
      }
    });

    return NextResponse.json({ total, porCurso });
  } catch (error) {
    return NextResponse.json({ total: 0, porCurso: {} });
  }
}
// app/api/listarMatriculados/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ NEXT 16: params é Promise
    const { id } = await context.params;

    const matriculaId = Number(id);

    if (isNaN(matriculaId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const matricula = await prisma.matricula.findUnique({
      where: { id: matriculaId },
      include: {
        inscricao: {  // ✅ minúsculo - igual ao schema
          include: {
            curso: true,
            classe: true,
            genero: true,
            status: true,
          }
        },
        status: true,      // ✅ minúsculo
        periodo: true,     // ✅ minúsculo
        pagamento: {
          include: {
            status: true
          }
        },
        aluno: {
          include: {
            turma: {
              include: {
                curso: true,
                turno: true
              }
            }
          }
        }
      },
    });

    if (!matricula) {
      return NextResponse.json(
        { error: "Matrícula não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(matricula);
  } catch (error) {
    console.error("Erro ao buscar matrícula:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
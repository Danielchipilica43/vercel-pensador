// app/api/alunos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, turmaId } = body;

    const alunoId = Number(id);
    if (isNaN(alunoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Buscar aluno existente
    const alunoExistente = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: {
        matricula: true
      }
    });

    if (!alunoExistente) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar dados
    const updates: any = {};

    // Atualizar turma se fornecida
    if (turmaId) {
      const turma = await prisma.turma.findUnique({
        where: { id: parseInt(turmaId) }
      });

      if (!turma) {
        return NextResponse.json(
          { error: "Turma não encontrada" },
          { status: 404 }
        );
      }

      updates.turmaId = parseInt(turmaId);
    }

    // Atualizar aluno
    const alunoAtualizado = await prisma.aluno.update({
      where: { id: alunoId },
      data: updates,
      include: {
        turma: {
          include: {
            curso: true,
            turno: true
          }
        },
        matricula: {
          include: {
            inscricao: true,
            status: true
          }
        }
      }
    });

    // Atualizar status da matrícula se fornecido
    if (status) {
      const statusMatricula = await prisma.statusMatricula.findFirst({
        where: { nome: status }
      });

      if (statusMatricula && alunoAtualizado.matricula) {
        await prisma.matricula.update({
          where: { id: alunoAtualizado.matricula.id },
          data: { statusId: statusMatricula.id }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Aluno atualizado com sucesso!",
      aluno: {
        id: alunoAtualizado.id,
        turma: alunoAtualizado.turma?.nome,
        status: status
      }
    });

  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar requisição" },
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
    const alunoId = Number(id);

    if (isNaN(alunoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Buscar aluno
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: {
        matricula: true,
        turma: true
      }
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    // Se tiver matrícula, atualizar status para CANCELADA
    if (aluno.matricula) {
      const statusCancelada = await prisma.statusMatricula.findFirst({
        where: { nome: "CANCELADA" }
      });

      if (statusCancelada) {
        await prisma.matricula.update({
          where: { id: aluno.matricula.id },
          data: { statusId: statusCancelada.id }
        });
      }
    }

    // Se tiver turma, liberar vaga
    if (aluno.turma) {
      await prisma.turma.update({
        where: { id: aluno.turma.id },
        data: {
          vagasDisponiveis: aluno.turma.vagasDisponiveis + 1
        }
      });
    }

    // Excluir aluno
    await prisma.aluno.delete({
      where: { id: alunoId }
    });

    return NextResponse.json({
      success: true,
      message: "Aluno excluído com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar requisição" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alunoId = Number(id);

    if (isNaN(alunoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: {
        matricula: {
          include: {
            inscricao: {
              include: {
                curso: true,
                classe: true,
                genero: true,
                status: true
              }
            },
            status: true,
            periodo: true,
            pagamento: {
              include: {
                status: true
              }
            }
          }
        },
        turma: {
          include: {
            curso: true,
            turno: true
          }
        },
        user: true
      }
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    const alunoFormatado = {
      id: aluno.id,
      matriculaId: aluno.matriculaId,
      turmaId: aluno.turmaId,
      userId: aluno.userId,
      createdAt: aluno.createdAt,
      updatedAt: aluno.updatedAt,
      matricula: aluno.matricula ? {
        id: aluno.matricula.id,
        status: aluno.matricula.status?.nome,
        birthDate: aluno.matricula.birthDate,
        photoUrl: aluno.matricula.photoUrl,
        certificateUrl: aluno.matricula.certificateUrl,
        medicalCertificateUrl: aluno.matricula.medicalCertificateUrl,
        periodo: aluno.matricula.periodo?.nome,
        pagamento: aluno.matricula.pagamento ? {
          valor: aluno.matricula.pagamento.valor,
          forma: aluno.matricula.pagamento.formaPagamento,
          status: aluno.matricula.pagamento.status?.nome
        } : null
      } : null,
      turma: aluno.turma ? {
        id: aluno.turma.id,
        nome: aluno.turma.nome,
        curso: aluno.turma.curso?.nome,
        turno: aluno.turma.turno?.nome,
        anoLetivo: aluno.turma.anoLetivo,
        vagasTotais: aluno.turma.vagasTotais,
        vagasDisponiveis: aluno.turma.vagasDisponiveis
      } : null,
      inscricao: aluno.matricula?.inscricao ? {
        bi: aluno.matricula.inscricao.bi,
        nome: aluno.matricula.inscricao.nome,
        telefone: aluno.matricula.inscricao.telefone,
        email: aluno.matricula.inscricao.email,
        endereco: aluno.matricula.inscricao.endereco,
        dataNascimento: aluno.matricula.inscricao.dataNascimento,
        curso: aluno.matricula.inscricao.curso?.nome,
        classe: aluno.matricula.inscricao.classe?.nome,
        genero: aluno.matricula.inscricao.genero?.nome,
        statusInscricao: aluno.matricula.inscricao.status?.nome
      } : null,
      user: aluno.user ? {
        id: aluno.user.id,
        nome: aluno.user.nome,
        email: aluno.user.email
      } : null
    };

    return NextResponse.json(alunoFormatado);
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    return NextResponse.json(
      { error: "Erro ao buscar aluno" },
      { status: 500 }
    );
  }
}
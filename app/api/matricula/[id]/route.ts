// app/api/matricula/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { acao, observacao } = body;

    // Validar ação
    if (!acao || !["APROVAR", "REJEITAR"].includes(acao)) {
      return NextResponse.json(
        { error: "Ação inválida. Use APROVAR ou REJEITAR" },
        { status: 400 }
      );
    }

    const matriculaId = Number(id);
    if (isNaN(matriculaId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Buscar matrícula com todos os dados necessários
    const matricula = await prisma.matricula.findUnique({
      where: { id: matriculaId },
      include: {
        inscricao: {
          include: {
            curso: true,
            classe: true,
            genero: true,
            status: true,
          },
        },
        status: true,
        periodo: true,
        pagamento: {
          include: {
            status: true,
          },
        },
        aluno: true,
      },
    });

    if (!matricula) {
      return NextResponse.json(
        { error: "Matrícula não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se já tem aluno
    if (matricula.aluno && acao === "APROVAR") {
      return NextResponse.json(
        { error: "Esta matrícula já possui um aluno associado" },
        { status: 409 }
      );
    }

    // ============================================
    // PROCESSAR APROVAÇÃO
    // ============================================
    if (acao === "APROVAR") {
      // 1. Buscar status ATIVA
      const statusAtiva = await prisma.statusMatricula.findFirst({
        where: { nome: "ATIVA" },
      });

      if (!statusAtiva) {
        return NextResponse.json(
          { error: "Status ATIVA não configurado" },
          { status: 500 }
        );
      }

      // 2. Buscar uma turma disponível para o curso
      const turma = await prisma.turma.findFirst({
        where: {
          cursoId: matricula.inscricao.cursoId,
          vagasDisponiveis: { gt: 0 },
          anoLetivo: new Date().getFullYear().toString(),
        },
        orderBy: { vagasDisponiveis: "desc" },
      });

      if (!turma) {
        return NextResponse.json(
          { error: "Nenhuma turma disponível para este curso" },
          { status: 400 }
        );
      }

      // 3. Atualizar status da matrícula para ATIVA
      const matriculaAtualizada = await prisma.matricula.update({
        where: { id: matriculaId },
        data: { statusId: statusAtiva.id },
        include: {
          inscricao: {
            include: {
              curso: true,
            },
          },
          status: true,
        },
      });

      // 4. Criar o aluno
      const aluno = await prisma.aluno.create({
        data: {
          matriculaId: matriculaId,
          turmaId: turma.id,
          userId: null,
        },
        include: {
          turma: {
            include: {
              curso: true,
              turno: true,
            },
          },
        },
      });

      // 5. Atualizar vagas disponíveis da turma
      await prisma.turma.update({
        where: { id: turma.id },
        data: { vagasDisponiveis: turma.vagasDisponiveis - 1 },
      });

      // 6. Atualizar status do pagamento para APROVADO
      if (matricula.pagamento) {
        const statusAprovado = await prisma.statusPagamento.findFirst({
          where: { nome: "APROVADO" },
        });

        if (statusAprovado) {
          await prisma.pagamento.update({
            where: { id: matricula.pagamento.id },
            data: {
              statusId: statusAprovado.id,
              dataPagamento: new Date(),
            },
          });
        }
      }

      // 7. Preparar dados para notificação por email
      // 8. Enviar email de confirmação (não bloqueante)

      // 9. Retornar resposta
      return NextResponse.json({
        success: true,
        message: `Matrícula aprovada! Aluno criado na turma ${turma.nome}`,
        aluno: {
          id: aluno.id,
          turma: aluno.turma.nome,
          curso: aluno.turma.curso.nome,
          turno: aluno.turma.turno.nome,
        },
        matricula: {
          id: matriculaAtualizada.id,
          status: "ATIVA",
        },
      });
    }

    // ============================================
    // PROCESSAR REJEIÇÃO
    // ============================================
    if (acao === "REJEITAR") {
      // 1. Buscar status CANCELADA
      const statusCancelada = await prisma.statusMatricula.findFirst({
        where: { nome: "CANCELADA" },
      });

      if (!statusCancelada) {
        return NextResponse.json(
          { error: "Status CANCELADA não configurado" },
          { status: 500 }
        );
      }

      // 2. Atualizar matrícula para CANCELADA
      const matriculaAtualizada = await prisma.matricula.update({
        where: { id: matriculaId },
        data: { statusId: statusCancelada.id },
        include: {
          inscricao: {
            include: {
              curso: true,
            },
          },
          status: true,
        },
      });

      // 3. Atualizar status do pagamento para REJEITADO
      if (matricula.pagamento) {
        const statusRejeitado = await prisma.statusPagamento.findFirst({
          where: { nome: "REJEITADO" },
        });

        if (statusRejeitado) {
          await prisma.pagamento.update({
            where: { id: matricula.pagamento.id },
            data: {
              statusId: statusRejeitado.id,
              observacao: observacao || "Matrícula rejeitada",
            },
          });
        }
      }


      // 5. Enviar email de rejeição (não bloqueante

      // 6. Retornar resposta
      return NextResponse.json({
        success: true,
        message: "Matrícula rejeitada com sucesso!",
        matricula: {
          id: matriculaAtualizada.id,
          status: "CANCELADA",
        },
      });
    }

    return NextResponse.json(
      { error: "Ação inválida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao processar matrícula:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar requisição" },
      { status: 500 }
    );
  }
}

// GET para buscar uma matrícula específica
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        inscricao: {
          include: {
            curso: true,
            classe: true,
            genero: true,
            status: true,
          },
        },
        status: true,
        periodo: true,
        pagamento: {
          include: {
            status: true,
          },
        },
        aluno: {
          include: {
            turma: {
              include: {
                curso: true,
                turno: true,
              },
            },
          },
        },
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
      { error: "Erro ao buscar matrícula" },
      { status: 500 }
    );
  }
}
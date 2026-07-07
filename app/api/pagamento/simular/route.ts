// app/api/pagamento/simular/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referencia, acao, observacao } = body; // acao = "APROVAR" ou "REJEITAR"

    if (!referencia || !acao) {
      return NextResponse.json(
        { error: "Referência e ação são obrigatórias" },
        { status: 400 }
      );
    }

    if (!["APROVAR", "REJEITAR"].includes(acao)) {
      return NextResponse.json(
        { error: "Ação inválida. Use APROVAR ou REJEITAR" },
        { status: 400 }
      );
    }

    // Buscar pagamento
    const pagamento = await prisma.pagamento.findUnique({
      where: { referencia },
      include: { 
        matriculas: {
          include: {
            inscricao: {
              include: { curso: true }
            }
          }
        }
      }
    });

    if (!pagamento) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar expiração
    if (new Date() > pagamento.dataExpiracao) {
      return NextResponse.json(
        { error: "Pagamento expirado" },
        { status: 400 }
      );
    }

    // Verificar se já foi processado
    const statusAtual = await prisma.statusPagamento.findUnique({
      where: { id: pagamento.statusId }
    });

    if (statusAtual?.nome === "APROVADO") {
      return NextResponse.json(
        { error: "Pagamento já foi aprovado anteriormente" },
        { status: 400 }
      );
    }

    // Buscar o novo status
    const novoStatusNome = acao === "APROVAR" ? "APROVADO" : "REJEITADO";
    const novoStatus = await prisma.statusPagamento.findFirst({
      where: { nome: novoStatusNome }
    });

    if (!novoStatus) {
      return NextResponse.json(
        { error: "Status não encontrado" },
        { status: 500 }
      );
    }

    // Atualizar pagamento
    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: {
        statusId: novoStatus.id,
        dataPagamento: new Date(),
        observacao: observacao || null,
      }
    });

    let alunoCriado = null;
    let matriculaAtualizada = null;

    // Se aprovado, atualizar matrícula e criar aluno
    if (acao === "APROVAR" && pagamento.matriculas[0]) {
      const matricula = pagamento.matriculas[0];
      
      // Buscar status ATIVA
      const statusAtiva = await prisma.statusMatricula.findFirst({
        where: { nome: "ATIVA" }
      });

      if (statusAtiva) {
        matriculaAtualizada = await prisma.matricula.update({
          where: { id: matricula.id },
          data: { statusId: statusAtiva.id }
        });
      }

      // Buscar turma disponível
      const turma = await prisma.turma.findFirst({
        where: {
          cursoId: matricula.inscricao.cursoId,
          vagasDisponiveis: { gt: 0 }
        }
      });

      if (turma) {
        alunoCriado = await prisma.aluno.create({
          data: {
            matriculaId: matricula.id,
            turmaId: turma.id,
          },
          include: {
            turma: {
              include: {
                curso: true,
                turno: true
              }
            }
          }
        });

        // Atualizar vagas da turma
        await prisma.turma.update({
          where: { id: turma.id },
          data: { vagasDisponiveis: turma.vagasDisponiveis - 1 }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: acao === "APROVAR" 
        ? "Pagamento aprovado! Matrícula ativada e aluno criado com sucesso."
        : "Pagamento rejeitado.",
      pagamento: {
        id: pagamento.id,
        referencia: pagamento.referencia,
        status: novoStatusNome,
      },
      aluno: alunoCriado ? {
        id: alunoCriado.id,
        turma: alunoCriado.turma.nome,
        curso: alunoCriado.turma.curso.nome,
        turno: alunoCriado.turma.turno.nome,
      } : null,
      matricula: matriculaAtualizada ? {
        id: matriculaAtualizada.id,
        status: "ATIVA",
      } : null,
    });
  } catch (error) {
    console.error("Erro na simulação:", error);
    return NextResponse.json(
      { error: "Erro ao processar simulação" },
      { status: 500 }
    );
  }
}

// GET para listar pagamentos pendentes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "AGUARDANDO_COMPROVATIVO";

    const statusRecord = await prisma.statusPagamento.findFirst({
      where: { nome: status }
    });

    if (!statusRecord) {
      return NextResponse.json([], { status: 200 });
    }

    const pagamentos = await prisma.pagamento.findMany({
      where: { statusId: statusRecord.id },
      include: {
        matriculas: {
          include: {
            inscricao: {
              include: {
                curso: true,
                classe: true,
              }
            }
          }
        },
        status: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(pagamentos);
  } catch (error) {
    console.error("Erro ao listar pagamentos:", error);
    return NextResponse.json([], { status: 200 });
  }
}
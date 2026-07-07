// app/api/relatorios/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const cursoFiltro = searchParams.get("curso");
    const statusFiltro = searchParams.get("status");

    // Construir filtros de data
    const whereDate: any = {};
    if (dataInicio) {
      whereDate.gte = new Date(dataInicio);
    }
    if (dataFim) {
      whereDate.lte = new Date(dataFim);
    }

    const whereInscricao: any = {};
    const whereMatricula: any = {};
    const whereAluno: any = {};

    if (Object.keys(whereDate).length > 0) {
      whereInscricao.createdAt = whereDate;
      whereMatricula.createdAt = whereDate;
      whereAluno.createdAt = whereDate;
    }

    if (cursoFiltro && cursoFiltro !== "todos") {
      whereInscricao.curso = { nome: cursoFiltro };
      whereMatricula.inscricao = { curso: { nome: cursoFiltro } };
    }

    if (statusFiltro && statusFiltro !== "todos") {
      whereInscricao.status = { nome: statusFiltro };
      whereMatricula.status = { nome: statusFiltro };
    }

    // Buscar dados em paralelo
    const [
      inscricoes,
      matriculas,
      alunos,
      cursos,
      turmas,
      ultimosAlunos,
    ] = await Promise.all([
      prisma.inscricao.findMany({
        where: whereInscricao,
        include: { curso: true, status: true },
      }),
      prisma.matricula.findMany({
        where: whereMatricula,
        include: { inscricao: { include: { curso: true } }, status: true },
      }),
      prisma.aluno.findMany({
        where: whereAluno,
        include: { 
          matricula: { 
            include: { 
              inscricao: { include: { curso: true } },
              status: true
            } 
          }, 
          turma: true 
        },
      }),
      prisma.curso.findMany(),
      prisma.turma.findMany({ 
        include: { 
          _count: { select: { alunos: true } },
          curso: true,
          turno: true
        } 
      }),
      prisma.aluno.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          matricula: {
            include: {
              inscricao: { include: { curso: true } },
              status: true,
            },
          },
        },
      }),
    ]);

    // Processar dados de inscrições por mês manualmente
    const inscricoesPorMes: { mes: string; total: number }[] = [];
    const matriculasPorMes: { mes: string; total: number }[] = [];
    const pagamentosPorMes: { mes: string; total: number }[] = [];

    // Agrupar inscrições por mês
    inscricoes.forEach(inscricao => {
      const mes = inscricao.createdAt.toLocaleDateString('pt-PT', { month: 'short' });
      const existing = inscricoesPorMes.find(i => i.mes === mes);
      if (existing) {
        existing.total++;
      } else {
        inscricoesPorMes.push({ mes, total: 1 });
      }
    });

    // Agrupar matrículas por mês
    matriculas.forEach(matricula => {
      const mes = matricula.createdAt.toLocaleDateString('pt-PT', { month: 'short' });
      const existing = matriculasPorMes.find(m => m.mes === mes);
      if (existing) {
        existing.total++;
      } else {
        matriculasPorMes.push({ mes, total: 1 });
      }
    });

    // Ordenar por mês
    const mesesOrdem = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    inscricoesPorMes.sort((a, b) => mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes));
    matriculasPorMes.sort((a, b) => mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes));

    // Processar pagamentos por mês (buscar do banco de forma segura)
    const pagamentos = await prisma.pagamento.findMany({
      where: {
        status: {
          nome: "APROVADO"
        },
        ...(Object.keys(whereDate).length > 0 && { createdAt: whereDate })
      },
      select: {
        valor: true,
        createdAt: true,
      }
    });

    pagamentos.forEach(pagamento => {
      const mes = pagamento.createdAt.toLocaleDateString('pt-PT', { month: 'short' });
      const existing = pagamentosPorMes.find(p => p.mes === mes);
      if (existing) {
        existing.total += pagamento.valor;
      } else {
        pagamentosPorMes.push({ mes, total: pagamento.valor });
      }
    });
    pagamentosPorMes.sort((a, b) => mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes));

    // Processar dados para os gráficos
    const alunosPorCurso = cursos.map(curso => ({
      curso: curso.nome,
      quantidade: alunos.filter(a => a.matricula?.inscricao?.curso?.nome === curso.nome).length,
    }));

    const alunosPorTurma = turmas.map(turma => ({
      turma: turma.nome,
      quantidade: turma._count.alunos,
    }));

    const inscricoesPorStatus = [
      { status: "PENDENTE", quantidade: inscricoes.filter(i => i.status?.nome === "PENDENTE").length },
      { status: "APROVADA", quantidade: inscricoes.filter(i => i.status?.nome === "APROVADA").length },
      { status: "REJEITADA", quantidade: inscricoes.filter(i => i.status?.nome === "REJEITADA").length },
    ];

    const matriculasPorStatus = [
      { status: "ATIVA", quantidade: matriculas.filter(m => m.status?.nome === "ATIVA").length },
      { status: "CONCLUIDA", quantidade: matriculas.filter(m => m.status?.nome === "CONCLUIDA").length },
      { status: "CANCELADA", quantidade: matriculas.filter(m => m.status?.nome === "CANCELADA").length },
    ];

    const desempenhoCursos = cursos.map(curso => {
      const inscritos = inscricoes.filter(i => i.curso?.nome === curso.nome).length;
      const matriculados = matriculas.filter(m => m.inscricao?.curso?.nome === curso.nome).length;
      const taxa = inscritos > 0 ? Math.round((matriculados / inscritos) * 100) : 0;
      return { curso: curso.nome, inscritos, matriculados, taxa };
    });

    const ultimosAlunosFormatados = ultimosAlunos.map(aluno => ({
      id: aluno.id,
      nome: aluno.matricula?.inscricao?.nome || "-",
      curso: aluno.matricula?.inscricao?.curso?.nome || "-",
      dataMatricula: new Date(aluno.createdAt).toLocaleDateString(),
      status: aluno.matricula?.status?.nome || "-",
    }));

    const totalInscricoes = inscricoes.length;
    const totalMatriculas = matriculas.length;
    const totalAlunos = alunos.length;
    const totalCursos = cursos.length;
    const totalTurmas = turmas.length;
    const taxaAprovacao = totalInscricoes > 0 
      ? Math.round((inscricoes.filter(i => i.status?.nome === "APROVADA").length / totalInscricoes) * 100) 
      : 0;
    const mediaAlunosPorTurma = totalTurmas > 0 ? Math.round(totalAlunos / totalTurmas) : 0;

    return NextResponse.json({
      alunosPorCurso,
      alunosPorTurma,
      inscricoesPorStatus,
      matriculasPorStatus,
      inscricoesPorMes,
      matriculasPorMes,
      pagamentosPorMes,
      desempenhoCursos,
      ultimosAlunos: ultimosAlunosFormatados,
      resumo: {
        totalInscricoes,
        totalMatriculas,
        totalAlunos,
        totalCursos,
        totalTurmas,
        taxaAprovacao,
        mediaAlunosPorTurma,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
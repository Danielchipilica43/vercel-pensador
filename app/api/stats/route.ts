// app/api/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Buscar contagens em paralelo para melhor performance
    const [totalInscricoes, totalMatriculas, totalAlunos, totalCursos] = await Promise.all([
      prisma.inscricao.count(),
      prisma.matricula.count(),
      prisma.aluno.count(),
      prisma.curso.count({ where: { ativo: true } })
    ]);

    // Buscar inscrições por curso (para os gráficos)
    const inscricoesPorCurso = await prisma.inscricao.groupBy({
      by: ['cursoId'],
      _count: {
        id: true
      }
    });

    // Buscar matrículas ativas
    const statusMatriculaAtiva = await prisma.statusMatricula.findFirst({
      where: { nome: "ATIVA" }
    });

    const matriculasAtivas = statusMatriculaAtiva 
      ? await prisma.matricula.count({
          where: { statusId: statusMatriculaAtiva.id }
        })
      : 0;

    // Buscar vagas totais e ocupadas
    const turmas = await prisma.turma.findMany({
      select: {
        vagasTotais: true,
        vagasDisponiveis: true
      }
    });

    const vagasTotais = turmas.reduce((acc, t) => acc + t.vagasTotais, 0);
    const vagasOcupadas = turmas.reduce((acc, t) => acc + (t.vagasTotais - t.vagasDisponiveis), 0);

    // Buscar últimos 5 inscritos (para exibir na dashboard admin)
    const ultimasInscricoes = await prisma.inscricao.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        curso: {
          select: { nome: true }
        },
        status: {
          select: { nome: true }
        }
      }
    });

    const ultimasInscricoesFormatadas = ultimasInscricoes.map(insc => ({
      id: insc.id,
      nome: insc.nome,
      curso: insc.curso?.nome,
      status: insc.status?.nome,
      data: insc.createdAt
    }));

    // Estatísticas mensais (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const inscricoesPorMes = await prisma.inscricao.findMany({
      where: {
        createdAt: { gte: seisMesesAtras }
      },
      select: { createdAt: true }
    });

    // Agrupar por mês
    const mesesMap = new Map();
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    inscricoesPorMes.forEach(insc => {
      const mes = insc.createdAt.getMonth();
      mesesMap.set(mes, (mesesMap.get(mes) || 0) + 1);
    });

    const inscricoesPorMesArray = mesesNomes.map((nome, index) => ({
      mes: nome,
      total: mesesMap.get(index) || 0
    }));

    return NextResponse.json({
      // Estatísticas principais
      inscricoes: totalInscricoes,
      matriculas: totalMatriculas,
      alunos: totalAlunos,
      cursos: totalCursos,
      matriculasAtivas: matriculasAtivas,
      
      // Vagas
      vagasTotais,
      vagasOcupadas,
      taxaOcupacao: vagasTotais > 0 ? Math.round((vagasOcupadas / vagasTotais) * 100) : 0,
      
      // Dados para gráficos
      inscricoesPorCurso,
      inscricoesPorMes: inscricoesPorMesArray,
      
      // Últimas atividades
      ultimasInscricoes: ultimasInscricoesFormatadas,
      
      // Timestamp da consulta
      atualizadoEm: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    
    // Retornar dados mockados em caso de erro (para não quebrar a página)
    return NextResponse.json({
      inscricoes: 0,
      matriculas: 0,
      alunos: 0,
      cursos: 4,
      matriculasAtivas: 0,
      vagasTotais: 0,
      vagasOcupadas: 0,
      taxaOcupacao: 0,
      inscricoesPorCurso: [],
      inscricoesPorMes: [],
      ultimasInscricoes: [],
      atualizadoEm: new Date().toISOString(),
      _error: "Erro ao carregar estatísticas"
    });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Pegar parâmetros de paginação da URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Buscar total de registros para paginação
    const total = await prisma.inscricao.count({
      where: {
        matricula: null,
      },
    });

    // Buscar inscrições com paginação e apenas os campos necessários
    const inscricoes = await prisma.inscricao.findMany({
      where: {
        matricula: null,
      },
      select: {
        id: true,
        bi: true,
        nome: true,
        telefone: true,
        email: true,
        endereco: true,
        dataNascimento: true,
        createdAt: true,
        curso: {
          select: {
            nome: true,
          },
        },
        classe: {
          select: {
            nome: true,
          },
        },
        genero: {
          select: {
            nome: true,
          },
        },
        status: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: limit,
    });

    // Formatar os dados para o frontend
    const inscricoesFormatadas = inscricoes.map((inscricao) => ({
      id: inscricao.id,
      bi: inscricao.bi,
      nome: inscricao.nome,
      telefone: inscricao.telefone,
      email: inscricao.email,
      endereco: inscricao.endereco,
      classe: inscricao.classe?.nome || "Não definida",
      curso: inscricao.curso?.nome || "Não definido",
      status: inscricao.status?.nome || "Pendente",
      genero: inscricao.genero?.nome || "Não definido",
      dataNascimento: inscricao.dataNascimento,
      createdAt: inscricao.createdAt,
    }));

    // Retornar dados com informações de paginação
    return NextResponse.json({
      success: true,
      data: inscricoesFormatadas,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Erro detalhado ao buscar inscrições:", error);
    
    // Verificar se é erro de timeout ou conexão
    if (error instanceof Error && error.message.includes("ConnectionClosed")) {
      return NextResponse.json(
        {
          success: false,
          error: "A conexão com o banco de dados foi fechada. Tente novamente.",
          code: "CONNECTION_CLOSED",
        },
        { status: 503 }
      );
    }

    // Verificar se é erro de timeout
    if (error instanceof Error && error.message.includes("Timeout")) {
      return NextResponse.json(
        {
          success: false,
          error: "A consulta está demorando muito. Tente novamente com menos registros.",
          code: "TIMEOUT",
        },
        { status: 408 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar inscrições. Tente novamente mais tarde.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
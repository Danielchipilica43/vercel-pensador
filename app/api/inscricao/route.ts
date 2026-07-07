// app/api/inscricao/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { 
      bi, 
      nome, 
      telefone, 
      email, 
      endereco, 
      dataNascimento,
      cursoId, 
      classeId, 
      generoId 
    } = body;

    // Validação dos campos obrigatórios
    if (!bi || !nome || !telefone || !email || !endereco || !dataNascimento || !cursoId || !classeId || !generoId) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    // Verificar se o BI já existe
    const existente = await prisma.inscricao.findUnique({
      where: { bi },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Este BI já possui uma inscrição" },
        { status: 409 }
      );
    }

    // Verificar se os IDs existem nas tabelas relacionadas
    const [curso, classe, genero, statusPendente] = await Promise.all([
      prisma.curso.findUnique({ where: { id: parseInt(cursoId) } }),
      prisma.classe.findUnique({ where: { id: parseInt(classeId) } }),
      prisma.genero.findUnique({ where: { id: parseInt(generoId) } }),
      prisma.statusInscricao.findFirst({ where: { nome: "PENDENTE" } })
    ]);

    if (!curso) {
      return NextResponse.json(
        { error: "Curso inválido" },
        { status: 400 }
      );
    }

    if (!classe) {
      return NextResponse.json(
        { error: "Classe inválida" },
        { status: 400 }
      );
    }

    if (!genero) {
      return NextResponse.json(
        { error: "Gênero inválido" },
        { status: 400 }
      );
    }

    // Criar inscrição
    const inscricao = await prisma.inscricao.create({
      data: {
        bi,
        nome,
        telefone,
        email,
        endereco,
        dataNascimento: new Date(dataNascimento),
        cursoId: parseInt(cursoId),
        classeId: parseInt(classeId),
        generoId: parseInt(generoId),
        statusId: statusPendente?.id || 1, // Fallback para ID 1 se não encontrar
      },
      include: {
        curso: true,
        classe: true,
        genero: true,
        status: true,
      },
    });

    return NextResponse.json(inscricao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar inscrição:", error);
    
    // Tratamento de erro específico do Prisma
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Referência inválida (curso, classe ou gênero não existe)" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Erro interno ao criar inscrição" },
      { status: 500 }
    );
  }
}

// GET para listar inscrições (opcional, útil para admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bi = searchParams.get("bi");
    const status = searchParams.get("status");

    const where: any = {};
    
    if (bi) where.bi = bi;
    if (status) where.status = { nome: status };

    const inscricoes = await prisma.inscricao.findMany({
      where,
      include: {
        curso: {
          select: {
            id: true,
            nome: true,
            duracao: true,
          },
        },
        classe: {
          select: {
            id: true,
            nome: true,
          },
        },
        genero: {
          select: {
            id: true,
            nome: true,
          },
        },
        status: {
          select: {
            id: true,
            nome: true,
          },
        },
        matricula: {
          select: {
            id: true,
            status: {
              select: { nome: true }
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(inscricoes);
  } catch (error) {
    console.error("Erro ao buscar inscrições:", error);
    return NextResponse.json(
      { error: "Erro ao buscar inscrições" },
      { status: 500 }
    );
  }
}

// PUT para atualizar status da inscrição (para admin)
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { statusId } = body;

    if (!id || !statusId) {
      return NextResponse.json(
        { error: "ID e status são obrigatórios" },
        { status: 400 }
      );
    }

    const inscricao = await prisma.inscricao.update({
      where: { id: parseInt(id) },
      data: { statusId: parseInt(statusId) },
      include: {
        status: true,
      },
    });

    return NextResponse.json(inscricao);
  } catch (error) {
    console.error("Erro ao atualizar inscrição:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar inscrição" },
      { status: 500 }
    );
  }
}

// DELETE para remover inscrição (apenas admin)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.inscricao.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Inscrição removida com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao remover inscrição:", error);
    return NextResponse.json(
      { error: "Erro ao remover inscrição" },
      { status: 500 }
    );
  }
}
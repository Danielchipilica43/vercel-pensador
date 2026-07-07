// app/api/publicacoes/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get("categoria");
    const destaque = searchParams.get("destaque");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: any = { publicado: true };
    
    if (categoria && categoria !== "todos") {
      where.categoria = categoria;
    }
    
    if (destaque === "true") {
      where.destaque = true;
    }

    const [publicacoes, total] = await Promise.all([
      prisma.publicacao.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.publicacao.count({ where })
    ]);

    return NextResponse.json({
      publicacoes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar publicações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar publicações" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titulo, conteudo, resumo, imagemUrl, autor, categoria, destaque, publicado } = body;

    if (!titulo || !conteudo) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    const publicacao = await prisma.publicacao.create({
      data: {
        titulo,
        conteudo,
        resumo: resumo || titulo.substring(0, 150),
        imagemUrl: imagemUrl || null,
        autor: autor || "Administrador",
        categoria: categoria || "NOTICIA",
        destaque: destaque || false,
        publicado: publicado !== undefined ? publicado : true,
      },
    });

    return NextResponse.json(publicacao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar publicação:", error);
    return NextResponse.json(
      { error: "Erro ao criar publicação" },
      { status: 500 }
    );
  }
}
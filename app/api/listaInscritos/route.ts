import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const inscricoes = await prisma.inscricao.findMany({
      where: {
        matricula: null, // só quem não possui matrícula
      },
      include: {
        curso: {
          select: {
            id: true,
            nome: true,
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
            nome: true,
          },
        },
        status: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Formatar os dados para o frontend
    const inscricoesFormatadas = inscricoes.map(inscricao => ({
      id: inscricao.id,
      bi: inscricao.bi,
      nome: inscricao.nome,
      telefone: inscricao.telefone,
      email: inscricao.email,
      endereco: inscricao.endereco,
      classe: inscricao.classe.nome,
      curso: inscricao.curso.nome,
      status: inscricao.status.nome,
      genero: inscricao.genero.nome,
      dataNascimento: inscricao.dataNascimento,
      createdAt: inscricao.createdAt,
    }));

    return NextResponse.json(inscricoesFormatadas);
  } catch (err) {
    console.error("Erro ao buscar inscrições:", err);
    return NextResponse.json(
      { error: "Erro ao buscar inscrições" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const inscricoes = await prisma.inscricao.findMany({
      include: { status: true }
    });

    const total = inscricoes.length;
    const pendentes = inscricoes.filter(i => i.status?.nome === "PENDENTE").length;
    const aprovadas = inscricoes.filter(i => i.status?.nome === "APROVADA").length;
    const rejeitadas = inscricoes.filter(i => i.status?.nome === "REJEITADA").length;

    return NextResponse.json({ total, pendentes, aprovadas, rejeitadas });
  } catch (error) {
    return NextResponse.json({ total: 0, pendentes: 0, aprovadas: 0, rejeitadas: 0 });
  }
}
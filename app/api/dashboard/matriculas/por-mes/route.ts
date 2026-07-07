import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const matriculas = await prisma.matricula.findMany({
      select: { createdAt: true }
    });

    const meses: Record<string, number> = {};
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    matriculas.forEach(matricula => {
      const mes = matricula.createdAt.getMonth();
      meses[mes] = (meses[mes] || 0) + 1;
    });

    const dados = mesesNomes.map((_, i) => meses[i] || 0);

    return NextResponse.json(dados.map((total, i) => ({ mes: mesesNomes[i], total })));
  } catch (error) {
    return NextResponse.json([]);
  }
}
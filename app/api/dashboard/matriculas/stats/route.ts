import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const matriculas = await prisma.matricula.findMany({
      include: { status: true }
    });

    const total = matriculas.length;
    const ativas = matriculas.filter(m => m.status?.nome === "ATIVA").length;
    const concluidas = matriculas.filter(m => m.status?.nome === "CONCLUIDA").length;
    const canceladas = matriculas.filter(m => m.status?.nome === "CANCELADA").length;

    return NextResponse.json({ total, ativas, concluidas, canceladas });
  } catch (error) {
    return NextResponse.json({ total: 0, ativas: 0, concluidas: 0, canceladas: 0 });
  }
}
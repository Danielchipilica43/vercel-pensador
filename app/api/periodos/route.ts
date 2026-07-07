import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const periodos = await prisma.periodo.findMany({
      orderBy: { nome: "desc" },
    });
    return NextResponse.json(periodos);
  } catch (error) {
    console.error("Erro ao buscar períodos:", error);
    return NextResponse.json([], { status: 200 });
  }
}
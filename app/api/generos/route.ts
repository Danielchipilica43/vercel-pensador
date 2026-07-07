// app/api/generos/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const generos = await prisma.genero.findMany({
      select: { id: true, nome: true }
    });
    return NextResponse.json(generos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar gêneros, " + error }, { status: 500 });
  }
}
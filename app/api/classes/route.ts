// app/api/classes/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const classes = await prisma.classe.findMany({
      select: { id: true, nome: true }
    });
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar classes, " + error }, { status: 500 });
  }
}
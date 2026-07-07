// app/api/turnos/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const turnos = await prisma.turno.findMany({
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(turnos);
  } catch (error) {
    console.error("Erro ao buscar turnos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar turnos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome do turno é obrigatório" },
        { status: 400 }
      );
    }

    const turno = await prisma.turno.create({
      data: { nome },
    });

    return NextResponse.json(turno, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar turno:", error);
    return NextResponse.json(
      { error: "Erro ao criar turno" },
      { status: 500 }
    );
  }
}
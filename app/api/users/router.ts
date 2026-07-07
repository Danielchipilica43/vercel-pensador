import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET: Retorna todos os usuários
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}


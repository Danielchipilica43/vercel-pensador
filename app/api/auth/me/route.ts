// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verify(token, process.env.JWT_SECRET || "secret") as {
      id: number;
      email: string;
      nome: string;
      nivel: string;
    };

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        nivel: {
          select: { nome: true }
        },
        genero: {
          select: { nome: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      nome: user.nome,
      nivel: user.nivel?.nome,
      genero: user.genero?.nome,
      ativo: user.ativo,
      ultimoAcesso: user.ultimoAcesso,
    });
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }
}
// app/api/usuarios/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: {
          select: { nome: true }
        },
        ativo: true,
        genero: {
          select: { nome: true }
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    const usuariosFormatados = usuarios.map(user => ({
      id: user.id.toString(),
      nome: user.nome,
      email: user.email,
      role: user.nivel?.nome.toLowerCase() || "visualizador",
      status: user.ativo ? "ativo" : "inativo",
    }));

    return NextResponse.json(usuariosFormatados);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, senha, role } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    // Buscar nível do usuário
    const nivel = await prisma.userNivel.findFirst({
      where: { nome: role.toUpperCase() }
    });

    if (!nivel) {
      return NextResponse.json(
        { error: "Nível de acesso inválido" },
        { status: 400 }
      );
    }

    // Buscar gênero padrão (Masculino)
    const genero = await prisma.genero.findFirst({
      where: { nome: "Masculino" }
    });

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        nome,
        senha: hashedPassword,
        generoId: genero?.id || 1,
        nivelId: nivel.id,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: { select: { nome: true } },
        ativo: true,
      }
    });

    return NextResponse.json({
      id: user.id.toString(),
      nome: user.nome,
      email: user.email,
      role: user.nivel?.nome.toLowerCase(),
      status: user.ativo ? "ativo" : "inativo",
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
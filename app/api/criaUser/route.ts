// app/api/criaUser/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obrigatórios
    if (!body.nome || !body.email || !body.senha) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(body.senha, 10);

    // Criar usuário com os campos corretos do schema
    const newUser = await prisma.user.create({
      data: {
        nome: body.nome,        // ✅ Correto: nome (não name)
        email: body.email,
        senha: hashedPassword,
        generoId: body.generoId || 1,    // Valor padrão
        nivelId: body.nivelId || 3,       // 3 = VISUALIZADOR
        ativo: body.ativo !== undefined ? body.ativo : true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        createdAt: true,
        nivel: {
          select: { nome: true }
        }
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
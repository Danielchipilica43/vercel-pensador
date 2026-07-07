// app/api/auth/login/route.ts (certifique-se de que o cookie está correto)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        nivel: { select: { nome: true } },
        genero: { select: { nome: true } }
      }
    });

    if (!user || !user.ativo) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    const senhaValida = await bcrypt.compare(password, user.senha);
    if (!senhaValida) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Atualizar último acesso
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() }
    });

    // Gerar token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        nome: user.nome,
        nivel: user.nivel?.nome,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // ✅ Criar resposta com cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        nivel: user.nivel?.nome,
        genero: user.genero?.nome,
      },
      message: "Login realizado com sucesso!"
    });

    // ✅ Configurar cookie com opções adicionais
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: false, // ✅ Em desenvolvimento, usar false
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
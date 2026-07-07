// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, email, role, status, senha } = body;

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const updateData: any = {};

    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (status !== undefined) updateData.ativo = status === "ativo";
    
    if (role) {
      const nivel = await prisma.userNivel.findFirst({
        where: { nome: role.toUpperCase() }
      });
      if (nivel) updateData.nivelId = nivel.id;
    }
    
    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true, message: "Usuário removido" });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return NextResponse.json(
      { error: "Erro ao remover usuário" },
      { status: 500 }
    );
  }
}
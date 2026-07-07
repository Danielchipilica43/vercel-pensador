// app/api/auth/recuperar-senha/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { enviarEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    console.log("📧 Requisição recebida para:", email);

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("🔍 Usuário encontrado?", user ? `Sim - ${user.nome}` : "Não");

    // Por segurança, sempre retorna sucesso mesmo se o usuário não existir
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Se o email estiver cadastrado, você receberá um link de recuperação."
      });
    }

    // Gerar token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expiresAt,
      },
    });

    console.log("✅ Token salvo para:", user.nome);

    // Link de recuperação
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/nova-senha?token=${token}`;

    // Template do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recuperação de Senha</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          .warning { background: #fef3c7; padding: 10px; border-radius: 6px; font-size: 12px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Recuperação de Senha</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${user.nome}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Redefinir Senha</a>
            </div>
            <div class="warning">
              ⚠️ Este link é válido por <strong>1 hora</strong>.
            </div>
            <p>Se você não solicitou esta alteração, ignore este email.</p>
            <p>Atenciosamente,<br><strong>Secretaria Acadêmica</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} - Sistema de Matrículas</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email
    await enviarEmail({
      to: user.email,
      subject: "🔐 Recuperação de Senha - Sistema de Matrículas",
      html: emailHtml,
    });

    console.log("✅ Email enviado para:", user.email);

    return NextResponse.json({
      success: true,
      message: "Se o email estiver cadastrado, você receberá um link de recuperação."
    });
  } catch (error) {
    console.error("❌ Erro:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar solicitação" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// ============================================
// FUNÇÃO: Enviar E-mail via API interna
// ============================================

async function enviarEmailViaAPI(to: string, subject: string, content: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/enviar-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, content, provider: 'Gmail1' }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('❌ Erro ao enviar e-mail:', data);
      return { success: false, error: data.error };
    }

    console.log(`✅ E-mail enviado com sucesso para: ${to}`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro na chamada da API de e-mail:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// ============================================
// FUNÇÃO: Gerar HTML do E-mail de Aprovação
// ============================================

function gerarEmailAprovacao(nome: string, curso: string, classe: string, bi: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 8px;">
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Parabéns!</h1>
        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 18px;">Sua inscrição foi APROVADA com sucesso</p>
      </div>
      
      <!-- CONTEÚDO -->
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Olá, <strong>${nome}</strong>! 👋</h2>
        
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">
          É com grande satisfação que informamos que sua <strong>inscrição foi aprovada</strong> 
          e você agora pode dar continuidade ao processo de <strong>matrícula</strong>.
        </p>

        <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 16px;">Dados da Inscrição</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <p style="margin: 5px 0; color: #475569;"><strong>Nome:</strong> ${nome}</p>
              <p style="margin: 5px 0; color: #475569;"><strong>BI:</strong> ${bi}</p>
            </div>
            <div>
              <p style="margin: 5px 0; color: #475569;"><strong>Curso:</strong> ${curso}</p>
              <p style="margin: 5px 0; color: #475569;"><strong>Classe:</strong> ${classe}</p>
            </div>
          </div>
          <p style="margin: 10px 0 0; color: #166534;">
            <strong>Status:</strong> 
            <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600;">
             APROVADA
            </span>
          </p>
        </div>

        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">📌 Próximos Passos para a Matrícula:</h3>
          <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
            <li><strong> Passo:</strong> Acesse o site, e clica em consultar status</li>
            <li><strong> Passo:</strong> Consulta o Status com BI, e Clica em  Iniciar Matricula.</li>
            <li><strong> Passo:</strong> Preencha os dados da matrícula</li>
            <li><strong> Passo:</strong> Faça o upload dos documentos necessários</li>
            <li><strong> Passo:</strong> Aguarde a confirmação da matrícula</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/status" 
             style="display: inline-block; background: #f97316; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            🔗 Continuar para Matrícula
          </a>
        </div>

        <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            ⚠️ <strong>Prazo:</strong> Você tem até <strong>30 dias</strong> para completar sua matrícula.
          </p>
        </div>
      </div>
      
      <!-- FOOTER -->
      <div style="text-align: center; padding: 20px; font-size: 14px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        <p style="margin: 5px 0;">
          © 2026 Secretaria Acadêmica | Instituto Politécnico Privado O Pensador do Futuro
        </p>
        <p style="margin: 5px 0; font-size: 12px;">
          📧 secretaria@ipp.ao | 📱 +244 999 999 999
        </p>
        <p style="margin: 10px 0 0; font-size: 11px; color: #cbd5e1;">
          Este e-mail foi enviado automaticamente, por favor não responda.
        </p>
      </div>
    </div>
  `;
}

// ============================================
// FUNÇÃO: Gerar HTML do E-mail de Rejeição
// ============================================

function gerarEmailRejeicao(nome: string, curso: string, bi: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 8px;">
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Inscrição Rejeitada</h1>
        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 18px;">Infelizmente sua inscrição não foi aprovada</p>
      </div>
      
      <!-- CONTEÚDO -->
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Olá, <strong>${nome}</strong>!</h2>
        
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">
          Informamos que sua <strong>inscrição foi rejeitada</strong> para o curso de <strong>${curso}</strong>.
        </p>

        <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b; font-size: 16px;">Dados da Inscrição</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <p style="margin: 5px 0; color: #991b1b;"><strong>Nome:</strong> ${nome}</p>
              <p style="margin: 5px 0; color: #991b1b;"><strong>BI:</strong> ${bi}</p>
            </div>
            <div>
              <p style="margin: 5px 0; color: #991b1b;"><strong>Curso:</strong> ${curso}</p>
              <p style="margin: 5px 0 0; color: #991b1b;">
                <strong>Status:</strong> 
                <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600;">
                  REJEITADA
                </span>
              </p>
            </div>
          </div>
        </div>

        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">📌 Motivos mais comuns:</h3>
          <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
            <li>📄 Documentação incompleta ou incorreta</li>
            <li>🚫 Vagas esgotadas para o curso selecionado</li>
            <li>📋 Requisitos mínimos não atendidos</li>
          </ul>
        </div>

        <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <h4 style="margin: 0 0 10px; color: #92400e; font-size: 15px;">🔄 O que fazer agora?</h4>
          <ul style="color: #92400e; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>📞 Entre em contato com a secretaria acadêmica</li>
            <li>📧 Envie um e-mail para: <strong>secretaria@ipp.ao</strong></li>
            <li>📱 Ligue para: <strong>+244 999 999 999</strong></li>
            <li>📋 Verifique a documentação e tente novamente</li>
          </ul>
        </div>

        <p style="color: #475569; text-align: center; font-size: 15px;">
          Estamos à disposição para ajudar com qualquer dúvida! 🙏
        </p>
      </div>
      
      <!-- FOOTER -->
      <div style="text-align: center; padding: 20px; font-size: 14px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        <p style="margin: 5px 0;">
          © 2026 Secretaria Acadêmica | Instituto Politécnico Privado O Pensador do Futuro
        </p>
        <p style="margin: 5px 0; font-size: 12px;">
          📧 secretaria@ipp.ao | 📱 +244 999 999 999
        </p>
        <p style="margin: 10px 0 0; font-size: 11px; color: #cbd5e1;">
          Este e-mail foi enviado automaticamente, por favor não responda.
        </p>
      </div>
    </div>
  `;
}

// ============================================
// PATCH - Atualizar Status da Inscrição
// ============================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Corpo da requisição inválido ou vazio"},
        { status: 400 }
      );
    }

    const { status } = body || {};

    // Validações
    if (!status) {
      return NextResponse.json(
        { error: "Status não fornecido" },
        { status: 400 }
      );
    }

    if (!["APROVADA", "REJEITADA"].includes(status)) {
      return NextResponse.json(
        { error: "Status inválido. Use APROVADA ou REJEITADA" },
        { status: 400 }
      );
    }

    const inscricaoId = Number(id);
    if (isNaN(inscricaoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Buscar status no banco
    const statusRecord = await prisma.statusInscricao.findFirst({
      where: { nome: status },
    });

    if (!statusRecord) {
      return NextResponse.json(
        { error: "Status não encontrado no banco de dados" },
        { status: 404 }
      );
    }

    // Buscar inscrição com dados completos
    const inscricaoExistente = await prisma.inscricao.findUnique({
      where: { id: inscricaoId },
      include: {
        curso: true,
        classe: true,
        genero: true,
        matricula: {
          include: {
            periodo: true,
          }
        }
      },
    });

    if (!inscricaoExistente) {
      return NextResponse.json(
        { error: "Inscrição não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se já está aprovada
    if (inscricaoExistente.statusId === statusRecord.id) {
      const statusNome = status === "APROVADA" ? "aprovada" : "rejeitada";
      return NextResponse.json({
        message: `✅ Esta inscrição já está ${statusNome}`,
        status: status,
        inscricao: {
          id: inscricaoExistente.id,
          nome: inscricaoExistente.nome,
          bi: inscricaoExistente.bi,
          email: inscricaoExistente.email,
          status: status,
        }
      });
    }

    // Atualizar a inscrição
    const inscricaoAtualizada = await prisma.inscricao.update({
      where: { id: inscricaoId },
      data: {
        statusId: statusRecord.id
      },
      include: {
        status: true,
        curso: true,
        classe: true,
        genero: true,
      },
    });

    // ============================================
    // 🔥 ENVIAR E-MAIL
    // ============================================

    let emailEnviado = false;
    let emailError = null;

    if (status === "APROVADA") {
      const emailHtml = gerarEmailAprovacao(
        inscricaoExistente.nome,
        inscricaoExistente.curso?.nome || "Não definido",
        inscricaoExistente.classe?.nome || "Não definido",
        inscricaoExistente.bi
      );

      const result = await enviarEmailViaAPI(
        inscricaoExistente.email,
        "🎉 Inscrição Aprovada - Secretaria Acadêmica",
        emailHtml
      );

      if (result.success) {
        emailEnviado = true;
        console.log(`✅ E-mail de aprovação enviado para: ${inscricaoExistente.email}`);
      } else {
        emailError = result.error;
        console.error(`❌ Erro ao enviar e-mail para ${inscricaoExistente.email}:`, result.error);
      }
    }

    if (status === "REJEITADA") {
      const emailHtml = gerarEmailRejeicao(
        inscricaoExistente.nome,
        inscricaoExistente.curso?.nome || "Não definido",
        inscricaoExistente.bi
      );

      const result = await enviarEmailViaAPI(
        inscricaoExistente.email,
        "❌ Inscrição Rejeitada - Secretaria Acadêmica",
        emailHtml
      );

      if (result.success) {
        emailEnviado = true;
        console.log(`✅ E-mail de rejeição enviado para: ${inscricaoExistente.email}`);
      } else {
        emailError = result.error;
        console.error(`❌ Erro ao enviar e-mail para ${inscricaoExistente.email}:`, result.error);
      }
    }

    // ============================================
    // 📊 RESPOSTA ORGANIZADA
    // ============================================

    const mensagemStatus = status === "APROVADA" 
      ? "Inscrição aprovada com sucesso! O candidato pode agora continuar com o processo de matrícula."
      : "Inscrição rejeitada.";

    return NextResponse.json({
      success: true,
      message: mensagemStatus,
      
      // Dados da inscrição
      inscricao: {
        id: inscricaoAtualizada.id,
        nome: inscricaoAtualizada.nome,
        bi: inscricaoAtualizada.bi,
        email: inscricaoAtualizada.email,
        telefone: inscricaoAtualizada.telefone,
        curso: inscricaoAtualizada.curso?.nome || "Não definido",
        classe: inscricaoAtualizada.classe?.nome || "Não definido",
        status: inscricaoAtualizada.status.nome,
        genero: inscricaoAtualizada.genero?.nome || "Não informado",
        dataInscricao: inscricaoAtualizada.createdAt,
      },

      // Informações do e-mail
      email: {
        enviado: emailEnviado,
        destinatario: inscricaoExistente.email,
        erro: emailError,
      },

      // Próximos passos (apenas para aprovados)
      proximosPassos: status === "APROVADA" ? [
        "Acesse o portal do aluno para continuar a matrícula",
        "Preencha os dados da matrícula",
        "Faça o upload dos documentos necessários",
        "Aguarde a confirmação da matrícula",
      ] : [
        "Entre em contato com a secretaria acadêmica",
        "Envie um e-mail para: secretaria@ipp.ao",
        "Ligue para: +244 999 999 999",
      ],
    });
  } catch (err) {
    console.error("❌ Erro ao atualizar status:", err);
    
    return NextResponse.json(
      { 
        error: "Erro interno ao processar requisição",
        details: err instanceof Error ? err.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}
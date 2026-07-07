// lib/email-service.ts

interface EnviarEmailParams {
  to: string | string[];
  subject: string;
  content: string;
  provider?: 'Gmail1' | 'Gmail2' | 'Icloud' | 'Yahoo' | 'Outlook';
}

export async function enviarEmail(params: EnviarEmailParams) {
  try {
    const response = await fetch('/api/enviar-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        content: params.content,
        provider: params.provider || 'Gmail1',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar e-mail');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

// Template para aprovação
export function gerarConteudoAprovacao(nome: string, curso: string, classe: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Matrícula Aprovada - Seja Bem-vindo!</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #2d3748;
          background: linear-gradient(135deg, #fff5eb 0%, #ffe8d9 100%);
          padding: 20px;
        }
        
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.15);
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .header {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        
        .header::before {
          content: "🎓";
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 40px;
          opacity: 0.2;
        }
        
        .header::after {
          content: "📚";
          position: absolute;
          bottom: 20px;
          left: 20px;
          font-size: 40px;
          opacity: 0.2;
        }
        
        .header h1 {
          font-size: 32px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .header p {
          font-size: 18px;
          opacity: 0.95;
        }
        
        .badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 5px 15px;
          border-radius: 50px;
          font-size: 14px;
          margin-top: 15px;
        }
        
        .content {
          padding: 40px 35px;
        }
        
        .welcome-message {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .welcome-message h2 {
          color: #f97316;
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .welcome-message p {
          color: #4a5568;
        }
        
        .student-card {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          border-radius: 16px;
          padding: 25px;
          margin: 25px 0;
          border-left: 4px solid #f97316;
        }
        
        .student-card h3 {
          color: #ea580c;
          font-size: 18px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #fed7aa;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 600;
          color: #4a5568;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .info-value {
          color: #1a202c;
          font-weight: 500;
          text-align: right;
        }
        
        .turma-highlight {
          background: #f97316;
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }
        
        .message-box {
          background: #f0fdf4;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
          border: 1px solid #bbf7d0;
        }
        
        .message-box p {
          color: #166534;
          margin: 5px 0;
        }
        
        .next-steps {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .next-steps h4 {
          color: #1e293b;
          margin-bottom: 15px;
          font-size: 16px;
        }
        
        .next-steps ul {
          list-style: none;
          padding-left: 0;
        }
        
        .next-steps li {
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #334155;
        }
        
        .next-steps li::before {
          content: "✓";
          color: #f97316;
          font-weight: bold;
          font-size: 18px;
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 50px;
          font-weight: 600;
          margin: 20px 0;
          transition: transform 0.2s, box-shadow 0.2s;
          text-align: center;
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(249, 115, 22, 0.3);
        }
        
        .footer {
          background: #f8fafc;
          padding: 25px 35px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
          color: #64748b;
          font-size: 12px;
          margin: 5px 0;
        }
        
        .social-icons {
          margin: 15px 0;
        }
        
        .social-icons span {
          margin: 0 10px;
          font-size: 20px;
        }
        
        @media (max-width: 480px) {
          .content {
            padding: 25px 20px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
          
          .info-value {
            text-align: left;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Matrícula Aprovada! 🎉</h1>
          <p>Bem-vindo à nossa família acadêmica do IPPPF</p>
          <div class="badge">✨ Novo Semestre ✨</div>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <h2>Olá, ${nome}! 👋</h2>
            <p>É com grande alegria que informamos que sua matrícula foi <strong style="color: #f97316;">APROVADA</strong>!</p>
            <p style="font-size: 18px; margin-top: 10px;">🎓 <strong>Agora você é oficialmente aluno da nossa instituição!</strong></p>
          </div>
          
          <div class="student-card">
            <h3>
              <span>📋</span> Seus Dados Acadêmicos
            </h3>
            <div class="info-row">
              <div class="info-label">
                <span>📚</span> Curso
              </div>
              <div class="info-value"><strong>${curso}</strong></div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <span>🏫</span> Turma
              </div>
              <div class="info-value">
                <span class="turma-highlight">${classe}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <span>📅</span> Ano Letivo
              </div>
              <div class="info-value">${new Date().getFullYear()}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <span>✅</span> Status
              </div>
              <div class="info-value" style="color: #f97316; font-weight: bold;">ATIVA</div>
            </div>
          </div>
          
          <div class="message-box">
            <p>🌟 <strong>Você faz parte da nossa história!</strong> 🌟</p>
            <p style="font-size: 14px;">Estamos muito felizes em tê-lo(a) conosco nesta jornada de conhecimento.</p>
          </div>
          
          <p style="text-align: center; font-size: 14px; color: #64748b; margin-top: 20px;">
            ⏰ As aulas da turma <strong>${classe}</strong> começam em breve.<br>
            Fique atento ao seu e-mail para mais informações!
          </p>
        </div>
        
        <div class="footer">
          <p>Secretaria Acadêmica - Instituto de Educação</p>
          <p>📍 Endereço da Instituição | 📞 +244 999 999 999</p>
          <p>📧 ipppf@pensador.edu | 🌐 www.ipppfuturo.ao.com</p>
          <p>© ${new Date().getFullYear()} Todos os direitos reservados</p>
          <p style="font-size: 11px; margin-top: 10px;">Este e-mail foi enviado automaticamente. Por favor, não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template para rejeição
export function gerarConteudoRejeicao(nome: string, curso: string, motivo: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9fafb; }
        .motivo { background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>❌ Matrícula Rejeitada para o Instituto Politécnico Privado O Pensador Do Futuro</h2>
        </div>
        <div class="content">
          <p>Prezado(a) <strong>${nome}</strong>,</p>
          <p>Informamos que sua matrícula para o curso de <strong>${curso}</strong> foi <strong>REJEITADA</strong>.</p>
          <div class="motivo">
            <strong>📝 Motivo da Rejeição:</strong><br>
            ${motivo}
          </div>
          <p>Para corrigir os problemas, acesse o sistema e faça uma nova solicitação.</p>
          <p>Atenciosamente,<br><strong>Secretaria Acadêmica do O Instituto Politecnico Privado O Pensador Do Futuro</strong></p>
        </div>
        <div class="footer">
          <p>Este e-mail foi enviado automaticamente. Por favor, não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
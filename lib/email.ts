// lib/email.ts
interface EnviarEmailParams {
  to: string;
  subject: string;
  html: string;
}

const EMAIL_API_URL = process.env.EMAIL_API_BASE_URL || 'https://soudev-message.netlify.app/api/email/send';
const ACCESS_KEY = process.env.NEXT_PUBLIC_EMAIL_API_ACCESS_KEY || '01JDPQKTVW7NPXNZTAF91KN1ZA';

export async function enviarEmail(params: EnviarEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("📧 Enviando email para:", params.to);
    console.log("📧 URL da API:", EMAIL_API_URL);
    
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: [params.to],
        subject: params.subject,
        content: params.html,
        provider: 'Gmail1',
        accessKey: ACCESS_KEY,
      }),
    });

    const data = await response.json();
    console.log("📧 Resposta da API:", data);

    if (!response.ok || !data.isOk) {
      throw new Error(data.mensagem || 'Erro ao enviar e-mail');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
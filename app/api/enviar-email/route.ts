// app/api/enviar-email/route.ts
import { NextRequest, NextResponse } from 'next/server';

// URL e Access Key fixas (funcionou no seu teste)
const API_URL = 'https://soudev-message.netlify.app/api/email/send';
const ACCESS_KEY = '01JDPQKTVW7NPXNZTAF91KN1ZA';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, content, provider = 'Gmail1' } = body;

    // Validações
    if (!to) {
      return NextResponse.json(
        { error: 'Destinatário é obrigatório' },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'Assunto é obrigatório' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📧 Enviando e-mail para: ${to}`);
    console.log(`📝 Assunto: ${subject}`);

    // Chamar a API do professor
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: Array.isArray(to) ? to : [to],
        subject,
        content,
        provider,
        accessKey: ACCESS_KEY,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.isOk) {
      console.error('Erro na API do professor:', data);
      return NextResponse.json(
        { error: data.mensagem || 'Erro ao enviar e-mail' },
        { status: response.status }
      );
    }

    console.log('✅ E-mail enviado com sucesso:', data);

    return NextResponse.json({
      success: true,
      message: 'E-mail enviado com sucesso',
      data: data.dados,
    });
  } catch (error) {
    console.error('❌ Erro na API de e-mail:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
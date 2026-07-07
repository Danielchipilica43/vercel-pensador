// app/api/politica/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const politica = {
    titulo: "Política de Privacidade",
    dataAtualizacao: "2025-01-01",
    conteudo: `
      <h2>1. Informações Coletadas</h2>
      <p>Coletamos informações pessoais como nome, email, telefone, BI, endereço e dados acadêmicos necessários para o processo de matrícula.</p>
      
      <h2>2. Uso das Informações</h2>
      <p>Utilizamos suas informações para:</p>
      <ul>
        <li>Processar sua inscrição e matrícula</li>
        <li>Comunicar sobre o status da sua candidatura</li>
        <li>Enviar informações acadêmicas relevantes</li>
        <li>Melhorar nossos serviços</li>
      </ul>
      
      <h2>3. Compartilhamento de Dados</h2>
      <p>Seus dados são compartilhados apenas com:</p>
      <ul>
        <li>Equipe administrativa do Pensador do Futuro</li>
        <li>Órgãos reguladores quando exigido por lei</li>
      </ul>
      
      <h2>4. Segurança</h2>
      <p>Implementamos medidas de segurança para proteger seus dados contra acesso não autorizado.</p>
      
      <h2>5. Seus Direitos</h2>
      <p>Você tem direito a:</p>
      <ul>
        <li>Acessar seus dados</li>
        <li>Corrigir informações incorretas</li>
        <li>Solicitar a exclusão de seus dados</li>
        <li>Revogar consentimento</li>
      </ul>
      
      <h2>6. Contato</h2>
      <p>Para questões sobre privacidade, contate: ${process.env.EMAIL_CONTACT || "contato@ipp.ao"}</p>
    `,
  };

  return NextResponse.json(politica);
}
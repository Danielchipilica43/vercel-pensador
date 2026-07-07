// app/api/termos/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const termos = {
    titulo: "Termos de Uso",
    dataAtualizacao: "2026-01-01",
    conteudo: `
      <h2>1. Aceitação dos Termos</h2>
      <p>Ao acessar e usar o sistema Pensador do Futuro, você concorda com estes termos de uso.</p>
      
      <h2>2. Cadastro e Conta</h2>
      <p>Você é responsável por:</p>
      <ul>
        <li>Fornecer informações verdadeiras e atualizadas</li>
        <li>Manter a confidencialidade de suas credenciais</li>
        <li>Notificar imediatamente sobre uso não autorizado</li>
      </ul>
      
      <h2>3. Uso do Sistema</h2>
      <p>O sistema é destinado para:</p>
      <ul>
        <li>Realizar inscrições e matrículas</li>
        <li>Acompanhar o status da candidatura</li>
        <li>Acessar informações acadêmicas</li>
      </ul>
      
      <h2>4. Conduta Proibida</h2>
      <p>É proibido:</p>
      <ul>
        <li>Fornecer informações falsas</li>
        <li>Tentar acessar dados de outros usuários</li>
        <li>Utilizar o sistema para fins não autorizados</li>
      </ul>
      
      <h2>5. Alterações nos Termos</h2>
      <p>Podemos alterar estes termos a qualquer momento. O uso continuado do sistema implica aceitação das alterações.</p>
      
      <h2>6. Contato</h2>
      <p>Dúvidas sobre estes termos: ${process.env.EMAIL_CONTACT || "contato@ipp.ao"}</p>
    `,
  };

  return NextResponse.json(termos);
}
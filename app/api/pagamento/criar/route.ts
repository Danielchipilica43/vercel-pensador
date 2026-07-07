// app/api/pagamento/criar/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matriculaId, formaPagamento } = body;

    if (!matriculaId || !formaPagamento) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Buscar matrícula
    const matricula = await prisma.matricula.findUnique({
      where: { id: parseInt(matriculaId) },
      include: {
        inscricao: {
          include: { curso: true }
        }
      }
    });

    if (!matricula) {
      return NextResponse.json(
        { error: "Matrícula não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se já tem pagamento
    if (matricula.pagamentoId && matricula.pagamentoId !== 0) {
      return NextResponse.json(
        { error: "Esta matrícula já possui um pagamento" },
        { status: 409 }
      );
    }

    // Gerar referência única
    const referencia = gerarReferencia();
    
    // Data de expiração (3 dias)
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 3);

    // Buscar status AGUARDANDO_COMPROVATIVO
    const statusAguardando = await prisma.statusPagamento.findFirst({
      where: { nome: "AGUARDANDO_COMPROVATIVO" }
    });

    if (!statusAguardando) {
      return NextResponse.json(
        { error: "Status de pagamento não configurado" },
        { status: 500 }
      );
    }

    // Valor padrão da matrícula
    const valor = 25000;

    // Criar pagamento
    const pagamento = await prisma.pagamento.create({
      data: {
        referencia,
        valor,
        formaPagamento,
        statusId: statusAguardando.id,
        dataExpiracao,
      }
    });

    // Atualizar matrícula com o pagamento
    await prisma.matricula.update({
      where: { id: matricula.id },
      data: { pagamentoId: pagamento.id }
    });

    return NextResponse.json({
      success: true,
      pagamento: {
        id: pagamento.id,
        referencia: pagamento.referencia,
        valor: pagamento.valor,
        formaPagamento: pagamento.formaPagamento,
        dataExpiracao: pagamento.dataExpiracao,
      },
      instrucoes: {
        banco: "BAI - Banco Angolano de Investimentos",
        conta: "123 456 789 001",
        titular: "Instituto Politécnico Pensador do Futuro",
        iban: "AO06 0040 0000 1234 5678 9012 3",
        swift: "BAIAAOLU"
      }
    });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}

function gerarReferencia(): string {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  const segundos = String(data.getSeconds()).padStart(2, '0');
  const aleatorio = crypto.randomInt(1000, 9999);
  
  return `IPP${ano}${mes}${dia}${horas}${minutos}${segundos}${aleatorio}`;
}
// app/api/matriculas/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const matriculas = await prisma.matricula.findMany({
      include: {
        inscricao: {
          include: {
            curso: true,
            classe: true,
            genero: true,
            status: true,
          },
        },
        status: true,
        periodo: true,
        pagamento: {
          include: {
            status: true,
          },
        },
        aluno: {
          include: {
            turma: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const matriculasFormatadas = matriculas.map(matricula => ({
      id: matricula.id,
      status: matricula.status.nome,
      birthDate: matricula.birthDate,
      photoUrl: matricula.photoUrl,
      certificateUrl: matricula.certificateUrl,
      medicalCertificateUrl: matricula.medicalCertificateUrl,
      periodo: matricula.periodo?.nome,
      pagamento: matricula.pagamento ? {
        id: matricula.pagamento.id,
        valor: matricula.pagamento.valor,
        forma: matricula.pagamento.formaPagamento,
        status: matricula.pagamento.status?.nome,
        referencia: matricula.pagamento.referencia,
        comprovativoUrl: matricula.pagamento.comprovativoUrl,
      } : null,
      inscricao: matricula.inscricao ? {
        id: matricula.inscricao.id,
        bi: matricula.inscricao.bi,
        nome: matricula.inscricao.nome,
        telefone: matricula.inscricao.telefone,
        email: matricula.inscricao.email,
        endereco: matricula.inscricao.endereco,
        dataNascimento: matricula.inscricao.dataNascimento,
        curso: matricula.inscricao.curso?.nome,
        classe: matricula.inscricao.classe?.nome,
        genero: matricula.inscricao.genero?.nome,
        statusInscricao: matricula.inscricao.status?.nome,
      } : null,
      aluno: matricula.aluno ? {
        id: matricula.aluno.id,
        turma: matricula.aluno.turma?.nome,
      } : null,
      createdAt: matricula.createdAt,
      updatedAt: matricula.updatedAt,
    }));

    return NextResponse.json(matriculasFormatadas);
  } catch (error) {
    console.error("Erro ao buscar matrículas:", error);
    return NextResponse.json([], { status: 200 });
  }
}
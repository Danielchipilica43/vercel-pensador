// app/api/listarMatriculados/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const matriculas = await prisma.matricula.findMany({
      where: {
        status: {
          nome: { in: ["ATIVA", "PENDENTE"] }
        }
      },
      include: {
        inscricao: {  // ✅ minúsculo - igual ao schema
          include: {
            curso: {
              select: { 
                id: true,
                nome: true 
              }
            },
            classe: {
              select: { 
                id: true,
                nome: true 
              }
            }
          }
        },
        status: {     // ✅ minúsculo
          select: { 
            id: true,
            nome: true 
          }
        },
        periodo: {    // ✅ minúsculo
          select: { 
            id: true,
            nome: true 
          }
        },
        pagamento: {  // ✅ minúsculo
          include: {
            status: {
              select: { nome: true }
            }
          }
        },
        aluno: {      // ✅ minúsculo
          select: {
            id: true,
            turma: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Formatar dados para o frontend
    const matriculasFormatadas = matriculas.map(matricula => ({
      id: matricula.id,
      status: matricula.status?.nome || "DESCONHECIDO",
      birthDate: matricula.birthDate,
      photoUrl: matricula.photoUrl,
      certificateUrl: matricula.certificateUrl,
      medicalCertificateUrl: matricula.medicalCertificateUrl,
      periodo: matricula.periodo?.nome,
      pagamento: matricula.pagamento ? {
        valor: matricula.pagamento.valor,
        forma: matricula.pagamento.formaPagamento,
        status: matricula.pagamento.status?.nome
      } : null,
      aluno: matricula.aluno ? {
        id: matricula.aluno.id,
        turma: matricula.aluno.turma?.nome
      } : null,
      inscricao: matricula.inscricao ? {
        id: matricula.inscricao.id,
        bi: matricula.inscricao.bi,
        nome: matricula.inscricao.nome,
        telefone: matricula.inscricao.telefone,
        email: matricula.inscricao.email,
        curso: matricula.inscricao.curso?.nome,
        classe: matricula.inscricao.classe?.nome
      } : null
    }));

    return NextResponse.json(matriculasFormatadas);
  } catch (error) {
    console.error("Erro ao buscar matrículas:", error);
    
    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Erro ao buscar matrículas", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
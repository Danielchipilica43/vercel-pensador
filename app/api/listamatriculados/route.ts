import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 Buscando matrículas...");

    const matriculas = await prisma.matricula.findMany({
      where: {
        status: {
          nome: { in: ["PENDENTE", "ATIVA"] }
        }
      },
      include: {
        inscricao: {  // ✅ Inclui os dados da inscrição
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
            },
            genero: {
              select: { 
                nome: true 
              }
            },
            status: {  // Status da inscrição
              select: { 
                nome: true 
              }
            }
          }
        },
        status: {  // Status da matrícula
          select: { 
            id: true,
            nome: true 
          }
        },
        periodo: {
          select: { 
            id: true,
            nome: true 
          }
        },
        pagamento: {
          include: {
            status: {
              select: { nome: true }
            }
          }
        },
        aluno: {
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

    console.log(`✅ ${matriculas.length} matrículas encontradas`);

    // Formatar dados para o frontend
    const matriculasFormatadas = matriculas.map(matricula => {
      // Log para debug
      console.log(`Matrícula ID ${matricula.id}:`, {
        temInscricao: !!matricula.inscricao,
        nome: matricula.inscricao?.nome,
        bi: matricula.inscricao?.bi,
        curso: matricula.inscricao?.curso?.nome
      });

      return {
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
          curso: matricula.inscricao.curso?.nome || "Não definido",
          classe: matricula.inscricao.classe?.nome,
          genero: matricula.inscricao.genero?.nome,
          statusInscricao: matricula.inscricao.status?.nome
        } : null
      };
    });

    return NextResponse.json(matriculasFormatadas);
  } catch (error) {
    console.error("❌ Erro ao buscar matrículas:", error);
    
    // Log mais detalhado
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
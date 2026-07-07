// app/api/alunos/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: {
        matricula: {
          include: {
            inscricao: {
              include: {
                curso: {
                  select: { nome: true }
                },
                classe: {
                  select: { nome: true }
                },
                genero: {
                  select: { nome: true }
                },
                status: {
                  select: { nome: true }
                }
              }
            },
            status: {
              select: { nome: true }
            },
            periodo: {
              select: { nome: true }
            }
          }
        },
        turma: {
          include: {
            curso: {
              select: { nome: true }
            },
            turno: {
              select: { nome: true }
            }
          }
        },
        user: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const alunosFormatados = alunos.map(aluno => ({
      id: aluno.id,
      matriculaId: aluno.matriculaId,
      turmaId: aluno.turmaId,
      userId: aluno.userId,
      createdAt: aluno.createdAt,
      updatedAt: aluno.updatedAt,
      matricula: aluno.matricula ? {
        id: aluno.matricula.id,
        status: aluno.matricula.status?.nome || "DESCONHECIDO",
        birthDate: aluno.matricula.birthDate,
        photoUrl: aluno.matricula.photoUrl,
        certificateUrl: aluno.matricula.certificateUrl,
        medicalCertificateUrl: aluno.matricula.medicalCertificateUrl,
        periodo: aluno.matricula.periodo?.nome,
      } : null,
      turma: aluno.turma ? {
        id: aluno.turma.id,
        nome: aluno.turma.nome,
        curso: aluno.turma.curso?.nome,
        turno: aluno.turma.turno?.nome,
        anoLetivo: aluno.turma.anoLetivo,
        vagasTotais: aluno.turma.vagasTotais,
        vagasDisponiveis: aluno.turma.vagasDisponiveis,
      } : null,
      inscricao: aluno.matricula?.inscricao ? {
        bi: aluno.matricula.inscricao.bi,
        nome: aluno.matricula.inscricao.nome,
        telefone: aluno.matricula.inscricao.telefone,
        email: aluno.matricula.inscricao.email,
        endereco: aluno.matricula.inscricao.endereco,
        dataNascimento: aluno.matricula.inscricao.dataNascimento,
        curso: aluno.matricula.inscricao.curso?.nome,
        classe: aluno.matricula.inscricao.classe?.nome,
        genero: aluno.matricula.inscricao.genero?.nome,
        statusInscricao: aluno.matricula.inscricao.status?.nome,
      } : null,
      user: aluno.user ? {
        id: aluno.user.id,
        nome: aluno.user.nome,
        email: aluno.user.email
      } : null
    }));

    return NextResponse.json(alunosFormatados);
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json([], { status: 200 });
  }
}
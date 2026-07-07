// app/api/matricula/route.ts (CORRIGIDO COMPLETAMENTE)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const inscricaoId = formData.get("inscricaoId") as string;
    const bi = formData.get("bi") as string;
    const birthDate = formData.get("birthDate") as string;
    const periodoId = formData.get("periodoId") as string;
    
    const photo = formData.get("photo") as File;
    const certificate = formData.get("certificate") as File;
    const medicalCertificate = formData.get("medicalCertificate") as File;

    if (!inscricaoId || !bi || !birthDate || !periodoId) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    if (!photo || !certificate || !medicalCertificate) {
      return NextResponse.json(
        { error: "Todos os documentos são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar inscrição
    const inscricao = await prisma.inscricao.findUnique({
      where: { id: parseInt(inscricaoId) },
      include: { status: true, matricula: true }
    });

    if (!inscricao) {
      return NextResponse.json(
        { error: "Inscrição não encontrada" },
        { status: 404 }
      );
    }

    if (inscricao.status.nome !== "APROVADA") {
      return NextResponse.json(
        { error: "Inscrição não aprovada" },
        { status: 403 }
      );
    }

    if (inscricao.matricula) {
      return NextResponse.json(
        { error: "Esta inscrição já possui matrícula" },
        { status: 409 }
      );
    }

    // Criar pasta de uploads
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    // Função para salvar arquivo
    async function saveFile(file: File, prefix: string) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name);
      const filename = `${prefix}_${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      return `/uploads/${filename}`;
    }

    // Salvar arquivos
    const [photoUrl, certificateUrl, medicalCertificateUrl] = await Promise.all([
      saveFile(photo, "foto"),
      saveFile(certificate, "certificado"),
      saveFile(medicalCertificate, "atestado"),
    ]);

    // Buscar status PENDENTE para matrícula
    const statusPendente = await prisma.statusMatricula.findFirst({
      where: { nome: "PENDENTE" }
    });

    if (!statusPendente) {
      return NextResponse.json(
        { error: "Status de matrícula não configurado" },
        { status: 500 }
      );
    }

    // Buscar período
    const periodo = await prisma.periodo.findUnique({
      where: { id: parseInt(periodoId) }
    });

    if (!periodo) {
      return NextResponse.json(
        { error: "Período não encontrado" },
        { status: 404 }
      );
    }

    // ✅ CRIAR MATRÍCULA CORRETAMENTE (usando connect para relacionamento)
    const matricula = await prisma.matricula.create({
      data: {
        inscricao: {
          connect: { id: parseInt(inscricaoId) }  // ✅ Usar connect em vez de inscricaoId
        },
        status: {
          connect: { id: statusPendente.id }      // ✅ Usar connect para status
        },
        periodo: {
          connect: { id: parseInt(periodoId) }    // ✅ Usar connect para periodo
        },
        birthDate: new Date(birthDate),
        photoUrl,
        certificateUrl,
        medicalCertificateUrl,
      },
      include: {
        inscricao: {
          include: {
            curso: true,
            classe: true,
          },
        },
        status: true,
        periodo: true,
      },
    });

    return NextResponse.json({
      success: true,
      id: matricula.id,
      message: "Matrícula criada com sucesso! Aguarde a criação do pagamento."
    });
  } catch (error) {
    console.error("Erro ao criar matrícula:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar matrícula: " + (error instanceof Error ? error.message : "Erro desconhecido") },
      { status: 500 }
    );
  }
}

// GET para verificar se já existe matrícula
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bi = searchParams.get("bi");

    if (!bi) {
      return NextResponse.json([], { status: 200 });
    }

    const matriculas = await prisma.matricula.findMany({
      where: {
        inscricao: { bi }
      },
      include: {
        status: true,
        pagamento: true
      }
    });

    return NextResponse.json(matriculas);
  } catch (error) {
    console.error("Erro ao buscar matrícula:", error);
    return NextResponse.json([], { status: 200 });
  }
}
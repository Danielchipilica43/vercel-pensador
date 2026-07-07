// app/api/matricula/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Função para converter arquivo para base64
async function fileToBase64(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
  } catch (error) {
    console.error(`❌ Erro ao converter arquivo ${file.name}:`, error);
    throw new Error(`Falha ao processar o arquivo: ${file.name}`);
  }
}

// POST - Criar matrícula
export async function POST(req: NextRequest) {
  console.log("📝 Iniciando criação de matrícula...");
  
  try {
    // ✅ Usando formData() para receber arquivos
    const formData = await req.formData();
    
    // Pegar campos de texto
    const inscricaoId = formData.get("inscricaoId") as string;
    const bi = formData.get("bi") as string;
    const birthDate = formData.get("birthDate") as string;
    const periodoId = formData.get("periodoId") as string;
    
    // Pegar arquivos
    const photo = formData.get("photo") as File;
    const certificate = formData.get("certificate") as File;
    const medicalCertificate = formData.get("medicalCertificate") as File;

    console.log("📋 Dados recebidos:", { inscricaoId, bi, birthDate, periodoId });
    console.log("📎 Arquivos:", { 
      photo: photo?.name, 
      certificate: certificate?.name, 
      medicalCertificate: medicalCertificate?.name 
    });

    // ✅ Validação dos campos obrigatórios
    if (!inscricaoId || !bi || !birthDate || !periodoId) {
      console.log("❌ Campos obrigatórios faltando");
      return NextResponse.json(
        { error: "Dados incompletos. Preencha todos os campos." },
        { status: 400 }
      );
    }

    if (!photo || !certificate || !medicalCertificate) {
      console.log("❌ Documentos obrigatórios faltando");
      return NextResponse.json(
        { error: "Todos os documentos são obrigatórios." },
        { status: 400 }
      );
    }

    // ✅ Verificar se a inscrição existe
    const inscricao = await prisma.inscricao.findUnique({
      where: { id: parseInt(inscricaoId) },
      include: { 
        status: true, 
        matricula: true 
      }
    });

    if (!inscricao) {
      console.log(`❌ Inscrição ${inscricaoId} não encontrada`);
      return NextResponse.json(
        { error: "Inscrição não encontrada." },
        { status: 404 }
      );
    }

    console.log(`✅ Inscrição ${inscricaoId} encontrada. Status: ${inscricao.status.nome}`);

    // ✅ Verificar se a inscrição está aprovada
    if (inscricao.status.nome !== "APROVADA") {
      console.log(`❌ Inscrição não está aprovada. Status atual: ${inscricao.status.nome}`);
      return NextResponse.json(
        { error: "Esta inscrição não está aprovada. Aguarde a aprovação." },
        { status: 403 }
      );
    }

    // ✅ Verificar se já existe matrícula
    if (inscricao.matricula) {
      console.log(`❌ Já existe matrícula para inscrição ${inscricaoId}`);
      return NextResponse.json(
        { error: "Esta inscrição já possui uma matrícula ativa." },
        { status: 409 }
      );
    }

    // ✅ Converter arquivos para base64
    console.log("🔄 Convertendo arquivos para base64...");
    const [photoBase64, certificateBase64, medicalBase64] = await Promise.all([
      fileToBase64(photo),
      fileToBase64(certificate),
      fileToBase64(medicalCertificate),
    ]);
    console.log("✅ Arquivos convertidos com sucesso!");

    // ✅ Buscar status PENDENTE
    const statusPendente = await prisma.statusMatricula.findFirst({
      where: { nome: "PENDENTE" }
    });

    if (!statusPendente) {
      console.log("❌ Status PENDENTE não encontrado");
      return NextResponse.json(
        { error: "Status de matrícula 'PENDENTE' não encontrado no sistema." },
        { status: 500 }
      );
    }

    // ✅ Buscar o período
    const periodo = await prisma.periodo.findUnique({
      where: { id: parseInt(periodoId) }
    });

    if (!periodo) {
      console.log(`❌ Período ${periodoId} não encontrado`);
      return NextResponse.json(
        { error: "Período não encontrado." },
        { status: 404 }
      );
    }

    // ✅ Criar a matrícula
    console.log("📝 Criando matrícula no banco de dados...");
    const matricula = await prisma.matricula.create({
      data: {
        inscricao: {
          connect: { id: parseInt(inscricaoId) }
        },
        status: {
          connect: { id: statusPendente.id }
        },
        periodo: {
          connect: { id: parseInt(periodoId) }
        },
        birthDate: new Date(birthDate),
        photoUrl: photoBase64,
        certificateUrl: certificateBase64,
        medicalCertificateUrl: medicalBase64,
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

    console.log(`✅ Matrícula ${matricula.id} criada com sucesso!`);

    // ✅ Retornar sucesso
    return NextResponse.json({
      success: true,
      id: matricula.id,
      message: "Matrícula criada com sucesso!",
      matricula: {
        id: matricula.id,
        inscricaoId: matricula.inscricaoId,
        status: matricula.status.nome,
        periodo: matricula.periodo.nome,
        birthDate: matricula.birthDate,
      }
    });

  } catch (error) {
    console.error("❌ Erro ao criar matrícula:", error);
    
    // Tratamento de erro mais detalhado
    let errorMessage = "Erro interno ao criar matrícula.";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Erros específicos do Prisma
      if (errorMessage.includes('Prisma')) {
        errorMessage = "Erro no banco de dados. Verifique os dados informados.";
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Buscar matrículas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bi = searchParams.get("bi");
    const id = searchParams.get("id");

    // Se tiver ID, busca uma matrícula específica
    if (id) {
      const matricula = await prisma.matricula.findUnique({
        where: { id: parseInt(id) },
        include: {
          inscricao: {
            include: {
              curso: true,
              classe: true,
              genero: true,
            }
          },
          status: true,
          periodo: true,
          pagamento: true
        }
      });

      if (!matricula) {
        return NextResponse.json(
          { error: "Matrícula não encontrada." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        matricula
      });
    }

    // Se tiver BI, busca por BI
    if (bi) {
      const matriculas = await prisma.matricula.findMany({
        where: {
          inscricao: { 
            bi: bi 
          }
        },
        include: {
          inscricao: {
            include: {
              curso: true,
              classe: true,
              genero: true,
            }
          },
          status: true,
          periodo: true,
          pagamento: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        count: matriculas.length,
        matriculas
      });
    }

    // Se não tiver filtro, busca todas
    const matriculas = await prisma.matricula.findMany({
      include: {
        inscricao: {
          include: {
            curso: true,
            classe: true,
            genero: true,
          }
        },
        status: true,
        periodo: true,
        pagamento: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    return NextResponse.json({
      success: true,
      count: matriculas.length,
      matriculas
    });

  } catch (error) {
    console.error("❌ Erro ao buscar matrículas:", error);
    return NextResponse.json(
      { 
        error: "Erro ao buscar matrículas.",
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar matrícula
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da matrícula é obrigatório." },
        { status: 400 }
      );
    }

    // Buscar status CANCELADA
    const statusCancelada = await prisma.statusMatricula.findFirst({
      where: { nome: "CANCELADA" }
    });

    if (!statusCancelada) {
      return NextResponse.json(
        { error: "Status 'CANCELADA' não encontrado." },
        { status: 500 }
      );
    }

    // Verificar se a matrícula existe
    const matriculaExistente = await prisma.matricula.findUnique({
      where: { id: parseInt(id) }
    });

    if (!matriculaExistente) {
      return NextResponse.json(
        { error: "Matrícula não encontrada." },
        { status: 404 }
      );
    }

    // Atualizar status da matrícula para CANCELADA
    const matricula = await prisma.matricula.update({
      where: { id: parseInt(id) },
      data: {
        statusId: statusCancelada.id
      },
      include: {
        inscricao: true,
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Matrícula cancelada com sucesso!",
      matricula
    });

  } catch (error) {
    console.error("❌ Erro ao cancelar matrícula:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar matrícula." },
      { status: 500 }
    );
  }
}
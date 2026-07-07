import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      where: {
        status: {
          nome: "PENDENTE"
        }
      },
      include: {
        status: true
      },
      orderBy: { valor: "asc" },
    });
    return NextResponse.json(pagamentos || []);
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    return NextResponse.json([], { status: 200 });
  }
}
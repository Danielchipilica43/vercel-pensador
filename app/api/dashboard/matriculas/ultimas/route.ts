import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const matriculas = await prisma.matricula.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        inscricao: {
          include: {
            curso: true
          }
        },
        status: true
      }
    });

    return NextResponse.json(matriculas);
  } catch (error) {
    return NextResponse.json([]);
  }
}
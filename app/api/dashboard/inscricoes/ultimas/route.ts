import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const inscricoes = await prisma.inscricao.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        curso: true,
        status: true
      }
    });

    return NextResponse.json(inscricoes);
  } catch (error) {
    return NextResponse.json([]);
  }
}
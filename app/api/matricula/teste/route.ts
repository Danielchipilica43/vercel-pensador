// app/api/matricula/test/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const entries = Array.from(formData.entries());
    
    console.log("📋 Dados recebidos:", entries.map(([key, value]) => {
      if (value instanceof File) {
        return [key, `File: ${value.name} (${value.size} bytes)`];
      }
      return [key, value];
    }));

    return NextResponse.json({
      success: true,
      message: "Dados recebidos com sucesso!",
      fields: entries.map(([key, value]) => {
        if (value instanceof File) {
          return { key, type: 'file', name: value.name, size: value.size };
        }
        return { key, type: 'text', value };
      })
    });
  } catch (error) {
    console.error("❌ Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar dados" },
      { status: 500 }
    );
  }
}
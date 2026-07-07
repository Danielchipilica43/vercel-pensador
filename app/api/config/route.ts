// app/api/config/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Notificacoes = {
  emailAdmin: boolean;
  emailAluno: boolean;
  sms: boolean;
}

type Seguranca = {
  doisFatores: boolean;
  tempoSessao: number;
  tentativasLogin: number;
}

type Backup = {
  automatico: boolean;
  frequencia: "diario" | "semanal" | "mensal";
}

export async function GET() {
  try {
    const configs = await prisma.configuracao.findMany();

    const config = {
      nomeEscola: "",
      email: "",
      telefone: "",
      endereco: "",
      vagasPadrao: 40,
      idadeMinima: 15,
      idadeMaxima: 60,
      notificacoes: {
        emailAdmin: true,
        emailAluno: true,
        sms: false,
      },
      seguranca: {
        doisFatores: false,
        tempoSessao: 60,
        tentativasLogin: 5,
      },
      backup: {
        automatico: true,
        frequencia: "diario" as "diario" | "semanal" | "mensal",
      }
    };

    // Carregar configurações do banco
    configs.forEach(item => {
      switch (item.chave) {
        case "nomeEscola":
          config.nomeEscola = item.valor || "";
          break;
        case "email":
          config.email = item.valor || "";
          break;
        case "telefone":
          config.telefone = item.valor || "";
          break;
        case "endereco":
          config.endereco = item.valor || "";
          break;
        case "vagasPadrao":
          // Usa valorNum se existir, senão tenta converter valor
          config.vagasPadrao = item.valorNum ?? Number(item.valor) ?? 40;
          break;
        case "idadeMinima":
          config.idadeMinima = item.valorNum ?? Number(item.valor) ?? 15;
          break;
        case "idadeMaxima":
          config.idadeMaxima = item.valorNum ?? Number(item.valor) ?? 60;
          break;
        case "notificacoes":
          if (item.valor) {
            try {
              config.notificacoes = typeof item.valor === 'string' 
                ? JSON.parse(item.valor) 
                : item.valor as Notificacoes;
            } catch (e) {
              console.error("Erro ao parsear notificacoes:", e);
            }
          }
          break;
        case "seguranca":
          if (item.valor) {
            try {
              config.seguranca = typeof item.valor === 'string' 
                ? JSON.parse(item.valor) 
                : item.valor as Seguranca;
            } catch (e) {
              console.error("Erro ao parsear seguranca:", e);
            }
          }
          break;
        case "backup":
          if (item.valor) {
            try {
              config.backup = typeof item.valor === 'string' 
                ? JSON.parse(item.valor) 
                : item.valor as Backup;
            } catch (e) {
              console.error("Erro ao parsear backup:", e);
            }
          }
          break;
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, data } = body;

    // Salvar configurações no banco
    const saves = [];

    if (section === "geral") {
      saves.push(
        prisma.configuracao.upsert({
          where: { chave: "nomeEscola" },
          update: { valor: data.nomeEscola },
          create: { chave: "nomeEscola", valor: data.nomeEscola }
        }),
        prisma.configuracao.upsert({
          where: { chave: "email" },
          update: { valor: data.email },
          create: { chave: "email", valor: data.email }
        }),
        prisma.configuracao.upsert({
          where: { chave: "telefone" },
          update: { valor: data.telefone },
          create: { chave: "telefone", valor: data.telefone }
        }),
        prisma.configuracao.upsert({
          where: { chave: "endereco" },
          update: { valor: data.endereco },
          create: { chave: "endereco", valor: data.endereco }
        }),
        prisma.configuracao.upsert({
          where: { chave: "vagasPadrao" },
          update: { 
            valor: null,
            valorNum: data.vagasPadrao 
          },
          create: { 
            chave: "vagasPadrao", 
            valor: null,
            valorNum: data.vagasPadrao 
          }
        }),
        prisma.configuracao.upsert({
          where: { chave: "idadeMinima" },
          update: { 
            valor: null,
            valorNum: data.idadeMinima 
          },
          create: { 
            chave: "idadeMinima", 
            valor: null,
            valorNum: data.idadeMinima 
          }
        }),
        prisma.configuracao.upsert({
          where: { chave: "idadeMaxima" },
          update: { 
            valor: null,
            valorNum: data.idadeMaxima 
          },
          create: { 
            chave: "idadeMaxima", 
            valor: null,
            valorNum: data.idadeMaxima 
          }
        })
      );
    } else if (section === "seguranca") {
      saves.push(
        prisma.configuracao.upsert({
          where: { chave: "seguranca" },
          update: { 
            valor: JSON.stringify(data),
            valorNum: null 
          },
          create: { 
            chave: "seguranca", 
            valor: JSON.stringify(data),
            valorNum: null 
          }
        })
      );
    } else if (section === "backup") {
      saves.push(
        prisma.configuracao.upsert({
          where: { chave: "backup" },
          update: { 
            valor: JSON.stringify(data),
            valorNum: null 
          },
          create: { 
            chave: "backup", 
            valor: JSON.stringify(data),
            valorNum: null 
          }
        })
      );
    } else if (section === "notificacoes") {
      saves.push(
        prisma.configuracao.upsert({
          where: { chave: "notificacoes" },
          update: { 
            valor: JSON.stringify(data),
            valorNum: null 
          },
          create: { 
            chave: "notificacoes", 
            valor: JSON.stringify(data),
            valorNum: null 
          }
        })
      );
    }

    await Promise.all(saves);

    return NextResponse.json({ success: true, message: "Configurações guardadas!" });
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
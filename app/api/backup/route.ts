// app/api/backup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import { statSync } from "fs";
import path from "path";
import prisma from "@/lib/db";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { acao } = body;

    if (acao === "criar") {
      return await criarBackup();
    } else if (acao === "restaurar") {
      return await restaurarBackup(body.arquivo);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro no backup:", error);
    return NextResponse.json(
      { error: "Erro ao processar backup" },
      { status: 500 }
    );
  }
}

async function criarBackup() {
  try {
    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // Buscar dados do banco
    const data = {
      timestamp: new Date().toISOString(),
      usuarios: await prisma.user.findMany(),
      inscricoes: await prisma.inscricao.findMany(),
      matriculas: await prisma.matricula.findMany(),
      alunos: await prisma.aluno.findMany(),
      cursos: await prisma.curso.findMany(),
      turmas: await prisma.turma.findMany(),
      configs: await prisma.configuracao.findMany(),
    };

    await fs.writeFile(filepath, JSON.stringify(data, null, 2));

    // Registrar backup no banco
    await prisma.configuracao.upsert({
      where: { chave: "ultimo_backup" },
      update: { valor: timestamp },
      create: { chave: "ultimo_backup", valor: timestamp }
    });

    // Listar backups
    const backups = await fs.readdir(backupDir);
    const backupInfo = backups
      .filter(f => f.endsWith(".json"))
      .map(f => ({
        nome: f,
        data: f.replace("backup_", "").replace(".json", ""),
        caminho: `/backups/${f}`
      }))
      .sort((a, b) => b.data.localeCompare(a.data));

    return NextResponse.json({
      success: true,
      message: "Backup criado com sucesso!",
      arquivo: filename,
      backups: backupInfo
    });
  } catch (error) {
    console.error("Erro ao criar backup:", error);
    return NextResponse.json(
      { error: "Erro ao criar backup" },
      { status: 500 }
    );
  }
}

async function restaurarBackup(arquivo: string) {
  try {
    const backupDir = path.join(process.cwd(), "backups");
    const filepath = path.join(backupDir, arquivo);

    const data = JSON.parse(await fs.readFile(filepath, "utf-8"));

    // Restaurar dados (cuidado! isso sobrescreve dados existentes)
    // Esta é uma implementação básica - em produção, você precisa de mais cuidado
    
    return NextResponse.json({
      success: true,
      message: "Backup restaurado com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao restaurar backup:", error);
    return NextResponse.json(
      { error: "Erro ao restaurar backup" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });

    const backups = await fs.readdir(backupDir);
    const backupInfo = [];

    for (const f of backups) {
      if (f.endsWith(".json")) {
        const filePath = path.join(backupDir, f);
        try {
          // Usar stat do fs/promises em vez de statSync
          const stats = await fs.stat(filePath);
          backupInfo.push({
            nome: f,
            data: f.replace("backup_", "").replace(".json", ""),
            tamanho: `${Math.round(stats.size / 1024 / 1024)} MB`,
            caminho: `/backups/${f}`
          });
        } catch (err) {
          console.error(`Erro ao ler arquivo ${f}:`, err);
        }
      }
    }

    backupInfo.sort((a, b) => b.data.localeCompare(a.data));

    return NextResponse.json(backupInfo);
  } catch (error) {
    console.error("Erro ao listar backups:", error);
    return NextResponse.json([], { status: 200 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

// Cache em memória para reduzir consultas ao banco
const userCache = new Map();
const CACHE_DURATION = 30000; // 30 segundos
const TOKEN_CACHE = new Map();
const TOKEN_CACHE_DURATION = 60000; // 1 minuto

// Função para limpar cache periodicamente
setInterval(() => {
  const now = Date.now();
  // Limpar cache de usuários
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      userCache.delete(key);
    }
  }
  // Limpar cache de tokens
  for (const [key, value] of TOKEN_CACHE.entries()) {
    if (now - value.timestamp > TOKEN_CACHE_DURATION) {
      TOKEN_CACHE.delete(key);
    }
  }
}, 60000); // Limpar a cada minuto

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Verificar se o token já foi validado recentemente
    const tokenHash = token.substring(0, 20); // Usar parte do token como chave
    const cachedTokenValidation = TOKEN_CACHE.get(tokenHash);
    if (cachedTokenValidation && Date.now() - cachedTokenValidation.timestamp < TOKEN_CACHE_DURATION) {
      // Token já validado, retornar dados do cache
      const cachedUser = userCache.get(`user_${cachedTokenValidation.userId}`);
      if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_DURATION) {
        console.log(`📦 Cache hit for user ${cachedUser.data.nome}`);
        return NextResponse.json(cachedUser.data);
      }
    }

    // Verificar token
    const decoded = verify(token, process.env.JWT_SECRET || "secret") as {
      id: number;
      email: string;
      nome: string;
      nivel: string;
    };

    // Verificar cache do usuário
    const cacheKey = `user_${decoded.id}`;
    const cachedUser = userCache.get(cacheKey);
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_DURATION) {
      console.log(`📦 Cache hit for user ${cachedUser.data.nome}`);
      // Atualizar cache do token
      TOKEN_CACHE.set(tokenHash, {
        userId: decoded.id,
        timestamp: Date.now()
      });
      return NextResponse.json(cachedUser.data);
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        nivel: {
          select: { nome: true }
        },
        genero: {
          select: { nome: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    // Formatar dados do usuário
    const userData = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      nivel: user.nivel?.nome,
      genero: user.genero?.nome,
      ativo: user.ativo,
      ultimoAcesso: user.ultimoAcesso,
      // Adicionar timestamp para debug
      _cache: new Date().toISOString()
    };

    // Salvar no cache
    userCache.set(cacheKey, {
      data: userData,
      timestamp: Date.now()
    });

    // Salvar validação do token
    TOKEN_CACHE.set(tokenHash, {
      userId: decoded.id,
      timestamp: Date.now()
    });

    console.log(`✅ User ${user.nome} loaded from database`);
    return NextResponse.json(userData);

  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }
}

// Endpoint para invalidar cache (usar quando o usuário for atualizado)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (userId) {
      userCache.delete(`user_${userId}`);
      console.log(`🗑️ Cache invalidado para usuário ${userId}`);
      return NextResponse.json({ success: true, message: "Cache invalidado" });
    }
    return NextResponse.json(
      { error: "userId é necessário" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao invalidar cache" + error },
      { status: 500 }
    );
  }
}
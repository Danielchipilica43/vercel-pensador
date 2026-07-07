// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// ============================================
// ROTAS PÚBLICAS (acesso livre - sem login)
// ============================================
const publicRoutes = [
  '/', '/inscricao', '/status', '/matricula', '/ficha-inscricao', '/publicacoes',
  '/auth/login', '/auth/recuperar-senha', '/auth/nova-senha','/privacidade','/api/auth/termos','/not-found','/termos',
  '/api/auth/login', '/api/auth/recuperar-senha', '/api/auth/nova-senha',
  '/api/auth/me', '/api/auth/check-cookie', '/api/inscricao', '/api/status',
  '/api/matricula', '/api/cursos', '/api/classes', '/api/generos',
  '/api/periodos', '/api/pagamentos', '/api/publicacoes', '/api/stats',
  '/api/upload', '/api/ficha-inscricao', '/api/enviar-email',
  '/api/dashboard/inscricoes/stats', '/api/dashboard/matriculas/stats',
  '/api/dashboard/alunos/stats', '/api/dashboard/inscricoes/por-mes',
  '/api/dashboard/matriculas/por-mes', '/api/dashboard/inscricoes/ultimas',
  '/api/dashboard/matriculas/ultimas', '/api/turmas',
];

// ============================================
// ROTAS PROTEGIDAS (exigem login)
// ============================================
const protectedRoutes = [
  '/adm', '/api/admin', '/api/auth/logout', '/api/usuarios', '/api/config',
  '/api/backup', '/api/relatorios', '/api/alunos', '/api/matriculas',
  '/api/pagamento/criar', '/api/pagamento/comprovativo-simulado', '/api/listaInscritos',
];

// ============================================
// ROTAS DE ADMIN (apenas nível ADMIN)
// ============================================
const adminRoutes = [
  '/adm/pages/configuracao', '/adm/pages/usuarios', '/adm/pages/publicacoes',
  '/api/usuarios', '/api/turnos', '/api/config', '/api/backup',
];

// ROTAS DE GESTOR (ADMIN ou GESTOR)
const gestorRoutes = [
  '/adm/pages/inscritos', '/adm/pages/matriculas', '/adm/pages/alunos',
  '/adm/pages/relatorio', '/api/listaInscritos', '/api/matriculas', '/api/alunos',
];

// ARQUIVOS ESTÁTICOS (sempre permitidos)
const staticPaths = ['/_next', '/favicon.ico', '/uploads', '/images'];

// ============================================
// 🔥 CONFIGURAÇÃO DE RATE LIMITING
// ============================================
const RATE_LIMITS = {
  // Rotas públicas mais sensíveis (consulta de BI)
  sensitivePublic: {
    limit: 20,        // 20 requisições
    windowMs: 60_000, // por minuto
    routes: ['/api/inscricao', '/status', '/api/status']
  },
  // Rotas de formulário (matrícula)
  formSubmit: {
    limit: 10,
    windowMs: 60_000,
    routes: ['/api/matricula', '/matricula']
  },
  // Rotas de login (protege contra brute force)
  login: {
    limit: 5,
    windowMs: 60_000,
    routes: ['/api/auth/login']
  },
  // Rotas públicas normais
  defaultPublic: {
    limit: 50,
    windowMs: 60_000
  },
  // Rotas protegidas (usuários logados)
  authenticated: {
    limit: 100,
    windowMs: 60_000
  },
  // Rotas de admin
  admin: {
    limit: 150,
    windowMs: 60_000
  },
};

// Armazenamento de requisições (em memória)
// Em produção, use Redis
const requestStore = new Map<string, { count: number; resetTime: number }>();

// Limpar store periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (value.resetTime < now) {
      requestStore.delete(key);
    }
  }
}, 60_000); // Limpar a cada minuto

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  return cfConnectingIp || 
         (forwardedFor?.split(',')[0]) || 
         realIp || 
         'unknown';
}

function getRateLimitConfig(pathname: string): { limit: number; windowMs: number } {
  // Verificar rotas sensíveis
  if (RATE_LIMITS.sensitivePublic.routes.some(route => pathname === route || pathname.startsWith(route))) {
    return RATE_LIMITS.sensitivePublic;
  }
  
  if (RATE_LIMITS.formSubmit.routes.some(route => pathname === route || pathname.startsWith(route))) {
    return RATE_LIMITS.formSubmit;
  }
  
  if (RATE_LIMITS.login.routes.some(route => pathname === route || pathname.startsWith(route))) {
    return RATE_LIMITS.login;
  }
  
  // Verificar se é rota de admin (requer autenticação)
  if (matchesRoute(pathname, adminRoutes)) {
    return RATE_LIMITS.admin;
  }
  
  // Verificar se é rota protegida
  if (matchesRoute(pathname, protectedRoutes) || matchesRoute(pathname, gestorRoutes)) {
    return RATE_LIMITS.authenticated;
  }
  
  // Rota pública padrão
  return RATE_LIMITS.defaultPublic;
}

async function checkRateLimit(
  request: NextRequest,
  userLevel?: string
): Promise<{ allowed: boolean; retryAfter?: number; limit?: number; remaining?: number }> {
  const pathname = request.nextUrl.pathname;
  const ip = getClientIp(request);
  const config = getRateLimitConfig(pathname);
  
  // Criar chave única (IP + rota + nível do usuário)
  const key = userLevel === 'ADMIN' 
    ? `admin:${ip}`  // Admins têm limite separado
    : `${ip}:${pathname}`;
  
  const now = Date.now();
  const record = requestStore.get(key);
  
  // Se não tem registro ou já expirou
  if (!record || record.resetTime < now) {
    requestStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
    };
  }
  
  // Verificar se excedeu o limite
  if (record.count >= config.limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    
    console.warn(`⚠️ Rate limit excedido: ${ip} em ${pathname} (${record.count}/${config.limit})`);
    
    return {
      allowed: false,
      retryAfter,
      limit: config.limit,
      remaining: 0,
    };
  }
  
  // Incrementar contador
  record.count++;
  requestStore.set(key, record);
  
  return {
    allowed: true,
    limit: config.limit,
    remaining: config.limit - record.count,
  };
}

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

function isStaticFile(pathname: string): boolean {
  return staticPaths.some(path => pathname.startsWith(path));
}

function verifyToken(token: string) {
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'secret');
    return decoded;
  } catch (error) {
    return null;
  }
}

// ============================================
// 🔥 MIDDLEWARE PRINCIPAL COM RATE LIMITING
// ============================================
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir arquivos estáticos (sem rate limit)
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  // 2. APLICAR RATE LIMITING (antes de qualquer outra verificação)
  // Para rotas públicas, verificar rate limit sem token
  if (matchesRoute(pathname, publicRoutes)) {
    const rateLimit = await checkRateLimit(request);
    
    if (!rateLimit.allowed) {
      console.log(`🚫 Rate limit excedido para: ${pathname}`);
      
      return new NextResponse(
        JSON.stringify({
          error: 'Muitas requisições',
          message: `Você excedeu o limite de ${rateLimit.limit} requisições por minuto. Aguarde ${rateLimit.retryAfter} segundos.`,
          retryAfter: rateLimit.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.retryAfter),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
    
    // Adicionar headers de rate limit na resposta
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    return response;
  }

  // 3. Verificar se é rota protegida
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes) ||
                           matchesRoute(pathname, adminRoutes) ||
                           matchesRoute(pathname, gestorRoutes);
  
  // 4. Se não é pública nem protegida, redirecionar para 404
  if (!isProtectedRoute) {
    console.log('❌ Rota não reconhecida:', pathname);
    return NextResponse.redirect(new URL('/404', request.url));
  }

  // 5. Obter token do cookie
  const token = request.cookies.get('auth_token')?.value;

  // 6. Se não tem token, redirecionar para login
  if (!token) {
    console.log('🔒 Sem token, redirecionando para login');
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 7. Verificar token
  const decoded = verifyToken(token) as any;
  
  if (!decoded) {
    console.log('❌ Token inválido');
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  console.log('👤 Usuário:', decoded.nome);
  console.log('👑 Nível:', decoded.nivel);

  const userLevel = decoded.nivel;

  // 8. APLICAR RATE LIMITING PARA USUÁRIOS AUTENTICADOS
  const rateLimit = await checkRateLimit(request, userLevel);
  
  if (!rateLimit.allowed) {
    console.log(`🚫 Rate limit excedido para usuário: ${decoded.nome}`);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Muitas requisições',
        message: `Limite de ${rateLimit.limit} requisições por minuto excedido. Aguarde ${rateLimit.retryAfter} segundos.`,
        retryAfter: rateLimit.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.retryAfter),
        },
      }
    );
  }

  // 9. Verificar acesso a rotas de admin
  if (matchesRoute(pathname, adminRoutes) && userLevel !== 'ADMIN') {
    console.log('🚫 Acesso negado - Admin necessário');
    return NextResponse.redirect(new URL('/adm/dashboard', request.url));
  }

  // 10. Verificar acesso a rotas de gestor
  if (matchesRoute(pathname, gestorRoutes) && !['ADMIN', 'GESTOR'].includes(userLevel)) {
    console.log('🚫 Acesso negado - Gestor necessário');
    return NextResponse.redirect(new URL('/adm/dashboard', request.url));
  }

  console.log('✅ Acesso permitido');
  
  // Adicionar headers de rate limit na resposta
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};
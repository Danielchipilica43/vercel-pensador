// components/RouteGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { getPageRoles, hasPermission, type UserRole } from '@/lib/permissions';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export function RouteGuard({ children, requiredRoles }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Se não está autenticado, redireciona para login
      if (!user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Verificar permissões da página
      const pageRoles = requiredRoles || getPageRoles(pathname);
      
      if (pageRoles && !hasPermission(user.nivel as UserRole, pageRoles)) {
        // Redirecionar para dashboard se não tem permissão
        router.push('/adm/dashboard');
      }
    }
  }, [loading, user, router, pathname, requiredRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pageRoles = requiredRoles || getPageRoles(pathname);
  if (pageRoles && !hasPermission(user.nivel as UserRole, pageRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-6 h-6" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
              Este recurso requer nível de acesso: <strong>{pageRoles.join(' ou ')}</strong>
            </p>
            <Button onClick={() => router.push('/adm/dashboard')} className="w-full">
              Voltar para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
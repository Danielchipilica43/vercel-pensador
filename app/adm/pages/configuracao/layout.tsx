// app/adm/pages/configuracao/layout.tsx
'use client';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function ConfiguracaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Apenas ADMIN pode acessar configurações
  return (
    <ProtectedRoute allowedRoles="ADMIN">
      {children}
    </ProtectedRoute>
  );
}
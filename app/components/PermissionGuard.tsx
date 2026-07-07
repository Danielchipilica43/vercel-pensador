// components/PermissionGuard.tsx
'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { hasPermission, type UserRole } from '@/lib/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function PermissionGuard({ children, allowedRoles, fallback = null }: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user) return null;
  
  if (hasPermission(user.nivel as UserRole, allowedRoles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
// components/LogoutButton.tsx
'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    const toastId = toast.loading('Saindo do sistema...');
    await logout();
    toast.success('Logout realizado com sucesso!', { id: toastId });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sair do Sistema
    </Button>
  );
}
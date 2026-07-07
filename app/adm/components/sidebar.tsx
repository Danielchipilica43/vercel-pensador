// app/adm/_components/sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  UserCheck, 
  ClipboardList, 
  Users, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  CreditCard,
  Megaphone,
  GraduationCap,
  ChevronRight,
  Shield,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "./LogoutButton";
import { useAuth } from '@/app/hooks/useAuth';
import { PermissionGuard } from "@/app/components/PermissionGuard";

// ✅ Definir o tipo UserRole
type UserRole = 'ADMIN' | 'GESTOR';

// ✅ Interface para os itens do menu
interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const menuItems: MenuCategory[] = [
    {
      category: "Principal",
      items: [
        { 
          title: "Dashboard", 
          href: "/adm/dashboard", 
          icon: LayoutDashboard,
          roles: ['ADMIN', 'GESTOR']
        },
        { 
          title: "Inscrições", 
          href: "/adm/pages/inscritos", 
          icon: ClipboardList,
          roles: ['ADMIN', 'GESTOR'],
          badge: "Pendentes"
        },
        { 
          title: "Matrículas", 
          href: "/adm/pages/matriculas", 
          icon: UserCheck,
          roles: ['ADMIN', 'GESTOR'],
          badge: "Novas"
        },
        { 
          title: "Alunos", 
          href: "/adm/pages/aluno", 
          icon: Users,
          roles: ['ADMIN', 'GESTOR']
        },
      ]
    },
    {
      category: "Gestão",
      items: [
        { 
          title: "Relatórios", 
          href: "/adm/pages/relatorio", 
          icon: FileText,
          roles: ['ADMIN', 'GESTOR']
        },
        { 
          title: "Simular Pagamento", 
          href: "/adm/pages/simular-pagamento", 
          icon: CreditCard,
          roles: ['ADMIN', 'GESTOR']
        },
        { 
          title: "Publicações", 
          href: "/adm/pages/publicacoes", 
          icon: Megaphone,
          roles: ['ADMIN', 'GESTOR']
        },
      ]
    },
    {
      category: "Sistema",
      items: [
        { 
          title: "Configurações", 
          href: "/adm/pages/configuracao", 
          icon: Settings,
          roles: ['ADMIN']
        },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-linear-to-r from-orange-500 to-orange-600 rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-800 block">IPP Admin</span>
            <span className="text-xs text-gray-500">Sistema Académico</span>
          </div>
        </div>
      </div>

      {/* Perfil do usuário */}
      {user && (
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-medium text-sm">
                {user.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.nome}
              </p>
              <Badge variant="outline" className="text-xs mt-0.5">
                {user.nivel === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                {user.nivel}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {menuItems.map((category, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
              {category.category}
            </p>
            {category.items.map((item) => (
              <PermissionGuard key={item.href} allowedRoles={item.roles}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200
                    ${isActive(item.href) 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive(item.href) ? 'text-orange-500' : ''}`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive(item.href) && (
                    <ChevronRight className="w-3 h-3 text-orange-500" />
                  )}
                </Link>
              </PermissionGuard>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer com Logout */}
      <div className="p-3 border-t border-gray-200">
        <LogoutButton />
      </div>
    </aside>
  );
}
// lib/permissions.ts
export type UserRole = 'ADMIN' | 'GESTOR' | 'VISUALIZADOR';

// Definição de permissões por página
export const pagePermissions: Record<string, UserRole[]> = {
  // Dashboard - todos podem ver
  '/adm/dashboard': ['ADMIN', 'GESTOR', 'VISUALIZADOR'],
  
  // Gestão de Inscrições - apenas ADMIN e GESTOR
  '/adm/pages/inscritos': ['ADMIN', 'GESTOR'],
  '/adm/pages/inscritos/': ['ADMIN', 'GESTOR'],
  
  // Gestão de Matrículas - apenas ADMIN e GESTOR
  '/adm/pages/matriculas': ['ADMIN', 'GESTOR'],
  '/adm/pages/matriculas/': ['ADMIN', 'GESTOR'],
  
  // Gestão de Alunos - apenas ADMIN e GESTOR
  '/adm/pages/alunos': ['ADMIN', 'GESTOR'],
  '/adm/pages/aluno': ['ADMIN', 'GESTOR'],
  
  // Relatórios - todos podem ver
  '/adm/pages/relatorio': ['ADMIN', 'GESTOR', 'VISUALIZADOR'],
  
  // Configurações - apenas ADMIN
  '/adm/pages/configuracao': ['ADMIN'],
  '/adm/pages/usuarios': ['ADMIN'],
  '/adm/pages/publicacoes': ['ADMIN'],
  
  // Publicações (frontend) - todos podem ver
  '/publicacoes': ['ADMIN', 'GESTOR', 'VISUALIZADOR'],
  '/publicacoes/': ['ADMIN', 'GESTOR', 'VISUALIZADOR'],
};

// Permissões para ações específicas
export const actionPermissions = {
  // Inscrições
  'approve_inscricao': ['ADMIN', 'GESTOR'],
  'reject_inscricao': ['ADMIN', 'GESTOR'],
  'view_inscricao': ['ADMIN', 'GESTOR', 'VISUALIZADOR'],
  
  // Matrículas
  'approve_matricula': ['ADMIN', 'GESTOR'],
  'reject_matricula': ['ADMIN', 'GESTOR'],
  'view_matricula': ['ADMIN', 'GESTOR', 'VISUALIZADOR'],
  
  // Alunos
  'edit_aluno': ['ADMIN', 'GESTOR'],
  'delete_aluno': ['ADMIN'],
  'view_aluno': ['ADMIN', 'GESTOR', 'VISUALIZADOR'],
  
  // Configurações
  'edit_config': ['ADMIN'],
  'view_config': ['ADMIN'],
  
  // Publicações
  'create_publicacao': ['ADMIN'],
  'edit_publicacao': ['ADMIN'],
  'delete_publicacao': ['ADMIN'],
  'view_publicacao': ['ADMIN', 'GESTOR', 'VISUALIZADOR'],
};

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function getPageRoles(pathname: string): UserRole[] | null {
  // Verificar correspondência exata
  if (pagePermissions[pathname]) {
    return pagePermissions[pathname];
  }
  
  // Verificar correspondência por prefixo
  for (const [route, roles] of Object.entries(pagePermissions)) {
    if (pathname.startsWith(route) && route !== '/') {
      return roles;
    }
  }
  
  return null;
}
import useSWR from 'swr';
import { useMemo } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Configurações de cache por endpoint
const CACHE_CONFIGS = {
  '/api/dashboard/matriculas/stats': {
    dedupingInterval: 120000, // 2 minutos
    revalidateOnFocus: false,
    refreshInterval: 120000,
  },
  '/api/dashboard/matriculas/ultimas': {
    dedupingInterval: 60000, // 1 minuto
    revalidateOnFocus: false,
    refreshInterval: 60000,
  },
  '/api/dashboard/alunos/stats': {
    dedupingInterval: 120000,
    revalidateOnFocus: false,
    refreshInterval: 120000,
  },
  '/api/cursos': {
    dedupingInterval: 300000, // 5 minutos
    revalidateOnFocus: false,
    refreshInterval: 300000,
  },
  '/api/turmas': {
    dedupingInterval: 300000,
    revalidateOnFocus: false,
    refreshInterval: 300000,
  },
  '/api/dashboard/inscricoes/stats': {
    dedupingInterval: 120000,
    revalidateOnFocus: false,
    refreshInterval: 120000,
  },
  '/api/dashboard/inscricoes/ultimas': {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    refreshInterval: 60000,
  },
};

export function useDashboardData() {
  // Carregar todos os dados em paralelo
  const { data: matriculasStats, isLoading: loadingMatriculasStats } = useSWR(
    '/api/dashboard/matriculas/stats',
    fetcher,
    CACHE_CONFIGS['/api/dashboard/matriculas/stats']
  );

  const { data: matriculasUltimas, isLoading: loadingMatriculasUltimas } = useSWR(
    '/api/dashboard/matriculas/ultimas',
    fetcher,
    CACHE_CONFIGS['/api/dashboard/matriculas/ultimas']
  );

  const { data: alunosStats, isLoading: loadingAlunosStats } = useSWR(
    '/api/dashboard/alunos/stats',
    fetcher,
    CACHE_CONFIGS['/api/dashboard/alunos/stats']
  );

  const { data: cursos, isLoading: loadingCursos } = useSWR(
    '/api/cursos',
    fetcher,
    CACHE_CONFIGS['/api/cursos']
  );

  const { data: turmas, isLoading: loadingTurmas } = useSWR(
    '/api/turmas',
    fetcher,
    CACHE_CONFIGS['/api/turmas']
  );

  const { data: inscricoesStats, isLoading: loadingInscricoesStats } = useSWR(
    '/api/dashboard/inscricoes/stats',
    fetcher,
    CACHE_CONFIGS['/api/dashboard/inscricoes/stats']
  );

  const { data: inscricoesUltimas, isLoading: loadingInscricoesUltimas } = useSWR(
    '/api/dashboard/inscricoes/ultimas',
    fetcher,
    CACHE_CONFIGS['/api/dashboard/inscricoes/ultimas']
  );

  const isLoading = 
    loadingMatriculasStats || 
    loadingMatriculasUltimas || 
    loadingAlunosStats || 
    loadingCursos || 
    loadingTurmas || 
    loadingInscricoesStats || 
    loadingInscricoesUltimas;

  return useMemo(() => ({
    matriculasStats: matriculasStats || { total: 0, ativas: 0, concluidas: 0, canceladas: 0, pendentes: 0 },
    matriculasUltimas: matriculasUltimas || [],
    alunosStats: alunosStats || { total: 0, ativos: 0, inativos: 0, formados: 0 },
    cursos: cursos || [],
    turmas: turmas || [],
    inscricoesStats: inscricoesStats || { total: 0, pendentes: 0, aprovadas: 0, rejeitadas: 0 },
    inscricoesUltimas: inscricoesUltimas || [],
    isLoading,
  }), [
    matriculasStats,
    matriculasUltimas,
    alunosStats,
    cursos,
    turmas,
    inscricoesStats,
    inscricoesUltimas,
    isLoading,
  ]);
}
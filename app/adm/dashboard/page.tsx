// app/adm/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  UserCheck, 
  ClipboardList, 
  Users2Icon, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  GraduationCap,
  PieChart,
  Activity,
} from "lucide-react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
} from "chart.js";
import { toast } from "sonner";

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

// Tipos
interface DashboardStats {
  totalInscricoes: number;
  inscricoesPendentes: number;
  inscricoesAprovadas: number;
  inscricoesRejeitadas: number;
  totalMatriculas: number;
  matriculasAtivas: number;
  matriculasConcluidas: number;
  matriculasCanceladas: number;
  totalAlunos: number;
  totalCursos: number;
  totalTurmas: number;
  vagasDisponiveis: number;
  vagasOcupadas: number;
  alunosPorCurso: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  inscricoesPorMes: {
    labels: string[];
    dados: number[];
  };
  matriculasPorMes: {
    labels: string[];
    dados: number[];
  };
  statusDistribuicao: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  ultimasInscricoes: Array<{
    id: number;
    nome: string;
    curso: string;
    data: string;
    status: string;
  }>;
  ultimasMatriculas: Array<{
    id: number;
    nome: string;
    curso: string;
    data: string;
    status: string;
  }>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInscricoes: 0,
    inscricoesPendentes: 0,
    inscricoesAprovadas: 0,
    inscricoesRejeitadas: 0,
    totalMatriculas: 0,
    matriculasAtivas: 0,
    matriculasConcluidas: 0,
    matriculasCanceladas: 0,
    totalAlunos: 0,
    totalCursos: 0,
    totalTurmas: 0,
    vagasDisponiveis: 0,
    vagasOcupadas: 0,
    alunosPorCurso: {
      labels: [],
      data: [],
      colors: []
    },
    inscricoesPorMes: {
      labels: [],
      dados: []
    },
    matriculasPorMes: {
      labels: [],
      dados: []
    },
    statusDistribuicao: {
      labels: [],
      data: [],
      colors: []
    },
    ultimasInscricoes: [],
    ultimasMatriculas: []
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    const toastId = toast.loading("Carregando dados do dashboard...");

    try {
      // Buscar dados em paralelo
      const [
        inscricoesRes,
        matriculasRes,
        alunosRes,
        cursosRes,
        turmasRes,
        inscricoesPorMesRes,
        matriculasPorMesRes,
        ultimasInscricoesRes,
        ultimasMatriculasRes
      ] = await Promise.all([
        fetch("/api/dashboard/inscricoes/stats"),
        fetch("/api/dashboard/matriculas/stats"),
        fetch("/api/dashboard/alunos/stats"),
        fetch("/api/cursos"),
        fetch("/api/turmas"),
        fetch("/api/dashboard/inscricoes/por-mes"),
        fetch("/api/dashboard/matriculas/por-mes"),
        fetch("/api/dashboard/inscricoes/ultimas"),
        fetch("/api/dashboard/matriculas/ultimas")
      ]);

      const [
        inscricoesStats,
        matriculasStats,
        alunosStats,
        cursos,
        turmas,
        inscricoesPorMes,
        matriculasPorMes,
        ultimasInscricoes,
        ultimasMatriculas
      ] = await Promise.all([
        inscricoesRes.json(),
        matriculasRes.json(),
        alunosRes.json(),
        cursosRes.json(),
        turmasRes.json(),
        inscricoesPorMesRes.json(),
        matriculasPorMesRes.json(),
        ultimasInscricoesRes.json(),
        ultimasMatriculasRes.json()
      ]);

      // Processar alunos por curso
      const alunosPorCursoData = cursos.map((curso: any) => ({
        label: curso.nome,
        quantidade: alunosStats.porCurso[curso.nome] || 0,
        color: getCorCurso(curso.nome)
      }));

      // Processar distribuição de status
      const statusDistribuicaoData = [
        { label: "Pendentes", data: inscricoesStats.pendentes, color: "rgba(234, 179, 8, 0.7)" },
        { label: "Aprovadas", data: inscricoesStats.aprovadas, color: "rgba(34, 197, 94, 0.7)" },
        { label: "Rejeitadas", data: inscricoesStats.rejeitadas, color: "rgba(239, 68, 68, 0.7)" }
      ];

      setStats({
        totalInscricoes: inscricoesStats.total,
        inscricoesPendentes: inscricoesStats.pendentes,
        inscricoesAprovadas: inscricoesStats.aprovadas,
        inscricoesRejeitadas: inscricoesStats.rejeitadas,
        totalMatriculas: matriculasStats.total,
        matriculasAtivas: matriculasStats.ativas,
        matriculasConcluidas: matriculasStats.concluidas,
        matriculasCanceladas: matriculasStats.canceladas,
        totalAlunos: alunosStats.total,
        totalCursos: cursos.length,
        totalTurmas: turmas.length,
        vagasDisponiveis: turmas.reduce((acc: number, t: any) => acc + t.vagasDisponiveis, 0),
        vagasOcupadas: turmas.reduce((acc: number, t: any) => acc + (t.vagasTotais - t.vagasDisponiveis), 0),
        alunosPorCurso: {
          labels: alunosPorCursoData.map((d:any) => d.label),
          data: alunosPorCursoData.map((d:any) => d.quantidade),
          colors: alunosPorCursoData.map((d:any) => d.color)
        },
        inscricoesPorMes: {
          labels: inscricoesPorMes.map((item: any) => item.mes),
          dados: inscricoesPorMes.map((item: any) => item.total)
        },
        matriculasPorMes: {
          labels: matriculasPorMes.map((item: any) => item.mes),
          dados: matriculasPorMes.map((item: any) => item.total)
        },
        statusDistribuicao: {
          labels: statusDistribuicaoData.map(d => d.label),
          data: statusDistribuicaoData.map(d => d.data),
          colors: statusDistribuicaoData.map(d => d.color)
        },
        ultimasInscricoes: ultimasInscricoes.map((i: any) => ({
          id: i.id,
          nome: i.nome,
          curso: i.curso?.nome || "-",
          data: new Date(i.createdAt).toLocaleDateString(),
          status: i.status?.nome || "PENDENTE"
        })),
        ultimasMatriculas: ultimasMatriculas.map((m: any) => ({
          id: m.id,
          nome: m.inscricao?.nome || "-",
          curso: m.inscricao?.curso?.nome || "-",
          data: new Date(m.createdAt).toLocaleDateString(),
          status: m.status?.nome || "PENDENTE"
        }))
      });

      toast.success("Dados carregados!", { id: toastId });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar dados", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const getCorCurso = (nome: string) => {
    const cores: Record<string, string> = {
      "INFORMATICA": "rgba(59, 130, 246, 0.7)",
      "ELECTRICIDADE": "rgba(234, 179, 8, 0.7)",
      "MAQUINAS_E_MOTORES": "rgba(239, 68, 68, 0.7)",
      "CONSTRUCAO_CIVIL": "rgba(16, 185, 129, 0.7)"
    };
    return cores[nome] || "rgba(107, 114, 128, 0.7)";
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon:any }> = {
      "APROVADA": { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
      "ATIVA": { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
      "PENDENTE": { color: "bg-yellow-100 text-yellow-700", icon: Clock },
      "REJEITADA": { color: "bg-red-100 text-red-700", icon: XCircle },
      "CANCELADA": { color: "bg-red-100 text-red-700", icon: XCircle },
      "CONCLUIDA": { color: "bg-blue-100 text-blue-700", icon: CheckCircle2 }
    };
    const item = config[status];
    if (!item) return null;
    const Icon = item.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${item.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Visão geral do sistema</p>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Inscrições</p>
                  <p className="text-2xl font-bold">{stats.totalInscricoes}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-green-600">✓ {stats.inscricoesAprovadas} aprovadas</span>
                    <span className="text-xs text-yellow-600">⏳ {stats.inscricoesPendentes} pendentes</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Matrículas</p>
                  <p className="text-2xl font-bold">{stats.totalMatriculas}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-green-600">✓ {stats.matriculasAtivas} ativas</span>
                    <span className="text-xs text-blue-600">📖 {stats.matriculasConcluidas} concluídas</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Alunos Ativos</p>
                  <p className="text-2xl font-bold">{stats.totalAlunos}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.vagasOcupadas} de {stats.vagasOcupadas + stats.vagasDisponiveis} vagas ocupadas
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users2Icon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cursos & Turmas</p>
                  <p className="text-2xl font-bold">{stats.totalCursos}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.totalTurmas} turmas ativas
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <GraduationCap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Alunos por Curso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-500" />
                Alunos por Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.alunosPorCurso.data.some(v => v > 0) ? (
                <div className="h-64">
                  <Doughnut
                    data={{
                      labels: stats.alunosPorCurso.labels,
                      datasets: [{
                        data: stats.alunosPorCurso.data,
                        backgroundColor: stats.alunosPorCurso.colors,
                        borderWidth: 0,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "bottom" },
                        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} alunos` } }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status das Inscrições */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                Status das Inscrições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar
                  data={{
                    labels: stats.statusDistribuicao.labels,
                    datasets: [{
                      label: "Quantidade",
                      data: stats.statusDistribuicao.data,
                      backgroundColor: stats.statusDistribuicao.colors,
                      borderRadius: 8,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" } }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evolução Mensal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Inscrições por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={{
                    labels: stats.inscricoesPorMes.labels,
                    datasets: [{
                      label: "Inscrições",
                      data: stats.inscricoesPorMes.dados,
                      borderColor: "rgb(59, 130, 246)",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      fill: true,
                      tension: 0.4,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" } }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Matrículas por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={{
                    labels: stats.matriculasPorMes.labels,
                    datasets: [{
                      label: "Matrículas",
                      data: stats.matriculasPorMes.dados,
                      borderColor: "rgb(34, 197, 94)",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      fill: true,
                      tension: 0.4,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" } }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Últimas Inscrições e Matrículas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-orange-500" />
                Últimas Inscrições
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.ultimasInscricoes.length > 0 ? (
                <div className="space-y-3">
                  {stats.ultimasInscricoes.slice(0, 5).map(inscricao => (
                    <div key={inscricao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{inscricao.nome}</p>
                        <p className="text-sm text-gray-500">{inscricao.curso}</p>
                        <p className="text-xs text-gray-400">{inscricao.data}</p>
                      </div>
                      {getStatusBadge(inscricao.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma inscrição recente</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-500" />
                Últimas Matrículas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.ultimasMatriculas.length > 0 ? (
                <div className="space-y-3">
                  {stats.ultimasMatriculas.slice(0, 5).map(matricula => (
                    <div key={matricula.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{matricula.nome}</p>
                        <p className="text-sm text-gray-500">{matricula.curso}</p>
                        <p className="text-xs text-gray-400">{matricula.data}</p>
                      </div>
                      {getStatusBadge(matricula.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma matrícula recente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
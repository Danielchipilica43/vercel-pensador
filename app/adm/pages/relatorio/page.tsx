// app/adm/pages/relatorio/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Download,
  FileText,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  LineChart,
  Printer,
  Filter,
  X,
  Loader2,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileBarChart,
  FilePieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Tipos
interface RelatorioData {
  alunosPorCurso: Array<{ curso: string; quantidade: number }>;
  alunosPorTurma: Array<{ turma: string; quantidade: number }>;
  inscricoesPorStatus: Array<{ status: string; quantidade: number }>;
  matriculasPorStatus: Array<{ status: string; quantidade: number }>;
  inscricoesPorMes: Array<{ mes: string; total: number }>;
  matriculasPorMes: Array<{ mes: string; total: number }>;
  pagamentosPorMes: Array<{ mes: string; total: number }>;
  desempenhoCursos: Array<{
    curso: string;
    inscritos: number;
    matriculados: number;
    taxa: number;
  }>;
  ultimosAlunos: Array<{
    id: number;
    nome: string;
    curso: string;
    dataMatricula: string;
    status: string;
  }>;
  resumo: {
    totalInscricoes: number;
    totalMatriculas: number;
    totalAlunos: number;
    totalCursos: number;
    totalTurmas: number;
    taxaAprovacao: number;
    mediaAlunosPorTurma: number;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec489a", "#06b6d4", "#84cc16"];

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [tipoRelatorio, setTipoRelatorio] = useState("geral");
  const [cursoFiltro, setCursoFiltro] = useState<string>("");
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [dados, setDados] = useState<RelatorioData>({
    alunosPorCurso: [],
    alunosPorTurma: [],
    inscricoesPorStatus: [],
    matriculasPorStatus: [],
    inscricoesPorMes: [],
    matriculasPorMes: [],
    pagamentosPorMes: [],
    desempenhoCursos: [],
    ultimosAlunos: [],
    resumo: {
      totalInscricoes: 0,
      totalMatriculas: 0,
      totalAlunos: 0,
      totalCursos: 0,
      totalTurmas: 0,
      taxaAprovacao: 0,
      mediaAlunosPorTurma: 0,
    },
  });

  const [cursos, setCursos] = useState<Array<{ id: number; nome: string }>>([]);

  useEffect(() => {
    carregarDados();
    carregarCursos();
  }, []);

  const carregarCursos = async () => {
    try {
      const res = await fetch("/api/cursos");
      const data = await res.json();
      setCursos(data);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    }
  };

  const carregarDados = async () => {
    setLoading(true);
    const toastId = toast.loading("Gerando relatório...");

    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append("dataInicio", dataInicio.toISOString());
      if (dataFim) params.append("dataFim", dataFim.toISOString());
      if (cursoFiltro) params.append("curso", cursoFiltro);
      if (statusFiltro) params.append("status", statusFiltro);

      const res = await fetch(`/api/relatorios?${params.toString()}`);
      const data = await res.json();

      setDados(data);
      toast.success("Relatório gerado com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
      toast.error("Erro ao gerar relatório", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = (formato: "csv" | "pdf" | "excel") => {
    toast.info(`Exportando em ${formato.toUpperCase()}...`);
    // Implementar lógica de exportação
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleFiltrar = () => {
    carregarDados();
  };

  const handleLimparFiltros = () => {
    setDataInicio(undefined);
    setDataFim(undefined);
    setCursoFiltro("");
    setStatusFiltro("");
    carregarDados();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      APROVADA: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Aprovada" },
      ATIVA: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Ativa" },
      PENDENTE: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pendente" },
      REJEITADA: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejeitada" },
      CANCELADA: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Cancelada" },
      CONCLUIDA: { color: "bg-blue-100 text-blue-700", icon: CheckCircle2, label: "Concluída" },
    };
    const item = config[status];
    if (!item) return <Badge variant="outline">{status}</Badge>;
    const Icon = item.icon;
    return (
      <Badge variant="outline" className={`${item.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {item.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Gerando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
            <p className="text-gray-500 mt-1">
              Análise detalhada dos dados do sistema
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button
              variant="outline"
              onClick={handleImprimir}
              className="border-gray-300"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportar("excel")}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportar("csv")}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="print:hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Período de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      locale={pt}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Período de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      locale={pt}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Curso</Label>
                <Select value={cursoFiltro} onValueChange={setCursoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os cursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os cursos</SelectItem>
                    {cursos.map(curso => (
                      <SelectItem key={curso.id} value={curso.nome}>
                        {curso.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="ATIVA">Ativa</SelectItem>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="APROVADA">Aprovada</SelectItem>
                    <SelectItem value="REJEITADA">Rejeitada</SelectItem>
                    <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleLimparFiltros}>
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button onClick={handleFiltrar} className="bg-orange-500 hover:bg-orange-600">
                <Filter className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Inscrições</p>
                <p className="text-2xl font-bold">{dados.resumo.totalInscricoes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Matrículas</p>
                <p className="text-2xl font-bold">{dados.resumo.totalMatriculas}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taxa de Aprovação</p>
                <p className="text-2xl font-bold">{dados.resumo.taxaAprovacao}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Média por Turma</p>
                <p className="text-2xl font-bold">{dados.resumo.mediaAlunosPorTurma}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Relatórios */}
        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1 bg-gray-100">
            <TabsTrigger value="geral" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="cursos" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="alunos" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <LineChart className="w-4 h-4 mr-2" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Financeiro
            </TabsTrigger>
          </TabsList>

          {/* Tab Geral */}
          <TabsContent value="geral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status das Inscrições</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={dados.inscricoesPorStatus}
                        dataKey="quantidade"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {dados.inscricoesPorStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status das Matrículas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={dados.matriculasPorStatus}
                        dataKey="quantidade"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {dados.matriculasPorStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alunos por Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dados.alunosPorCurso}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="curso" />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <Bar dataKey="quantidade" fill="#3b82f6" name="Alunos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Cursos */}
          <TabsContent value="cursos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desempenho dos Cursos</CardTitle>
                <CardDescription>
                  Comparativo entre inscritos e matriculados por curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dados.desempenhoCursos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="curso" />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <Bar dataKey="inscritos" fill="#f59e0b" name="Inscritos" />
                    <Bar dataKey="matriculados" fill="#10b981" name="Matriculados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Conversão por Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dados.desempenhoCursos.map((curso, index) => (
                    <div key={curso.curso} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{curso.curso}</p>
                        <p className="text-sm text-gray-500">
                          {curso.inscritos} inscritos | {curso.matriculados} matriculados
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-700">
                          {curso.taxa}% de conversão
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Alunos */}
          <TabsContent value="alunos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Últimos Alunos Matriculados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium text-gray-500">Nome</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-500">Curso</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-500">Data</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {dados.ultimosAlunos.map(aluno => (
                        <tr key={aluno.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">{aluno.nome}</td>
                          <td className="p-3">{aluno.curso}</td>
                          <td className="p-3 text-gray-500">{aluno.dataMatricula}</td>
                          <td className="p-3"><StatusBadge status={aluno.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alunos por Turma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dados.alunosPorTurma} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="turma" type="category" width={150} />
                    <ReTooltip />
                    <Legend />
                    <Bar dataKey="quantidade" fill="#8b5cf6" name="Alunos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Evolução */}
          <TabsContent value="evolucao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolução de Inscrições</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ReLineChart data={dados.inscricoesPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <ReTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                    </ReLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolução de Matrículas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ReLineChart data={dados.matriculasPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <ReTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
                    </ReLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Financeiro */}
          <TabsContent value="financeiro" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pagamentos por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dados.pagamentosPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <ReTooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="total" fill="#f59e0b" name="Valor" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Total Arrecadado</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(dados.pagamentosPorMes.reduce((acc, m) => acc + m.total, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Média Mensal</span>
                      <span className="text-lg font-semibold">
                        {formatCurrency(dados.pagamentosPorMes.reduce((acc, m) => acc + m.total, 0) / (dados.pagamentosPorMes.length || 1))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>Melhor Mês</span>
                      <span className="text-lg font-semibold text-green-600">
                        {dados.pagamentosPorMes.reduce((max, m) => m.total > max.total ? m : max, { mes: "-", total: 0 }).mes}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
// app/adm/pages/alunos/page.tsx
"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  UserCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  Edit,
  Trash2,
  Printer,
  UserPlus,
  BookOpen,
  Building2,
  Stethoscope,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Tipos
interface Aluno {
  id: number;
  matriculaId: number;
  turmaId: number;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  matricula?: {
    id: number;
    status: string;
    birthDate: string;
    photoUrl: string | null;
    certificateUrl: string | null;
    medicalCertificateUrl: string | null;
    periodo?: string;
  } | null;
  turma?: {
    id: number;
    nome: string;
    curso: string;
    turno: string;
    anoLetivo: string;
    vagasTotais: number;
    vagasDisponiveis: number;
  } | null;
  inscricao?: {
    bi: string;
    nome: string;
    telefone: string;
    email: string;
    endereco: string;
    dataNascimento: string | null;
    curso: string;
    classe: string;
    genero: string;
    statusInscricao: string;
  } | null;
  user?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  ATIVA: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Ativa" },
  CONCLUIDA: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2, label: "Concluída" },
  CANCELADA: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Cancelada" },
  PENDENTE: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock, label: "Pendente" },
};

const cursos = [
  { value: "INFORMATICA", label: "Informática", icon: "💻" },
  { value: "ELECTRICIDADE", label: "Electricidade", icon: "⚡" },
  { value: "MAQUINAS_E_MOTORES", label: "Máquinas e Motores", icon: "🔧" },
  { value: "CONSTRUCAO_CIVIL", label: "Construção Civil", icon: "🏗️" },
];

export default function AlunosAdminPage() {
  const [filtroCurso, setFiltroCurso] = useState<string>("");
  const [filtroTurma, setFiltroTurma] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [busca, setBusca] = useState<string>("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogEditar, setDialogEditar] = useState(false);
  const [dialogExcluir, setDialogExcluir] = useState(false);
  const [editandoAluno, setEditandoAluno] = useState<Aluno | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editTurma, setEditTurma] = useState<string>("");
  const [processando, setProcessando] = useState(false);
  
  const itensPorPagina = 10;

  const { data, mutate, isValidating } = useSWR<Aluno[]>("/api/alunos", fetcher, {
    refreshInterval: 30000,
    onError: (error) => {
      console.error("Erro ao carregar alunos:", error);
      toast.error("Erro ao carregar dados");
    }
  });

  const alunos = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Lista única de turmas para filtro
  const turmasUnicas = useMemo(() => {
    const turmasMap = new Map();
    alunos.forEach(aluno => {
      if (aluno.turma?.nome) {
        turmasMap.set(aluno.turma.nome, aluno.turma);
      }
    });
    return Array.from(turmasMap.values());
  }, [alunos]);

  // Filtrar alunos
  const alunosFiltrados = useMemo(() => {
    return alunos.filter(aluno => {
      const curso = aluno.inscricao?.curso || "";
      const turma = aluno.turma?.nome || "";
      const status = aluno.matricula?.status || "";
      const nomeMatch = aluno.inscricao?.nome?.toLowerCase().includes(busca.toLowerCase()) || false;
      const biMatch = aluno.inscricao?.bi?.toLowerCase().includes(busca.toLowerCase()) || false;

      return (
        (filtroCurso === "" || curso === filtroCurso) &&
        (filtroTurma === "" || turma === filtroTurma) &&
        (filtroStatus === "" || status === filtroStatus) &&
        (busca === "" || nomeMatch || biMatch)
      );
    });
  }, [alunos, filtroCurso, filtroTurma, filtroStatus, busca]);

  const totalPaginas = Math.ceil(alunosFiltrados.length / itensPorPagina);
  const alunosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return alunosFiltrados.slice(inicio, fim);
  }, [alunosFiltrados, paginaAtual]);

  const estatisticas = useMemo(() => {
    return {
      total: alunos.length,
      ativos: alunos.filter(a => a.matricula?.status === "ATIVA").length,
      concluidos: alunos.filter(a => a.matricula?.status === "CONCLUIDA").length,
      cancelados: alunos.filter(a => a.matricula?.status === "CANCELADA").length,
      porCurso: cursos.map(curso => ({
        ...curso,
        quantidade: alunos.filter(a => a.inscricao?.curso === curso.value).length
      })),
    };
  }, [alunos]);

  const handleLimparFiltros = () => {
    setFiltroCurso("");
    setFiltroTurma("");
    setFiltroStatus("");
    setBusca("");
    setPaginaAtual(1);
    toast.success("Filtros limpos");
  };

  const handleEditarAluno = (aluno: Aluno) => {
    setEditandoAluno(aluno);
    setEditStatus(aluno.matricula?.status || "");
    setEditTurma(aluno.turma?.id?.toString() || "");
    setDialogEditar(true);
  };

  const handleSalvarEdicao = async () => {
    if (!editandoAluno) return;
    
    setProcessando(true);
    const toastId = toast.loading("Salvando alterações...");

    try {
      const response = await fetch(`/api/alunos/${editandoAluno.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: editStatus,
          turmaId: editTurma ? parseInt(editTurma) : undefined
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar aluno");
      }

      toast.success("Aluno atualizado com sucesso!", { id: toastId });
      mutate();
      setDialogEditar(false);
    } catch (error) {
      toast.error("Erro ao atualizar aluno", {
        id: toastId,
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleExcluirAluno = async () => {
    if (!alunoSelecionado) return;
    
    setProcessando(true);
    const toastId = toast.loading("Excluindo aluno...");

    try {
      const response = await fetch(`/api/alunos/${alunoSelecionado.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir aluno");
      }

      toast.success("Aluno excluído com sucesso!", { id: toastId });
      mutate();
      setDialogExcluir(false);
      setDialogAberto(false);
    } catch (error) {
      toast.error("Erro ao excluir aluno", {
        id: toastId,
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleExportarCSV = () => {
    if (alunosFiltrados.length === 0) return;

    const csv = [
      ["ID", "BI", "Nome", "Curso", "Turma", "Turno", "Status", "Telefone", "Email", "Data Matrícula"],
      ...alunosFiltrados.map(a => [
        a.id,
        a.inscricao?.bi || "",
        a.inscricao?.nome || "",
        a.inscricao?.curso || "",
        a.turma?.nome || "",
        a.turma?.turno || "",
        a.matricula?.status || "",
        a.inscricao?.telefone || "",
        a.inscricao?.email || "",
        new Date(a.createdAt).toLocaleDateString(),
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alunos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast.success("Dados exportados com sucesso!");
  };

  const handleImprimir = () => {
    window.print();
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return null;
    const config = statusConfig[status];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1 px-3 py-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isValidating && alunos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-6 print:p-0">
        <div className="max-w-7xl mx-auto space-y-6 print:max-w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Alunos</h1>
              <p className="text-gray-500 mt-1">
                Gerencie todos os alunos matriculados no sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleImprimir}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Imprimir lista</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleExportarCSV}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    disabled={alunosFiltrados.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exportar dados</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Alunos</p>
                  <p className="text-2xl font-bold">{estatisticas.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Matrículas Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.ativos}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Concluídos</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.concluidos}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cancelados</p>
                  <p className="text-2xl font-bold text-red-600">{estatisticas.cancelados}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribuição por curso */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Distribuição por Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {estatisticas.porCurso.map(curso => (
                  <div key={curso.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{curso.icon}</span>
                      <span className="text-sm font-medium">{curso.label}</span>
                    </div>
                    <Badge variant="secondary">{curso.quantidade}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filtros */}
          <Card className="print:hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Pesquisar por nome ou BI..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroCurso} onValueChange={setFiltroCurso}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os cursos</SelectItem>
                    {cursos.map(curso => (
                      <SelectItem key={curso.value} value={curso.value}>
                        {curso.icon} {curso.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as turmas</SelectItem>
                    {turmasUnicas.map(turma => (
                      <SelectItem key={turma.id} value={turma.nome}>
                        {turma.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="ATIVA">Ativas</SelectItem>
                    <SelectItem value="CONCLUIDA">Concluídas</SelectItem>
                    <SelectItem value="CANCELADA">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                {(filtroCurso !== "todos" || filtroTurma !== "todos" || filtroStatus !== "todos" || busca) && (
                  <Button variant="ghost" size="icon" onClick={handleLimparFiltros}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Mostrando {alunosPaginados.length} de {alunosFiltrados.length} alunos
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de alunos */}
          {alunosPaginados.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Nenhum aluno encontrado
                </h3>
                <p className="text-gray-500">
                  {alunos.length === 0
                    ? "Não há alunos cadastrados no momento."
                    : "Tente ajustar os filtros da pesquisa."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Aluno</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">BI</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Curso</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Turma</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Matrícula</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {alunosPaginados.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {aluno.matricula?.photoUrl ? (
                              <Image
                                src={aluno.matricula.photoUrl}
                                alt={aluno.inscricao?.nome || "Aluno"}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <UserCircle className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{aluno.inscricao?.nome || "-"}</p>
                              <p className="text-xs text-gray-500">ID: {aluno.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono">
                            {aluno.inscricao?.bi || "-"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {cursos.find(c => c.value === aluno.inscricao?.curso)?.icon}
                            <span>{aluno.inscricao?.curso || "-"}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            {aluno.turma?.nome || "-"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={aluno.matricula?.status} />
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {formatDate(aluno.createdAt)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setAlunoSelecionado(aluno);
                                    setDialogAberto(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalhes</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditarAluno(aluno)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar aluno</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setAlunoSelecionado(aluno);
                                    setDialogExcluir(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Excluir aluno</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="p-4 border-t flex items-center justify-between print:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Modal de detalhes do aluno */}
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-orange-500" />
                  Detalhes do Aluno
                </DialogTitle>
                <DialogDescription>
                  Informações completas do aluno
                </DialogDescription>
              </DialogHeader>

              {alunoSelecionado && (
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-4">
                    {alunoSelecionado.matricula?.photoUrl ? (
                      <Image
                        src={alunoSelecionado.matricula.photoUrl}
                        alt={alunoSelecionado.inscricao?.nome || "Aluno"}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserCircle className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{alunoSelecionado.inscricao?.nome || "-"}</h3>
                      <p className="text-sm text-gray-500">ID: {alunoSelecionado.id}</p>
                      <p className="text-xs text-gray-400">{alunoSelecionado.inscricao?.bi}</p>
                    </div>
                  </div>

                  <Tabs defaultValue="pessoal" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                      <TabsTrigger value="academico">Dados Académicos</TabsTrigger>
                      <TabsTrigger value="documentos">Documentos</TabsTrigger>
                      <TabsTrigger value="matricula">Matrícula</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pessoal" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Nome completo</Label>
                          <p className="font-medium">{alunoSelecionado.inscricao?.nome || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">BI</Label>
                          <p className="font-mono">{alunoSelecionado.inscricao?.bi || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Data de Nascimento</Label>
                          <p>{alunoSelecionado.inscricao?.dataNascimento ? formatDate(alunoSelecionado.inscricao.dataNascimento) : "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Gênero</Label>
                          <p>{alunoSelecionado.inscricao?.genero || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Telefone</Label>
                          <p className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {alunoSelecionado.inscricao?.telefone || "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Email</Label>
                          <p className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {alunoSelecionado.inscricao?.email || "-"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500">Endereço</Label>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {alunoSelecionado.inscricao?.endereco || "-"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="academico" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Curso</Label>
                          <p className="font-medium">{alunoSelecionado.inscricao?.curso || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Classe</Label>
                          <p>{alunoSelecionado.inscricao?.classe || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Turma</Label>
                          <p>{alunoSelecionado.turma?.nome || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Turno</Label>
                          <p>{alunoSelecionado.turma?.turno || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Ano Letivo</Label>
                          <p>{alunoSelecionado.turma?.anoLetivo || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Status</Label>
                          <StatusBadge status={alunoSelecionado.matricula?.status} />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="documentos" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-orange-500" />
                              Foto 3x4
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            {alunoSelecionado.matricula?.photoUrl ? (
                              <div className="relative w-full h-48">
                                <Image
                                  src={alunoSelecionado.matricula.photoUrl}
                                  alt="Foto do aluno"
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">Não anexada</p>
                            )}
                            {alunoSelecionado.matricula?.photoUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => window.open(alunoSelecionado.matricula!.photoUrl!, '_blank')}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Visualizar
                              </Button>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <FileText className="w-4 h-4 text-orange-500" />
                              Certificado
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            {alunoSelecionado.matricula?.certificateUrl ? (
                              <div className="text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => window.open(alunoSelecionado.matricula!.certificateUrl!, '_blank')}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Visualizar
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">Não anexado</p>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-orange-500" />
                              Atestado Médico
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            {alunoSelecionado.matricula?.medicalCertificateUrl ? (
                              <div className="text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => window.open(alunoSelecionado.matricula!.medicalCertificateUrl!, '_blank')}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Visualizar
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">Não anexado</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="matricula" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">ID Matrícula</Label>
                          <p>{alunoSelecionado.matricula?.id || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Data da Matrícula</Label>
                          <p>{formatDate(alunoSelecionado.createdAt)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Período</Label>
                          <p>{alunoSelecionado.matricula?.periodo || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Data de Nascimento</Label>
                          <p>{alunoSelecionado.matricula?.birthDate ? formatDate(alunoSelecionado.matricula.birthDate) : "-"}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500">Status da Matrícula</Label>
                          <StatusBadge status={alunoSelecionado.matricula?.status} />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Edição */}
          <Dialog open={dialogEditar} onOpenChange={setDialogEditar}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-orange-500" />
                  Editar Aluno
                </DialogTitle>
                <DialogDescription>
                  Altere as informações do aluno
                </DialogDescription>
              </DialogHeader>
              {editandoAluno && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={editandoAluno.inscricao?.nome || ""} disabled />
                  </div>
                  <div>
                    <Label>BI</Label>
                    <Input value={editandoAluno.inscricao?.bi || ""} disabled />
                  </div>
                  <div>
                    <Label>Status da Matrícula</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVA">Ativa</SelectItem>
                        <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                        <SelectItem value="CANCELADA">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Turma</Label>
                    <Select value={editTurma} onValueChange={setEditTurma}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmasUnicas.map(turma => (
                          <SelectItem key={turma.id} value={turma.id.toString()}>
                            {turma.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogEditar(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleSalvarEdicao}
                  disabled={processando}
                >
                  {processando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Exclusão */}
          <Dialog open={dialogExcluir} onOpenChange={setDialogExcluir}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Excluir Aluno
                </DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              {alunoSelecionado && (
                <div className="py-4">
                  <p className="font-medium">{alunoSelecionado.inscricao?.nome}</p>
                  <p className="text-sm text-gray-500">{alunoSelecionado.inscricao?.bi}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogExcluir(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleExcluirAluno}
                  disabled={processando}
                >
                  {processando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}
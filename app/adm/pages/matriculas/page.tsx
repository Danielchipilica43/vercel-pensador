// app/adm/pages/matriculas/page.tsx
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

// Importação do serviço de e-mail
import { enviarEmail, gerarConteudoAprovacao, gerarConteudoRejeicao } from "@/lib/email-service";

// Tipos
type StatusMatricula = "PENDENTE" | "ATIVA" | "CONCLUIDA" | "CANCELADA";

interface Matricula {
  id: number;
  status: StatusMatricula;
  birthDate: string;
  photoUrl: string | null;
  certificateUrl: string | null;
  medicalCertificateUrl: string | null;
  periodo?: string;
  pagamento?: {
    id: number;
    valor: number;
    forma: string;
    status: string;
    referencia?: string;
    comprovativoUrl?: string;
  } | null;
  inscricao?: {
    id: number;
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
  aluno?: {
    id: number;
    turma?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const statusConfig: Record<StatusMatricula, { color: string; icon: React.ElementType; label: string }> = {
  PENDENTE: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock, label: "Pendente" },
  ATIVA: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Ativa" },
  CONCLUIDA: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2, label: "Concluída" },
  CANCELADA: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Cancelada" },
};

const cursos = [
  { value: "INFORMATICA", label: "Informática", icon: "💻" },
  { value: "ELECTRICIDADE", label: "Electricidade", icon: "⚡" },
  { value: "MAQUINAS_E_MOTORES", label: "Máquinas e Motores", icon: "🔧" },
  { value: "CONSTRUCAO_CIVIL", label: "Construção Civil", icon: "🏗️" },
];

export default function MatriculasAdminPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCurso, setFiltroCurso] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState<Matricula | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogRejeitar, setDialogRejeitar] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [processando, setProcessando] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState<{ [key: number]: boolean }>({});
  
  const itensPorPagina = 10;
 
  const { data, mutate, isValidating } = useSWR<Matricula[]>("/api/admin/matriculas", fetcher, {
    refreshInterval: 10000,
    onError: (error) => {
      console.error("Erro ao carregar matrículas:", error);
      toast.error("Erro ao carregar dados");
    }
  });

  // Garantir que data é array
  const matriculas = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Filtrar matrículas
  const matriculasFiltradas = useMemo(() => {
    return matriculas.filter(matricula => {
      const curso = matricula.inscricao?.curso || "";
      const status = matricula.status;
      const nomeMatch = matricula.inscricao?.nome?.toLowerCase().includes(busca.toLowerCase()) || false;
      const biMatch = matricula.inscricao?.bi?.toLowerCase().includes(busca.toLowerCase()) || false;

      return (
        (filtroStatus === "todos" || status === filtroStatus) &&
        (filtroCurso === "todos" || curso === filtroCurso) &&
        (busca === "" || nomeMatch || biMatch)
      );
    });
  }, [matriculas, filtroStatus, filtroCurso, busca]);

  // Paginação
  const totalPaginas = Math.ceil(matriculasFiltradas.length / itensPorPagina);
  const matriculasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return matriculasFiltradas.slice(inicio, fim);
  }, [matriculasFiltradas, paginaAtual]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    return {
      total: matriculas.length,
      pendentes: matriculas.filter(m => m.status === "PENDENTE").length,
      ativas: matriculas.filter(m => m.status === "ATIVA").length,
      concluidas: matriculas.filter(m => m.status === "CONCLUIDA").length,
      canceladas: matriculas.filter(m => m.status === "CANCELADA").length,
    };
  }, [matriculas]);

  // Handlers
  const handleLimparFiltros = () => {
    setFiltroStatus("todos");
    setFiltroCurso("todos");
    setBusca("");
    setPaginaAtual(1);
    toast.success("Filtros limpos");
  };

  // Handler para aprovar matrícula com envio de e-mail
  const handleAprovar = async (id: number) => {
    setProcessando(true);
    setEnviandoEmail(prev => ({ ...prev, [id]: true }));
    const toastId = toast.loading("Aprovando matrícula e enviando notificação...");

    try {
      // Buscar dados da matrícula atual
      const matricula = matriculas.find(m => m.id === id);
      
      if (!matricula?.inscricao?.email) {
        toast.error("Aluno não possui e-mail cadastrado", { id: toastId });
        return;
      }

      // 1. Chamar API para aprovar a matrícula
      const res = await fetch(`/api/admin/matriculas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "APROVAR" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao aprovar matrícula");
      }

      // 2. Enviar e-mail de notificação via API do professor
      const emailResult = await enviarEmail({
        to: matricula.inscricao.email,
        subject: "✅ Matrícula Aprovada - Secretaria Acadêmica",
        content: gerarConteudoAprovacao(
          matricula.inscricao.nome,
          matricula.inscricao.curso || "Curso",
          matricula.inscricao.classe || "Classe"
        ),
        provider: "Gmail1",
      });

      if (emailResult.success) {
        toast.success("Matrícula aprovada e e-mail enviado com sucesso!", { id: toastId });
      } else {
        toast.warning("Matrícula aprovada, mas falha ao enviar e-mail", {
          id: toastId,
          description: emailResult.error || "O aluno não foi notificado automaticamente.",
        });
      }

      mutate();
      
      if (matriculaSelecionada?.id === id) {
        setDialogAberto(false);
      }
    } catch (error) {
      toast.error("Erro ao aprovar matrícula", {
        id: toastId,
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setProcessando(false);
      setEnviandoEmail(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handler para rejeitar matrícula com envio de e-mail
  const handleRejeitar = async (id: number) => {
    if (!motivoRejeicao.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }

    setProcessando(true);
    setEnviandoEmail(prev => ({ ...prev, [id]: true }));
    const toastId = toast.loading("Rejeitando matrícula e enviando notificação...");

    try {
      const matricula = matriculas.find(m => m.id === id);
      
      if (!matricula?.inscricao?.email) {
        toast.error("Aluno não possui e-mail cadastrado", { id: toastId });
        return;
      }

      // 1. Chamar API para rejeitar a matrícula
      const res = await fetch(`/api/admin/matriculas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          acao: "REJEITAR",
          observacao: motivoRejeicao 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao rejeitar matrícula");
      }

      // 2. Enviar e-mail de notificação via API do professor
      const emailResult = await enviarEmail({
        to: matricula.inscricao.email,
        subject: "❌ Matrícula Rejeitada - Secretaria Acadêmica",
        content: gerarConteudoRejeicao(
          matricula.inscricao.nome,
          matricula.inscricao.curso || "Curso",
          motivoRejeicao
        ),
        provider: "Gmail1",
      });

      if (emailResult.success) {
        toast.success("Matrícula rejeitada e e-mail enviado", { id: toastId });
      } else {
        toast.warning("Matrícula rejeitada, mas falha ao enviar e-mail", {
          id: toastId,
          description: emailResult.error || "O aluno não foi notificado automaticamente.",
        });
      }

      mutate();
      setDialogRejeitar(false);
      setMotivoRejeicao("");
      
      if (matriculaSelecionada?.id === id) {
        setDialogAberto(false);
      }
    } catch (error) {
      toast.error("Erro ao rejeitar matrícula", {
        id: toastId,
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setProcessando(false);
      setEnviandoEmail(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleExportarCSV = () => {
    if (matriculasFiltradas.length === 0) return;

    const csv = [
      ["ID", "BI", "Nome", "Curso", "Classe", "Status", "Telefone", "Email", "Data Matrícula"],
      ...matriculasFiltradas.map(m => [
        m.id,
        m.inscricao?.bi || "",
        m.inscricao?.nome || "",
        m.inscricao?.curso || "",
        m.inscricao?.classe || "",
        m.status,
        m.inscricao?.telefone || "",
        m.inscricao?.email || "",
        new Date(m.createdAt).toLocaleDateString(),
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matriculas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast.success("Dados exportados com sucesso!");
  };

  const StatusBadge = ({ status }: { status: StatusMatricula }) => {
    const config = statusConfig[status];
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isValidating && matriculas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Matrículas</h1>
              <p className="text-gray-500 mt-1">
                Gerencie todas as matrículas do sistema
              </p>
            </div>
            <Button
              onClick={handleExportarCSV}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
              disabled={matriculasFiltradas.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
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
                  <p className="text-sm text-gray-500">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.ativas}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Concluídas</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.concluidas}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Canceladas</p>
                  <p className="text-2xl font-bold text-red-600">{estatisticas.canceladas}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros - CORRIGIDOS */}
          <Card>
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
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="PENDENTE">Pendentes</SelectItem>
                    <SelectItem value="ATIVA">Ativas</SelectItem>
                    <SelectItem value="CONCLUIDA">Concluídas</SelectItem>
                    <SelectItem value="CANCELADA">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroCurso} onValueChange={setFiltroCurso}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por curso" />
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
                {(filtroStatus !== "todos" || filtroCurso !== "todos" || busca) && (
                  <Button variant="ghost" size="icon" onClick={handleLimparFiltros}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Mostrando {matriculasPaginadas.length} de {matriculasFiltradas.length} matrículas
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de matrículas */}
          {matriculasPaginadas.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Nenhuma matrícula encontrada
                </h3>
                <p className="text-gray-500">
                  {matriculas.length === 0
                    ? "Não há matrículas no momento."
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
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Classe</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Data</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {matriculasPaginadas.map((matricula) => (
                      <tr key={matricula.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {matricula.photoUrl ? (
                              <Image
                                src={matricula.photoUrl}
                                alt={matricula.inscricao?.nome || "Aluno"}
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
                              <p className="font-medium">{matricula.inscricao?.nome || "-"}</p>
                              <p className="text-xs text-gray-500">ID: {matricula.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono">
                            {matricula.inscricao?.bi || "-"}
                          </Badge>
                        </td>
                        <td className="p-3">{matricula.inscricao?.curso || "-"}</td>
                        <td className="p-3">{matricula.inscricao?.classe || "-"}</td>
                        <td className="p-3">
                          <StatusBadge status={matricula.status} />
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {formatDate(matricula.createdAt)}
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
                                    setMatriculaSelecionada(matricula);
                                    setDialogAberto(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalhes</TooltipContent>
                            </Tooltip>

                            {matricula.status === "PENDENTE" && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white h-8"
                                      onClick={() => handleAprovar(matricula.id)}
                                      disabled={processando || enviandoEmail[matricula.id]}
                                    >
                                      {(processando || enviandoEmail[matricula.id]) && (
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      )}
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Aprovar
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Aprovar matrícula</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-8"
                                      onClick={() => {
                                        setMatriculaSelecionada(matricula);
                                        setDialogRejeitar(true);
                                      }}
                                      disabled={processando}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Rejeitar
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Rejeitar matrícula</TooltipContent>
                                </Tooltip>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="p-4 border-t flex items-center justify-between">
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

          {/* Modal de detalhes da matrícula */}
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-500" />
                  Detalhes da Matrícula
                </DialogTitle>
                <DialogDescription>
                  Informações completas da matrícula
                </DialogDescription>
              </DialogHeader>

              {matriculaSelecionada && (
                <div className="space-y-6 py-4">
                  {/* Status e Ações */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status da Matrícula</p>
                      <StatusBadge status={matriculaSelecionada.status} />
                    </div>
                    {matriculaSelecionada.status === "PENDENTE" && (
                      <div className="flex gap-2">
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAprovar(matriculaSelecionada.id)}
                          disabled={processando || enviandoEmail[matriculaSelecionada.id]}
                        >
                          {(processando || enviandoEmail[matriculaSelecionada.id]) && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setDialogAberto(false);
                            setDialogRejeitar(true);
                          }}
                          disabled={processando}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>

                  <Tabs defaultValue="pessoal" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                      <TabsTrigger value="academico">Dados Académicos</TabsTrigger>
                      <TabsTrigger value="documentos">Documentos</TabsTrigger>
                      <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
                    </TabsList>

                    {/* Dados Pessoais */}
                    <TabsContent value="pessoal" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Nome completo</Label>
                          <p className="font-medium">{matriculaSelecionada.inscricao?.nome || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">BI</Label>
                          <p className="font-mono">{matriculaSelecionada.inscricao?.bi || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Data de Nascimento</Label>
                          <p>{matriculaSelecionada.birthDate ? formatDate(matriculaSelecionada.birthDate) : "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Gênero</Label>
                          <p>{matriculaSelecionada.inscricao?.genero || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Telefone</Label>
                          <p className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {matriculaSelecionada.inscricao?.telefone || "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Email</Label>
                          <p className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {matriculaSelecionada.inscricao?.email || "-"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500">Endereço</Label>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {matriculaSelecionada.inscricao?.endereco || "-"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Dados Académicos */}
                    <TabsContent value="academico" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Curso</Label>
                          <p className="font-medium">{matriculaSelecionada.inscricao?.curso || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Classe</Label>
                          <p>{matriculaSelecionada.inscricao?.classe || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Período Letivo</Label>
                          <p>{matriculaSelecionada.periodo || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Status da Inscrição</Label>
                          <Badge variant="outline" className="bg-green-100 text-green-700">
                            {matriculaSelecionada.inscricao?.statusInscricao || "-"}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Data da Matrícula</Label>
                          <p>{formatDate(matriculaSelecionada.createdAt)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Última Atualização</Label>
                          <p>{formatDate(matriculaSelecionada.updatedAt)}</p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Documentos */}
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
                            {matriculaSelecionada.photoUrl ? (
                              <div className="relative w-full h-48">
                                <Image
                                  src={matriculaSelecionada.photoUrl}
                                  alt="Foto do aluno"
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">Não anexada</p>
                            )}
                            {matriculaSelecionada.photoUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => window.open(matriculaSelecionada.photoUrl!, '_blank')}
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
                            {matriculaSelecionada.certificateUrl ? (
                              <div className="text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => window.open(matriculaSelecionada.certificateUrl!, '_blank')}
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
                            {matriculaSelecionada.medicalCertificateUrl ? (
                              <div className="text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => window.open(matriculaSelecionada.medicalCertificateUrl!, '_blank')}
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

                    {/* Pagamento */}
                    <TabsContent value="pagamento" className="space-y-4 pt-4">
                      {matriculaSelecionada.pagamento ? (
                        <Card>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Forma de Pagamento</span>
                              <span className="font-medium">{matriculaSelecionada.pagamento.forma}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Valor</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(matriculaSelecionada.pagamento.valor)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Referência</span>
                              <span className="font-mono text-sm">{matriculaSelecionada.pagamento.referencia || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Status do Pagamento</span>
                              <Badge variant="outline" className={
                                matriculaSelecionada.pagamento.status === "APROVADO" ? "bg-green-100 text-green-700" :
                                matriculaSelecionada.pagamento.status === "PENDENTE" ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                              }>
                                {matriculaSelecionada.pagamento.status}
                              </Badge>
                            </div>
                            {matriculaSelecionada.pagamento.comprovativoUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => window.open(matriculaSelecionada.pagamento!.comprovativoUrl!, '_blank')}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver Comprovativo
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <p className="text-gray-500 text-center py-8">Nenhuma informação de pagamento disponível</p>
                      )}
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

          {/* Modal de Rejeição */}
          <Dialog open={dialogRejeitar} onOpenChange={setDialogRejeitar}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  Rejeitar Matrícula
                </DialogTitle>
                <DialogDescription>
                  Informe o motivo da rejeição para que o candidato possa corrigir.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Motivo da Rejeição *</Label>
                  <Textarea
                    placeholder="Descreva o motivo da rejeição..."
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    rows={4}
                  />
                </div>
                {matriculaSelecionada && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-700">
                        O candidato será notificado sobre esta decisão.
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogRejeitar(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => matriculaSelecionada && handleRejeitar(matriculaSelecionada.id)}
                  disabled={!motivoRejeicao.trim() || processando}
                >
                  {processando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Confirmar Rejeição
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}
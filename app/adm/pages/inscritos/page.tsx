"use client";

import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  User,
  IdCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Inscricao = {
  id: number;
  bi: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  classe: string;
  curso: string;
  status: "PENDENTE" | "APROVADA" | "REJEITADA";
  genero: string;
  dataNascimento?: string;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  data: Inscricao[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
  code?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data: ApiResponse = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Erro ao carregar inscrições");
  }
  
  return data;
};

const statusConfig = {
  PENDENTE: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
    label: "Pendente",
  },
  APROVADA: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
    label: "Aprovada",
  },
  REJEITADA: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    label: "Rejeitada",
  },
};

export default function AdminInscricoesPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [filtroCurso, setFiltroCurso] = useState<string>("");
  const [busca, setBusca] = useState<string>("");
  const [inscricaoSelecionada, setInscricaoSelecionada] = useState<Inscricao | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 50;

  // Buscar dados da API com paginação
  const { data: apiResponse, mutate, isLoading, error } = useSWR<ApiResponse>(
    `/api/listaInscritos?page=${paginaAtual}&limit=${ITENS_POR_PAGINA}`,
    fetcher,
    {
      refreshInterval: 30000, // Atualizar a cada 30 segundos
      revalidateOnFocus: false,
    }
  );

  // Extrair dados da resposta
  const inscricoes = apiResponse?.data || [];
  const pagination = apiResponse?.pagination;

  const atualizarStatus = async (id: number, status: "APROVADA" | "REJEITADA") => {
    const toastId = toast.loading(`A ${status === "APROVADA" ? "aprovar" : "rejeitar"} inscrição...`);

    try {
      const res = await fetch(`/api/listaInscritos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar status");
      }

      toast.success(data.message, {
        id: toastId,
      });

      mutate(); // Atualiza automaticamente a lista

      if (inscricaoSelecionada?.id === id) {
        setInscricaoSelecionada(null);
        setDialogAberto(false);
      }
    } catch (error) {
      toast.error("Erro ao atualizar status", {
        id: toastId,
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  };

  // Filtrar inscrições (apenas no frontend)
  const inscricoesFiltradas = inscricoes.filter(insc => {
    const matchStatus = !filtroStatus || insc.status === filtroStatus;
    const matchCurso = !filtroCurso || insc.curso === filtroCurso;
    const matchBusca = !busca ||
      insc.nome.toLowerCase().includes(busca.toLowerCase()) ||
      insc.bi.toLowerCase().includes(busca.toLowerCase()) ||
      insc.email.toLowerCase().includes(busca.toLowerCase());

    return matchStatus && matchCurso && matchBusca;
  });

  // Estatísticas (baseado em todos os dados, não apenas filtrados)
  const stats = {
    total: inscricoes.length || 0,
    pendentes: inscricoes.filter(i => i.status === "PENDENTE").length || 0,
    aprovadas: inscricoes.filter(i => i.status === "APROVADA").length || 0,
    rejeitadas: inscricoes.filter(i => i.status === "REJEITADA").length || 0,
  };

  const StatusBadge = ({ status }: { status: Inscricao['status'] }) => {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportarCSV = () => {
    if (!inscricoesFiltradas.length) return;

    const csv = [
      ["ID", "BI", "Nome", "Email", "Telefone", "Curso", "Classe", "Gênero", "Status", "Data Inscrição"],
      ...inscricoesFiltradas.map(i => [
        i.id,
        i.bi,
        i.nome,
        i.email,
        i.telefone,
        i.curso,
        i.classe,
        i.genero,
        i.status,
        formatDate(i.createdAt),
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscricoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success("Dados exportados com sucesso!");
  };

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Erro ao carregar inscrições
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {error.message || "Ocorreu um erro ao buscar os dados. Tente novamente."}
            </p>
            <Button onClick={() => mutate()} className="bg-orange-500 hover:bg-orange-600">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !apiResponse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Carregando inscrições...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inscrições</h1>
            <p className="text-gray-500 mt-1">
              Gerencie todas as inscrições pendentes
              {pagination && (
                <span className="ml-2 text-sm text-gray-400">
                  (Página {pagination.page} de {pagination.totalPages})
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={exportarCSV}
            variant="outline"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
            disabled={inscricoesFiltradas.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.aprovadas}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejeitadas}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por nome, BI ou email..."
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
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="PENDENTE">Pendentes</SelectItem>
                  <SelectItem value="APROVADA">Aprovadas</SelectItem>
                  <SelectItem value="REJEITADA">Rejeitadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroCurso} onValueChange={setFiltroCurso}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os cursos</SelectItem>
                  <SelectItem value="INFORMATICA">Informática</SelectItem>
                  <SelectItem value="ELECTRICIDADE">Electricidade</SelectItem>
                  <SelectItem value="MAQUINAS_E_MOTORES">Máquinas e Motores</SelectItem>
                  <SelectItem value="CONSTRUCAO_CIVIL">Construção Civil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>
                Mostrando {inscricoesFiltradas.length} de {inscricoes.length} inscrições
              </span>
              {(filtroStatus || filtroCurso || busca) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroStatus("");
                    setFiltroCurso("");
                    setBusca("");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabela de inscrições */}
        {inscricoesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Nenhuma inscrição encontrada
              </h3>
              <p className="text-gray-500">
                {inscricoes.length === 0
                  ? "Não há inscrições no momento."
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
                    <th className="p-3 text-left text-sm font-medium text-gray-500">ID</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-500">BI</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-500">Nome</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-500">Curso</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-500">Classe</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-500">Data</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inscricoesFiltradas.map((inscricao) => (
                    <tr key={inscricao.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm">{inscricao.id}</td>
                      <td className="p-3 text-sm font-mono">{inscricao.bi}</td>
                      <td className="p-3 text-sm font-medium">{inscricao.nome}</td>
                      <td className="p-3 text-sm">{inscricao.curso}</td>
                      <td className="p-3 text-sm">{inscricao.classe}</td>
                      <td className="p-3 text-sm">
                        <StatusBadge status={inscricao.status} />
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(inscricao.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setInscricaoSelecionada(inscricao);
                              setDialogAberto(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {inscricao.status === "PENDENTE" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white h-8"
                                onClick={() => atualizarStatus(inscricao.id, "APROVADA")}
                              >
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50 h-8"
                                onClick={() => atualizarStatus(inscricao.id, "REJEITADA")}
                              >
                                Rejeitar
                              </Button>
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
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-500">
                  Mostrando {inscricoes.length} de {pagination.total} registros
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Modal de detalhes */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Detalhes da Inscrição
              </DialogTitle>
              <DialogDescription>
                Informações completas do candidato
              </DialogDescription>
            </DialogHeader>

            {inscricaoSelecionada && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status atual</p>
                    <StatusBadge status={inscricaoSelecionada.status} />
                  </div>
                  {inscricaoSelecionada.status === "PENDENTE" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          atualizarStatus(inscricaoSelecionada.id, "APROVADA");
                          setDialogAberto(false);
                        }}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          atualizarStatus(inscricaoSelecionada.id, "REJEITADA");
                          setDialogAberto(false);
                        }}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">ID</Label>
                    <p className="font-medium">{inscricaoSelecionada.id}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">BI</Label>
                    <p className="font-medium font-mono">{inscricaoSelecionada.bi}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs text-gray-500">Nome completo</Label>
                    <p className="font-medium">{inscricaoSelecionada.nome}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {inscricaoSelecionada.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Telefone</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {inscricaoSelecionada.telefone}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Gênero</Label>
                    <p className="font-medium">{inscricaoSelecionada.genero}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Data de inscrição</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(inscricaoSelecionada.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Curso</Label>
                    <p className="font-medium flex items-center gap-2">
                      <BookOpen className="w-3 h-3 text-gray-400" />
                      {inscricaoSelecionada.curso}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Classe</Label>
                    <p className="font-medium flex items-center gap-2">
                      <GraduationCap className="w-3 h-3 text-gray-400" />
                      {inscricaoSelecionada.classe}
                    </p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs text-gray-500">Endereço</Label>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {inscricaoSelecionada.endereco}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
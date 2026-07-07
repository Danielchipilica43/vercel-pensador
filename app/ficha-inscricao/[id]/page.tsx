// app/ficha-inscricao/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  User,
  IdCard,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  BookOpen,
  Clock,
  FileText,
  Award,
  Building2,
  QrCode,
  CreditCard,
  DollarSign,
  Copy,
  Receipt,
  UserCheck,
  UserPlus,
} from "lucide-react";

interface Inscricao {
  id: number;
  bi: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  dataNascimento: string | null;
  createdAt: string;
  curso: {
    nome: string;
    duracao: number;
  };
  classe: {
    nome: string;
  };
  genero: {
    nome: string;
  };
  status: {
    nome: string;
  };
}

interface PagamentoInfo {
  id: number;
  referencia: string;
  valor: number;
  formaPagamento: string;
  status: string;
  dataExpiracao: string;
  dataPagamento: string | null;
  comprovativoUrl: string | null;
}

interface MatriculaInfo {
  id: number;
  status: string;
  birthDate: string;
  createdAt: string;
  pagamento: PagamentoInfo | null;
}

export default function FichaInscricaoPage() {
  const params = useParams();
  const router = useRouter();
  const [inscricao, setInscricao] = useState<Inscricao | null>(null);
  const [matricula, setMatricula] = useState<MatriculaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (id) {
      carregarFicha(Number(id));
      carregarMatricula(Number(id));
    }
  }, [params]);

  const carregarFicha = async (id: number) => {
    try {
      const res = await fetch(`/api/ficha-inscricao/${id}`);
      if (!res.ok) throw new Error("Erro ao carregar ficha");
      const data = await res.json();
      setInscricao(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar ficha de inscrição");
      router.push("/status");
    }
  };

  const carregarMatricula = async (inscricaoId: number) => {
    try {
      const res = await fetch(`/api/matricula/por-inscricao/${inscricaoId}`);
      if (res.ok) {
        const data = await res.json();
        setMatricula(data);
      }
    } catch (error) {
      console.error("Erro ao carregar matrícula:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info("Clique em 'Salvar como PDF' na janela de impressão");
    window.print();
  };

  const copiarReferencia = (referencia: string) => {
    navigator.clipboard.writeText(referencia);
    toast.success("Referência copiada!", {
      description: "Use esta referência para consultar o pagamento.",
    });
  };

  const formatarData = (data: string | null) => {
    if (!data) return "Não informada";
    return new Date(data).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      PENDENTE: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pendente" },
      APROVADA: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Aprovada" },
      REJEITADA: { color: "bg-red-100 text-red-700", icon: Clock, label: "Rejeitada" },
      ATIVA: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Ativa" },
      CONCLUIDA: { color: "bg-blue-100 text-blue-700", icon: CheckCircle2, label: "Concluída" },
      CANCELADA: { color: "bg-red-100 text-red-700", icon: Clock, label: "Cancelada" },
    };
    return config[status] || config.PENDENTE;
  };

  const getStatusPagamentoConfig = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      AGUARDANDO_COMPROVATIVO: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Aguardando comprovativo" },
      COMPROVATIVO_ENVIADO: { color: "bg-blue-100 text-blue-700", icon: Receipt, label: "Comprovativo enviado" },
      VERIFICADO: { color: "bg-purple-100 text-purple-700", icon: CheckCircle2, label: "Em verificação" },
      APROVADO: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Aprovado" },
      REJEITADO: { color: "bg-red-100 text-red-700", icon: Clock, label: "Rejeitado" },
    };
    return config[status] || { color: "bg-gray-100 text-gray-700", icon: Clock, label: status };
  };

  // Determinar o tipo de pessoa (Candidato vs Aluno)
  const isAluno = matricula && matricula.status === "ATIVA";
  const isCandidato = !matricula || (matricula && matricula.status === "PENDENTE");
  const isMatriculado = matricula && matricula.status === "ATIVA";

  // Determinar o título do documento
  const getDocumentTitle = () => {
    if (isAluno) return "Comprovativo de Matrícula";
    if (matricula && matricula.pagamento) return "Comprovativo de Inscrição - Aguardando Pagamento";
    return "Comprovativo de Inscrição";
  };

  // Determinar a mensagem principal
  const getMainMessage = () => {
    if (isAluno) return "Matrícula realizada com sucesso!";
    if (matricula && matricula.pagamento) return "Inscrição realizada! Aguardando confirmação de pagamento.";
    return "Inscrição realizada com sucesso!";
  };

  // Determinar a cor da mensagem principal
  const getMessageColor = () => {
    if (isAluno) return "bg-green-50 border-green-200 text-green-800";
    if (matricula && matricula.pagamento) return "bg-yellow-50 border-yellow-200 text-yellow-800";
    return "bg-green-50 border-green-200 text-green-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!inscricao) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-6">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Ficha não encontrada</h2>
          <p className="text-gray-600 mb-4">Não foi possível encontrar os dados.</p>
          <Button onClick={() => router.push("/status")} className="bg-orange-500 hover:bg-orange-600">
            Voltar para Status
          </Button>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(inscricao.status.nome);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto">
        {/* Botões de ação - esconder na impressão */}
        <div className="flex justify-between mb-6 print:hidden">
          <Button
            variant="outline"
            onClick={() => router.push("/status")}
            className="border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleImprimir}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>

        {/* Ficha Principal - Uma única página */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none">
          {/* Cabeçalho com identificação do tipo */}
          <div className="bg-linear-to-r from-orange-500 to-orange-600 text-white p-4 text-center relative">
            <div className="absolute top-4 right-4 print:static">
              <Badge className={`${isAluno ? 'bg-green-500' : 'bg-blue-500'} text-white border-0 px-3 py-1`}>
                {isAluno ? (
                  <><UserCheck className="w-3 h-3 mr-1" /> Aluno Matriculado</>
                ) : (
                  <><UserPlus className="w-3 h-3 mr-1" /> Candidato</>
                )}
              </Badge>
            </div>
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 p-3 rounded-full">
                <GraduationCap className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-xl font-bold">Instituto Politécnico Privado</h1>
            <p className="text-orange-100 text-sm">Pensador do Futuro</p>
            <div className="mt-2">
              <Badge className="bg-white/20 text-white border-0 px-3 py-1 text-xs">
                <FileText className="w-3 h-3 mr-1" />
                {getDocumentTitle()}
              </Badge>
            </div>
          </div>

          <CardContent className="p-5">
            {/* Status e Número */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b">
              <div>
                <p className="text-xs text-gray-500">Nº de {isAluno ? 'Matrícula' : 'Inscrição'}</p>
                <p className="text-xl font-bold text-orange-600">
                  {isAluno && matricula 
                    ? `#${matricula.id.toString().padStart(6, '0')}` 
                    : `#${inscricao.id.toString().padStart(6, '0')}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Status</p>
                <Badge className={`${statusConfig.color} flex items-center gap-1 px-2 py-0.5 text-xs`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>
              </div>
            </div>

            {/* Mensagem de Confirmação */}
            <div className={`${getMessageColor()} rounded-lg p-3 mb-4 text-center`}>
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1" />
              <p className="font-medium text-sm">{getMainMessage()}</p>
            </div>

            {/* Grid Principal - 2 colunas para economizar espaço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coluna Esquerda */}
              <div>
                {/* Dados Pessoais */}
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mb-2">
                    <User className="w-3 h-3 text-orange-500" />
                    Dados Pessoais
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Nome</p>
                        <p className="text-sm font-medium">{inscricao.nome}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <IdCard className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">BI</p>
                        <p className="text-sm font-mono">{inscricao.bi}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Nascimento</p>
                        <p className="text-sm">{formatarData(inscricao.dataNascimento)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Gênero</p>
                        <p className="text-sm">{inscricao.genero.nome}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contactos */}
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mb-2">
                    <Mail className="w-3 h-3 text-orange-500" />
                    Contactos
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Phone className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Telefone</p>
                        <p className="text-sm">{inscricao.telefone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm truncate">{inscricao.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Endereço</p>
                        <p className="text-sm">{inscricao.endereco}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita */}
              <div>
                {/* Dados Académicos */}
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mb-2">
                    <GraduationCap className="w-3 h-3 text-orange-500" />
                    Dados Académicos
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Curso</p>
                        <p className="text-sm font-medium">{inscricao.curso.nome}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Classe</p>
                        <p className="text-sm">{inscricao.classe.nome} Classe</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Duração</p>
                        <p className="text-sm">{inscricao.curso.duracao} anos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Award className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Certificação</p>
                        <p className="text-sm">Técnico Médio</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações da Matrícula (se houver) */}
                {matricula && (
                  <div className="mb-3">
                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mb-2">
                      <FileText className="w-3 h-3 text-orange-500" />
                      Matrícula
                    </h2>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Nº Matrícula</span>
                        <span className="text-sm font-bold text-orange-600">#{matricula.id.toString().padStart(6, '0')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Status</span>
                        {(() => {
                          const matStatus = getStatusConfig(matricula.status);
                          const MatIcon = matStatus.icon;
                          return (
                            <Badge className={`${matStatus.color} flex items-center gap-1 text-xs`}>
                              <MatIcon className="w-2 h-2" />
                              {matStatus.label}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Data</span>
                        <span className="text-sm">{formatarData(matricula.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações de Pagamento (se houver) */}
                {matricula && matricula.pagamento && (
                  <div className="mb-3">
                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mb-2">
                      <CreditCard className="w-3 h-3 text-orange-500" />
                      Pagamento
                    </h2>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Referência</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono">{matricula.pagamento.referencia}</span>
                          <button onClick={() => copiarReferencia(matricula.pagamento!.referencia)} className="print:hidden">
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Valor</span>
                        <span className="text-sm font-bold text-green-600">{formatarMoeda(matricula.pagamento.valor)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Forma</span>
                        <span className="text-sm">{matricula.pagamento.formaPagamento}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Status Pag.</span>
                        {(() => {
                          const pagStatus = getStatusPagamentoConfig(matricula.pagamento!.status);
                          const PagIcon = pagStatus.icon;
                          return (
                            <Badge className={`${pagStatus.color} flex items-center gap-1 text-xs`}>
                              <PagIcon className="w-2 h-2" />
                              {pagStatus.label}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Dados Bancários (apenas se tiver pagamento pendente) */}
            {matricula && matricula.pagamento && matricula.pagamento.status !== "APROVADO" && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Dados para Transferência
                </h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <div>
                    <p className="text-blue-600">Banco</p>
                    <p className="font-medium text-blue-800">BAI</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Conta</p>
                    <p className="font-medium text-blue-800">123 456 789 001</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-blue-600">Titular</p>
                    <p className="font-medium text-blue-800 text-xs">Instituto Politécnico Privado O Pensador do Futuro</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-blue-600">IBAN</p>
                    <p className="font-mono text-blue-800 text-xs">AO06 0040 0000 1234 5678 9012 3</p>
                  </div>
                </div>
              </div>
            )}

            {/* Informações da Instituição - Resumidas */}
            <div className="text-center pt-2 border-t">
              <div className="flex justify-center mb-2">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Emitido em {formatarDataHora(inscricao.createdAt)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Instituto Politécnico Privado O Pensador do Futuro - Luanda, Angola
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
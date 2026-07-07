// app/status/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  User,
  IdCard,
  Phone,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  Printer,
  PartyPopper,
  Trophy,
} from "lucide-react";

// Tipos baseados no schema
interface Inscricao {
  id: number;
  bi: string;
  nome: string;
  telefone: string | null;
  email: string;
  endereco: string;
  dataNascimento: string | null;
  createdAt: string;
  curso: {
    id: number;
    nome: string;
    duracao?: string;
  };
  classe: {
    id: number;
    nome: string;
  };
  genero: {
    id: number;
    nome: string;
  };
  status: {
    id: number;
    nome: "PENDENTE" | "APROVADA" | "REJEITADA";
  };
  matricula?: {
    id: number;
    status: {
      nome: "ATIVA" | "CANCELADA" | "CONCLUIDA";
    };
    periodo?: {
      nome: string;
    };
    pagamento?: {
      valor: number;
      formaPagamento: string;
      status: {
        nome: string;
      };
    };
  } | null;
}

const statusConfig = {
  APROVADA: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
    label: "Aprovada",
  },
  PENDENTE: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
    label: "Pendente",
  },
  REJEITADA: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    label: "Rejeitada",
  },
  ATIVA: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
    label: "Ativa",
  },
  CONCLUIDA: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Trophy,
    label: "Concluída",
  },
  CANCELADA: {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    label: "Cancelada",
  },
};

export default function StatusPage() {
  const router = useRouter();
  const [bi, setBi] = useState("");
  const [resultado, setResultado] = useState<Inscricao | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const buscarStatus = async () => {
  if (!bi.trim()) {
    toast.error("Campo obrigatório", {
      description: "Por favor, digite o número do BI.",
    });
    return;
  }

  //console.log("🔍 1. Iniciando busca para BI:", bi.trim());

  setIsLoading(true);
  const toastId = toast.loading("Consultando inscrição...");
  
  //console.log("📢 Toast de loading ID:", toastId);

  try {
    //console.log("🔍 2. Fazendo fetch para:", `/api/inscricao?bi=${bi.trim()}`);
    
    const response = await fetch(`/api/inscricao?bi=${bi.trim()}`);
    //console.log("🔍 3. Status da resposta:", response.status);
    
    const data = await response.json();
    //console.log("🔍 4. Dados recebidos:", data);
    //console.log("🔍 5. É array?", Array.isArray(data));
    //console.log("🔍 6. Tamanho do array:", Array.isArray(data) ? data.length : 'N/A');

    // 🔑 VERIFICAÇÃO: Array vazio = BI não encontrado
    if (Array.isArray(data) && data.length === 0) {
      //console.log("🔍 7. Array vazio detectado! BI não encontrado.");
      //console.log("📢 Tentando mostrar toast de erro...");
      
      // Fecha o toast de loading
      toast.dismiss(toastId);
      
      // Mostra o toast de erro
      toast.error("BI não registrado", {
        description: "⚠️ Este número de BI não foi encontrado no nosso sistema. Verifique se digitou corretamente ou entre em contato com a secretaria.",
        duration: 5000,
      });
      
      // Fallback: alert caso o toast não funcione
      //console.log("📢 Fallback: Mostrando alert");
      alert("⚠️ BI NÃO ENCONTRADO! O número " + bi.trim() + " não está registrado no sistema.");
      
      setResultado(null);
      setIsLoading(false);
      return;
    }

    //console.log("🔍 8. Dados encontrados, processando...");
    
    const inscricao = data[0];
    //console.log("🔍 9. Inscrição:", inscricao);

    if (!inscricao || !inscricao.id) {
      //console.log("🔍 10. Inscrição inválida ou sem ID");
      toast.dismiss(toastId);
      toast.error("Dados inválidos", {
        description: "Os dados retornados estão incompletos.",
        duration: 5000,
      });
      setResultado(null);
      setIsLoading(false);
      return;
    }

    //console.log("🔍 11. Tudo OK! Abrindo modal...");
    
    toast.dismiss(toastId);
    
    if (inscricao.matricula?.status?.nome === "CONCLUIDA") {
      toast.success("Processo concluído com sucesso! 🎉", {
        description: `Parabéns ${inscricao.nome}! Seu processo de formação foi concluído com sucesso.`,
        duration: 8000,
      });
    } else {
      toast.success("Inscrição encontrada", {
        description: `Dados da inscrição de ${inscricao.nome}`,
      });
    }

    setResultado(inscricao);
    setIsDialogOpen(true);
    
  } catch (error) {
    //console.error("🔍 ERRO:", error);
    toast.dismiss(toastId);
    toast.error("Erro na consulta", {
      description: "Não foi possível consultar a inscrição. Verifique sua conexão.",
      duration: 5000,
    });
    setResultado(null);
  } finally {
    setIsLoading(false);
  }
};

  const iniciarMatricula = () => {
    if (resultado) {
      toast.loading("Redirecionando para matrícula...");
      router.push(`/matricula?bi=${resultado.bi}`);
    }
  };


  const verFicha = () => {
    if (resultado) {
      router.push(`/ficha-inscricao/${resultado.id}`);
    }
  };

  const imprimirFicha = () => {
    if (resultado) {
      window.open(`/ficha-inscricao/${resultado.id}`, '_blank');
    }
  };

  const jaMatriculado = resultado?.matricula && 
    (resultado.matricula.status.nome === "ATIVA" || 
     resultado.matricula.status.nome === "CONCLUIDA");

  const isConcluido = resultado?.matricula?.status?.nome === "CONCLUIDA";

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig];
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-blue-600">
            Status da Candidatura
          </h1>
        </div>

        {/* Card Principal */}
        <Card className="border-blue-100 shadow-xl">
          <CardHeader className="bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Consultar Inscrição
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Digite seu BI para verificar o status
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Campo de busca */}
              <div className="space-y-2">
                <Label htmlFor="bi" className="text-gray-700 font-medium flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-gray-400" />
                  Número do BI
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="bi"
                      type="text"
                      placeholder="Ex: 123456789LA045"
                      value={bi}
                      onChange={(e) => setBi(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && buscarStatus()}
                      className="pl-10 pr-4 py-6 text-lg uppercase"
                      maxLength={14}
                    />
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <Button
                    onClick={buscarStatus}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-6"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Formato: 9 dígitos + 2 letras maiúsculas + 3 dígitos (ex: 123456789LA045)
                </p>
              </div>

              {/* Dicas rápidas */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Dicas para consulta:
                </h3>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Digite o BI sem espaços ou caracteres especiais</li>
                  <li>• As letras devem ser maiúsculas (ex: LA045)</li>
                  <li>• Verifique se digitou corretamente antes de consultar</li>
                  <li>• Se não encontrar, entre em contato com a secretaria</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Resultados */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {isConcluido ? (
                  <Trophy className="w-6 h-6 text-yellow-500" />
                ) : (
                  <User className="w-5 h-5 text-blue-500" />
                )}
                {isConcluido ? "🎓 Parabéns! Curso Concluído 🎓" : "Detalhes da Inscrição"}
              </DialogTitle>
              <DialogDescription>
                {isConcluido 
                  ? "Você concluiu sua formação com sucesso! Confira seus dados abaixo."
                  : "Informações completas da sua candidatura"
                }
              </DialogDescription>
            </DialogHeader>

            {resultado && (
              <div className="space-y-6 py-4">
                {/* Banner de Conclusão */}
                {isConcluido && (
                  <div className="p-6 bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl text-center">
                    <PartyPopper className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-yellow-700 mb-2">
                      🎉 Processo Concluído com Sucesso! 🎉
                    </h2>
                    <p className="text-gray-700">
                      Parabéns <strong>{resultado.nome}</strong>! Você concluiu sua formação em 
                      <strong> {resultado.curso.nome}</strong>.
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Seu certificado está disponível. Entre em contato com a secretaria.
                    </p>
                  </div>
                )}

                {/* Status e Ações */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg flex-wrap gap-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {resultado.matricula ? "Status da Matrícula" : "Status da Inscrição"}
                    </p>
                    <StatusBadge status={resultado.matricula ? resultado.matricula.status.nome : resultado.status.nome} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {resultado.status.nome === "APROVADA" && !jaMatriculado && (
                      <Button
                        onClick={iniciarMatricula}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Iniciar Matrícula
                      </Button>
                    )}
                   
                    <Button
                      onClick={verFicha}
                      variant="outline"
                      className="border-green-500 text-green-600"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Ficha
                    </Button>
                    <Button
                      onClick={imprimirFicha}
                      variant="outline"
                      className="border-purple-500 text-purple-600"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </div>

                {/* Mensagem especial para concluído */}
                {isConcluido && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Formação Concluída!</p>
                        <p className="text-sm text-green-700">
                          Você completou todo o percurso acadêmico com sucesso.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações Pessoais */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Nome completo</p>
                      <p className="font-medium">{resultado.nome}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">BI</p>
                      <p className="font-medium">{resultado.bi}</p>
                    </div>
                    {resultado.dataNascimento && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Data de Nascimento</p>
                        <p className="font-medium">{formatDate(resultado.dataNascimento)}</p>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Gênero</p>
                      <p className="font-medium">{resultado.genero.nome}</p>
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Contactos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="font-medium">{resultado.email}</p>
                    </div>
                    {resultado.telefone && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Telefone</p>
                        <p className="font-medium">{resultado.telefone}</p>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Endereço</p>
                      <p className="font-medium">{resultado.endereco}</p>
                    </div>
                  </div>
                </div>

                {/* Informações Acadêmicas */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    Dados Académicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Curso</p>
                      <p className="font-medium">{resultado.curso.nome}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Classe/Turma</p>
                      <p className="font-medium">{resultado.classe.nome}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Data de inscrição</p>
                      <p className="font-medium">{formatDate(resultado.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Informação de Matrícula */}
                {resultado.matricula && !isConcluido && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Dados da Matrícula
                    </h3>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <p className="font-medium text-green-800">Status da Matrícula</p>
                            <StatusBadge status={resultado.matricula.status.nome} />
                          </div>
                          {resultado.matricula.periodo && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Período:</span> {resultado.matricula.periodo.nome}
                            </p>
                          )}
                          {resultado.matricula.pagamento && (
                            <div className="mt-2 pt-2 border-t border-green-200">
                              <p className="text-sm font-medium text-gray-700 mb-1">Pagamento:</p>
                              <p className="text-sm text-gray-600">
                                Valor: {formatCurrency(resultado.matricula.pagamento.valor)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Forma: {resultado.matricula.pagamento.formaPagamento}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: {resultado.matricula.pagamento.status.nome}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Fechar
              </Button>
              
              {resultado?.status.nome === "APROVADA" && !jaMatriculado && (
                <Button
                  onClick={iniciarMatricula}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Iniciar Matrícula
                </Button>
              )}
          
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
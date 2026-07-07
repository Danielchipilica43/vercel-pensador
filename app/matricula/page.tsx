// app/matricula/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Calendar,
  Camera,
  FileText,
  GraduationCap,
  IdCard,
  Loader2,
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Stethoscope,
  CreditCard,
  Clock,
  DollarSign,
  Copy,
  QrCode,
  Send,
} from "lucide-react";

// Tipos
interface Inscricao {
  id: number;
  bi: string;
  nome: string;
  dataNascimento: string | null;
  curso: {
    id: number;
    nome: string;
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
    nome: string;
  };
}

interface Periodo {
  id: number;
  nome: string;
}

interface PagamentoInfo {
  id: number;
  referencia: string;
  valor: number;
  formaPagamento: string;
  dataExpiracao: string;
}

// Schema de validação
const fileSchema = z
  .any()
  .nullable()
  .refine((file) => file === null || file instanceof File, { 
    message: "Selecione um arquivo válido" 
  })
  .refine((file) => file === null || file.size <= 5 * 1024 * 1024, {
    message: "Arquivo deve ter no máximo 5MB",
  });

const matriculaSchema = z.object({
  bi: z.string().min(1, "BI é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  periodoId: z.string().min(1, "Período é obrigatório"),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  photo: fileSchema,
  certificate: fileSchema,
  medicalCertificate: fileSchema,
});

type MatriculaForm = z.infer<typeof matriculaSchema>;

export default function MatriculaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bi = searchParams.get("bi");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inscricao, setInscricao] = useState<Inscricao | null>(null);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [pagamentoInfo, setPagamentoInfo] = useState<PagamentoInfo | null>(null);
  const [pagamentoCriado, setPagamentoCriado] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [matriculaId, setMatriculaId] = useState<number | null>(null);

  const form = useForm<MatriculaForm>({
    resolver: zodResolver(matriculaSchema),
    defaultValues: {
      bi: "",
      nome: "",
      birthDate: "",
      periodoId: "",
      formaPagamento: "",
      photo: null,
      certificate: null,
      medicalCertificate: null,
    },
  });

  // Carregar dados
  useEffect(() => {
    if (!bi) {
      toast.error("BI não informado", {
        description: "Não foi possível identificar o candidato.",
      });
      router.push("/status");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const toastId = toast.loading("Carregando dados...");

      try {
        // 1. Buscar inscrição
        const inscricaoRes = await fetch(`/api/inscricao?bi=${bi}`);
        const inscricaoData = await inscricaoRes.json();
        
        if (!inscricaoRes.ok || !inscricaoData) {
          throw new Error("Inscrição não encontrada");
        }

        const insc = Array.isArray(inscricaoData) ? inscricaoData[0] : inscricaoData;
        
        // Verificar status da inscrição
        if (insc.status?.nome !== "APROVADA") {
          toast.error("Inscrição não aprovada", {
            id: toastId,
            description: "Apenas inscrições aprovadas podem realizar matrícula.",
          });
          router.push(`/status?bi=${bi}`);
          return;
        }

        // 2. Verificar se já tem matrícula
        const matriculaRes = await fetch(`/api/matricula?bi=${bi}`);
        const matriculaData = await matriculaRes.json();
        
        if (matriculaRes.ok && matriculaData && matriculaData.length > 0) {
          toast.error("Matrícula já realizada", {
            id: toastId,
            description: "Esta inscrição já possui uma matrícula.",
          });
          router.push(`/status?bi=${bi}`);
          return;
        }

        // 3. Buscar períodos disponíveis
        const periodosRes = await fetch("/api/periodos");
        const periodosData = await periodosRes.json();
        setPeriodos(periodosData || []);

        setInscricao(insc);

        // Preencher formulário
        form.reset({
          bi: insc.bi,
          nome: insc.nome,
          birthDate: insc.dataNascimento?.split("T")[0] || "",
          periodoId: "",
          formaPagamento: "",
          photo: null,
          certificate: null,
          medicalCertificate: null,
        });

        toast.success("Dados carregados", {
          id: toastId,
          description: "Preencha os documentos para finalizar a matrícula.",
        });
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dados", {
          id: toastId,
          description: error instanceof Error ? error.message : "Não foi possível carregar os dados.",
        });
        router.push("/status");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bi, router, form]);

  // ✅ FUNÇÃO CORRIGIDA - criar matrícula com FormData
  const criarMatricula = async (data: MatriculaForm) => {
    const formData = new FormData();
    
    formData.append("inscricaoId", inscricao!.id.toString());
    formData.append("bi", data.bi);
    formData.append("birthDate", data.birthDate);
    formData.append("periodoId", data.periodoId);
    
    if (data.photo instanceof File) {
      formData.append("photo", data.photo);
    }
    if (data.certificate instanceof File) {
      formData.append("certificate", data.certificate);
    }
    if (data.medicalCertificate instanceof File) {
      formData.append("medicalCertificate", data.medicalCertificate);
    }

    // ✅ NÃO defina Content-Type manualmente
    const res = await fetch("/api/matricula", {
      method: "POST",
      body: formData,
    });

    // ✅ Verificar se a resposta é JSON
    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("❌ Resposta não é JSON:", text);
      throw new Error(`Erro no servidor: ${text.substring(0, 100)}`);
    }

    if (!res.ok) {
      throw new Error(result.error || "Erro ao processar matrícula");
    }

    return result;
  };

  const criarPagamento = async (matriculaId: number, formaPagamento: string) => {
    const res = await fetch("/api/pagamento/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        matriculaId, 
        formaPagamento 
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Erro ao criar pagamento");
    }

    return result;
  };

  // ✅ FUNÇÃO CORRIGIDA - onSubmit
  const onSubmit = async (data: MatriculaForm) => {
    setSubmitting(true);
    const toastId = toast.loading("Processando matrícula...");

    try {
      console.log("📤 Enviando dados:", {
        inscricaoId: inscricao?.id,
        bi: data.bi,
        birthDate: data.birthDate,
        periodoId: data.periodoId,
        photo: data.photo instanceof File ? data.photo.name : 'N/A',
        certificate: data.certificate instanceof File ? data.certificate.name : 'N/A',
        medicalCertificate: data.medicalCertificate instanceof File ? data.medicalCertificate.name : 'N/A',
      });

      // 1. Criar matrícula
      const matriculaResult = await criarMatricula(data);
      setMatriculaId(matriculaResult.id);

      toast.loading("Criando pagamento...", { id: toastId });

      // 2. Criar pagamento
      const pagamentoResult = await criarPagamento(matriculaResult.id, data.formaPagamento);
      
      setPagamentoInfo(pagamentoResult.pagamento);
      setPagamentoCriado(true);
      setUploadProgress(100);

      toast.success("Matrícula criada!", {
        id: toastId,
        description: "Agora realize o pagamento para finalizar.",
      });

    } catch (error) {
      console.error("❌ Erro detalhado:", error);
      toast.error("Erro na matrícula", {
        id: toastId,
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    form.setValue("photo", file);
    
    if (file) {
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande", {
          description: "A foto deve ter no máximo 5MB",
        });
      }
    }
  };

  const copiarReferencia = () => {
    if (pagamentoInfo?.referencia) {
      navigator.clipboard.writeText(pagamentoInfo.referencia);
      toast.success("Referência copiada!", {
        description: "Use esta referência para simular o pagamento.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 to-gray-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Carregando página...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de pagamento após matrícula
  if (pagamentoCriado && pagamentoInfo) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 to-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-orange-100 shadow-xl">
            <CardHeader className="bg-linear-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Pagamento da Matrícula
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    Realize o pagamento usando a referência abaixo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-700">
                  ⚠️ Modo de Teste: Use a ferramenta de simulação no painel admin para aprovar este pagamento.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
                
                <h3 className="font-semibold text-lg mb-2">Dados para Transferência</h3>
                
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Referência:</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-orange-600">{pagamentoInfo.referencia}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copiarReferencia}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-bold text-green-600">{pagamentoInfo.valor} Kz</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Forma de Pagamento:</span>
                    <span>{pagamentoInfo.formaPagamento}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-600">Validade:</span>
                    <span>{new Date(pagamentoInfo.dataExpiracao).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>📌 Importante:</strong> Após realizar o pagamento, o administrador precisará 
                    validar o comprovativo no painel de simulação para ativar sua matrícula.
                  </p>
                </div>

                <Button
                  onClick={() => router.push(`/status?bi=${bi}`)}
                  className="mt-6 w-full bg-orange-500 hover:bg-orange-600"
                >
                  Voltar para Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-orange-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-orange-600">
            Finalizar Matrícula
          </h1>
        </div>

        {/* Card Principal */}
        <Card className="border-orange-100 shadow-xl">
          <CardHeader className="bg-linear-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Documentos para Matrícula
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Preencha todos os campos e anexe os documentos necessários
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Progresso do Upload */}
                {submitting && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Processando matrícula...
                      </span>
                      <span className="text-sm font-bold text-orange-600">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 bg-gray-100" />
                  </div>
                )}

                {/* Informações da Inscrição */}
                {inscricao && (
                  <Alert className="bg-green-50 flex border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Inscrição aprovada para o curso {inscricao.curso.nome}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Classe: {inscricao.classe.nome} | Gênero: {inscricao.genero.nome}
                        </p>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Aviso se não houver períodos */}
                {periodos.length === 0 && !loading && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum período disponível para matrícula. Entre em contato com a administração.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Grid de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BI (readonly) */}
                  <FormField
                    control={form.control}
                    name="bi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-gray-400" />
                          Número do BI
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly 
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          Nome completo
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly 
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Data de Nascimento */}
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Data de Nascimento *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className={form.formState.errors.birthDate ? "border-red-500" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Período */}
                  <FormField
                    control={form.control}
                    name="periodoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          Período Letivo *
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={periodos.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {periodos.map((periodo) => (
                              <SelectItem key={periodo.id} value={periodo.id.toString()}>
                                {periodo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Forma de Pagamento */}
                  <FormField
                    control={form.control}
                    name="formaPagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          Forma de Pagamento *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</SelectItem>
                            <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                            <SelectItem value="Multicaixa Express">Multicaixa Express</SelectItem>
                            <SelectItem value="Depósito Bancário">Depósito Bancário</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Seção de Documentos */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">
                    Documentos Obrigatórios
                  </h3>

                  {/* Foto */}
                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-gray-400" />
                          Foto 3x4 *
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="flex-1"
                              />
                              {photoPreview && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Anexada
                                </Badge>
                              )}
                            </div>
                            
                            {photoPreview && (
                              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-orange-200">
                                <Image
                                  src={photoPreview}
                                  alt="Pré-visualização"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-500 mt-1">
                          Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Certificado */}
                  <FormField
                    control={form.control}
                    name="certificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          Certificado de Conclusão *
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                              className="flex-1"
                            />
                            {field.value && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <FileCheck className="w-3 h-3 mr-1" />
                                Anexado
                              </Badge>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF ou imagem. Tamanho máximo: 5MB
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Atestado Médico */}
                  <FormField
                    control={form.control}
                    name="medicalCertificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          Atestado Médico *
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                              className="flex-1"
                            />
                            {field.value && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <FileCheck className="w-3 h-3 mr-1" />
                                Anexado
                              </Badge>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF ou imagem. Tamanho máximo: 5MB
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Aviso importante */}
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-700">
                    Ao confirmar a matrícula, você declara que os documentos anexados são autênticos 
                    e assume a responsabilidade pelas informações fornecidas.
                  </AlertDescription>
                </Alert>

                {/* Botão de submit */}
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
                  disabled={submitting || periodos.length === 0}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      Enviar Matrícula
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
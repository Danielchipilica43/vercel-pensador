// app/inscricao/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// Componentes UI
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText } from "lucide-react";

// Schema Zod
const inscricaoSchema = z.object({
  bi: z
    .string()
    .min(1, "BI é obrigatório")
    .regex(/^\d{9}[A-Za-z]{2}\d{3}$/, {
      message: "Formato inválido. Exemplo: 123456789LA045",
    }),
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  generoId: z.string().min(1, "Gênero é obrigatório"),
  classeId: z.string().min(1, "Classe é obrigatória"),
  cursoId: z.string().min(1, "Curso é obrigatório"),
  endereco: z.string().min(2, "Endereço inválido"),
  telefone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(/^(244)?9[1234567]\d{7}$/, {
      message: "Número angolano inválido. Exemplo: 923456789 ou 244923456789",
    }),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
});

type InscricaoForm = z.infer<typeof inscricaoSchema>;

// Tipos para dados do banco
interface Curso {
  id: number;
  nome: string;
}

interface Classe {
  id: number;
  nome: string;
}

interface Genero {
  id: number;
  nome: string;
}

export default function InscricaoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [inscricaoId, setInscricaoId] = useState<number | null>(null);
  
  // Estados para dados do banco
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);

  // Carregar dados do banco
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cursosRes, classesRes, generosRes] = await Promise.all([
          fetch("/api/cursos"),
          fetch("/api/classes"),
          fetch("/api/generos")
        ]);

        const cursosData = await cursosRes.json();
        const classesData = await classesRes.json();
        const generosData = await generosRes.json();

        setCursos(cursosData);
        setClasses(classesData);
        setGeneros(generosData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar formulário");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<InscricaoForm>({
    resolver: zodResolver(inscricaoSchema),
    defaultValues: {
      bi: "",
      nome: "",
      generoId: "",
      classeId: "",
      cursoId: "",
      endereco: "",
      telefone: "",
      email: "",
      dataNascimento: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: InscricaoForm) => {
    setIsLoading(true);
    setServerError(null);

    const toastId = toast.loading("Enviando inscrição...");

    try {
      const formattedData = {
        ...data,
        classeId: parseInt(data.classeId),
        cursoId: parseInt(data.cursoId),
        generoId: parseInt(data.generoId),
        telefone: data.telefone.startsWith("9")
          ? `244${data.telefone}`
          : data.telefone,
        statusId: 1, // PENDENTE
      };

      const response = await fetch("/api/inscricao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar inscrição");
      }

      setInscricaoId(result.id);

      toast.success("Inscrição realizada com sucesso!", {
        id: toastId,
        description: "Sua ficha de inscrição está pronta.",
        action: {
          label: "Ver Ficha",
          onClick: () => router.push(`/ficha-inscricao/${result.id}`),
        },
      });

      // Redirecionar para a ficha após 3 segundos
      setTimeout(() => {
        router.push(`/ficha-inscricao/${result.id}`);
      }, 3000);
      
    } catch (err) {
      console.error("Erro ao enviar:", err);
      
      if (err instanceof Error && err.message.includes("duplicado")) {
        toast.error("BI já registrado", {
          id: toastId,
          description: "Este número de BI já foi utilizado em outra inscrição.",
        });
      } else {
        toast.error("Erro ao enviar inscrição", {
          id: toastId,
          description: err instanceof Error ? err.message : "Tente novamente.",
        });
      }
      
      setServerError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const formatBI = (value: string) => {
    let cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    cleaned = cleaned.slice(0, 14);
    if (cleaned.length > 9) {
      cleaned =
        cleaned.slice(0, 9) +
        cleaned.slice(9, 11).toUpperCase() +
        cleaned.slice(11);
    }
    return cleaned;
  };

  const formatTelefone = (value: string) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.startsWith("244")) {
      cleaned = "244" + cleaned.slice(3, 12);
    } else if (cleaned.startsWith("9")) {
      cleaned = cleaned.slice(0, 9);
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1, 10);
    }
    return cleaned;
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 to-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-orange-600"
          >
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold text-orange-600">
            Inscrição
          </h1>
        </div>

        {/* Card do formulário */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Mensagem de erro */}
          {serverError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Grid responsivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nome */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nome" className="text-gray-700">
                  Nome completo *
                </Label>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="nome"
                      placeholder="Digite seu nome completo"
                      className={errors.nome ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              {/* BI */}
              <div className="space-y-2">
                <Label htmlFor="bi" className="text-gray-700">
                  Número do BI *
                </Label>
                <Controller
                  name="bi"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="bi"
                      placeholder="123456789LA045"
                      className={`uppercase ${errors.bi ? "border-red-500" : ""}`}
                      onChange={(e) => field.onChange(formatBI(e.target.value))}
                      maxLength={14}
                    />
                  )}
                />
                {errors.bi && (
                  <p className="text-red-500 text-sm mt-1">{errors.bi.message}</p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-gray-700">
                  Telefone *
                </Label>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="telefone"
                      placeholder="923456789"
                      className={errors.telefone ? "border-red-500" : ""}
                      onChange={(e) => field.onChange(formatTelefone(e.target.value))}
                      maxLength={12}
                    />
                  )}
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email *
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-gray-700">
                  Data de Nascimento *
                </Label>
                <Controller
                  name="dataNascimento"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="dataNascimento"
                      type="date"
                      className={errors.dataNascimento ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.dataNascimento && (
                  <p className="text-red-500 text-sm mt-1">{errors.dataNascimento.message}</p>
                )}
              </div>

              {/* Gênero */}
              <div className="space-y-2">
                <Label htmlFor="generoId" className="text-gray-700">
                  Gênero *
                </Label>
                <Controller
                  name="generoId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.generoId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {generos.map((genero) => (
                          <SelectItem key={genero.id} value={genero.id.toString()}>
                            {genero.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.generoId && (
                  <p className="text-red-500 text-sm mt-1">{errors.generoId.message}</p>
                )}
              </div>

              {/* Curso */}
              <div className="space-y-2">
                <Label htmlFor="cursoId" className="text-gray-700">
                  Curso *
                </Label>
                <Controller
                  name="cursoId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.cursoId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map((curso) => (
                          <SelectItem key={curso.id} value={curso.id.toString()}>
                            {curso.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cursoId && (
                  <p className="text-red-500 text-sm mt-1">{errors.cursoId.message}</p>
                )}
              </div>

              {/* Classe */}
              <div className="space-y-2">
                <Label htmlFor="classeId" className="text-gray-700">
                  Classe *
                </Label>
                <Controller
                  name="classeId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.classeId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classe) => (
                          <SelectItem key={classe.id} value={classe.id.toString()}>
                            {classe.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classeId && (
                  <p className="text-red-500 text-sm mt-1">{errors.classeId.message}</p>
                )}
              </div>

              {/* Endereço */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco" className="text-gray-700">
                  Endereço *
                </Label>
                <Controller
                  name="endereco"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="endereco"
                      placeholder="Bairro, Rua, Nº da casa"
                      className={errors.endereco ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.endereco && (
                  <p className="text-red-500 text-sm mt-1">{errors.endereco.message}</p>
                )}
              </div>
            </div>

            {/* Botão de submit */}
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 text-lg mt-6"
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                "Enviar Inscrição"
              )}
            </Button>

            {/* Informação sobre a ficha */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Após a inscrição, você receberá uma ficha de confirmação para imprimir.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
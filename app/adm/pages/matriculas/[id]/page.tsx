"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Image as ImageIcon,
  FileCheck,
  Stethoscope,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ============================================
// TIPOS
// ============================================

interface Inscricao {
  id: number;
  nome: string;
  bi: string;
  telefone: string;
  email: string;
  endereco: string;
  classe: string;
  curso: string;
  status: string;
  genero?: string;
  dataNascimento?: string;
}

interface Matricula {
  id: number;
  status: string;
  birthDate: string;
  createdAt: string;
  photoUrl: string | null;
  certificateUrl: string | null;
  medicalCertificateUrl: string | null;
  Inscricao: Inscricao;
  Pagamento?: {
    valor: number;
    formaPagamento: string;
    status: string;
  };
  Periodo?: {
    nome: string;
  };
}

interface ApiResponse {
  id: number;
  status: string;
  birthDate: string;
  createdAt: string;
  photoUrl: string | null;
  certificateUrl: string | null;
  medicalCertificateUrl: string | null;
  Inscricao: Inscricao;
  Pagamento?: {
    valor: number;
    formaPagamento: string;
    status: string;
  };
  Periodo?: {
    nome: string;
  };
}

// ============================================
// FETCHER
// ============================================

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao carregar dados");
    return res.json();
  });

// ============================================
// COMPONENTE
// ============================================

export default function DetalheMatriculaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, error, isLoading } = useSWR<ApiResponse>(
    id ? `/api/listarMatriculados/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // ============================================
  // LOADING
  // ============================================

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32 ml-auto" />
        </div>
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar</AlertTitle>
          <AlertDescription>
            {error?.message || "Matrícula não encontrada."}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  const { Inscricao } = data;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-4">
          <Badge 
            variant={data.status === "ATIVA" ? "default" : "secondary"}
            className="text-sm"
          >
            {data.status}
          </Badge>

          {data.photoUrl && (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500">
              <Image
                src={data.photoUrl}
                alt={`Foto de ${Inscricao.nome}`}
                fill
                className="object-cover"
                sizes="(max-width: 96px) 96px"
                priority
              />
            </div>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-bold">
        Detalhes da Matrícula
      </h1>

      {/* ============================================
          MATRÍCULA
      ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-orange-500" />
            Dados da Matrícula
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">ID da Matrícula</p>
            <p className="font-medium">#{data.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <Badge variant={data.status === "ATIVA" ? "default" : "secondary"}>
              {data.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de Nascimento</p>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(data.birthDate).toLocaleDateString("pt-AO")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de Criação</p>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(data.createdAt).toLocaleDateString("pt-AO")}
            </p>
          </div>
          {data.Periodo && (
            <div>
              <p className="text-sm text-gray-500">Período</p>
              <p className="font-medium">{data.Periodo.nome}</p>
            </div>
          )}
          {data.Pagamento && (
            <div>
              <p className="text-sm text-gray-500">Pagamento</p>
              <p className="font-medium">
                {data.Pagamento.formaPagamento} - {data.Pagamento.valor} Kz
              </p>
              <Badge variant="outline" className="mt-1">
                {data.Pagamento.status}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================
          INSCRIÇÃO
      ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Dados da Inscrição
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nome Completo</p>
            <p className="font-medium">{Inscricao.nome}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">BI / Nº Identificação</p>
            <p className="font-medium">{Inscricao.bi}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telefone</p>
            <p className="font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {Inscricao.telefone}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {Inscricao.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Endereço</p>
            <p className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {Inscricao.endereco}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Género</p>
            <p className="font-medium">{Inscricao.genero || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Curso</p>
            <p className="font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400" />
              {Inscricao.curso}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Classe</p>
            <p className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              {Inscricao.classe}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status da Inscrição</p>
            <Badge 
              variant={
                Inscricao.status === "APROVADA" ? "default" :
                Inscricao.status === "REJEITADA" ? "destructive" : "secondary"
              }
            >
              {Inscricao.status}
            </Badge>
          </div>
          {Inscricao.dataNascimento && (
            <div>
              <p className="text-sm text-gray-500">Data de Nascimento</p>
              <p className="font-medium">
                {new Date(Inscricao.dataNascimento).toLocaleDateString("pt-AO")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================
          DOCUMENTOS
      ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Foto */}
            <DocumentLink
              url={data.photoUrl}
              icon={<ImageIcon className="w-5 h-5" />}
              label="Foto do Aluno"
              fallbackLabel="Foto não disponível"
            />

            {/* Certificado */}
            <DocumentLink
              url={data.certificateUrl}
              icon={<FileCheck className="w-5 h-5" />}
              label="Certificado"
              fallbackLabel="Certificado não disponível"
            />

            {/* Atestado Médico */}
            <DocumentLink
              url={data.medicalCertificateUrl}
              icon={<Stethoscope className="w-5 h-5" />}
              label="Atestado Médico"
              fallbackLabel="Atestado não disponível"
            />
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          BOTÕES DE AÇÃO
      ============================================ */}
      <div className="flex flex-wrap gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/adm/pages/matriculas/${data.id}/editar`)}
        >
          <FileCheck className="w-4 h-4 mr-2" />
          Editar Matrícula
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/adm/pages/inscricoes/${Inscricao.id}`)}
        >
          <User className="w-4 h-4 mr-2" />
          Ver Inscrição
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
        >
          <FileText className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: DocumentLink
// ============================================

interface DocumentLinkProps {
  url: string | null;
  icon: React.ReactNode;
  label: string;
  fallbackLabel: string;
}

function DocumentLink({ url, icon, label, fallbackLabel }: DocumentLinkProps) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50 text-gray-400">
        {icon}
        <span className="text-sm">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 border rounded-md hover:bg-orange-50 hover:border-orange-200 transition-colors"
    >
      {icon}
      <span className="text-sm font-medium text-blue-600 hover:underline">
        {label}
      </span>
    </a>
  );
}
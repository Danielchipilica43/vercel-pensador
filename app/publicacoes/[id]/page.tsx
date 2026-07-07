// app/publicacoes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Share2,
  Printer,
  Newspaper,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";

interface Publicacao {
  id: number;
  titulo: string;
  conteudo: string;
  resumo: string;
  imagemUrl: string | null;
  autor: string;
  categoria: string;
  createdAt: string;
  visualizacoes: number;
}

export default function PublicacaoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (id) {
      carregarPublicacao(Number(id));
    }
  }, [params]);

  const carregarPublicacao = async (id: number) => {
    try {
      const res = await fetch(`/api/publicacoes/${id}`);
      if (!res.ok) throw new Error("Erro ao carregar publicação");
      const data = await res.json();
      setPublicacao(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar publicação");
      router.push("/publicacoes");
    } finally {
      setLoading(false);
    }
  };

  const handleCompartilhar = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleImprimir = () => {
    window.print();
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "EVENTO":
        return <CalendarDays className="w-5 h-5" />;
      case "COMUNICADO":
        return <Megaphone className="w-5 h-5" />;
      default:
        return <Newspaper className="w-5 h-5" />;
    }
  };

  const getCategoriaCor = (categoria: string) => {
    switch (categoria) {
      case "EVENTO":
        return "bg-green-100 text-green-700 border-green-200";
      case "COMUNICADO":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando publicação...</p>
        </div>
      </div>
    );
  }

  if (!publicacao) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-6">
          <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Publicação não encontrada</h2>
          <p className="text-gray-600 mb-4">A publicação que você procura não existe ou foi removida.</p>
          <Button onClick={() => router.push("/publicacoes")} className="bg-orange-500 hover:bg-orange-600">
            Voltar para Publicações
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Badge className={`${getCategoriaCor(publicacao.categoria)} mb-4`}>
            {getCategoriaIcon(publicacao.categoria)}
            <span className="ml-1">
              {publicacao.categoria === "EVENTO" ? "Evento" : publicacao.categoria === "COMUNICADO" ? "Comunicado" : "Notícia"}
            </span>
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{publicacao.titulo}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-orange-100">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatarData(publicacao.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {publicacao.visualizacoes} visualizações
            </div>
            <div>Por {publicacao.autor || "Administrador"}</div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Imagem de destaque */}
        {publicacao.imagemUrl && (
          <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={publicacao.imagemUrl}
              alt={publicacao.titulo}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Conteúdo da publicação */}
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: publicacao.conteudo }} />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-4 mt-8 pt-8 border-t print:hidden">
          <Button variant="outline" onClick={handleCompartilhar}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" onClick={handleImprimir}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
}
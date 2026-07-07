// app/_components/Publicacoes.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, ChevronRight, Newspaper, CalendarDays, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Publicacao {
  id: number;
  titulo: string;
  resumo: string;
  imagemUrl: string | null;
  categoria: string;
  createdAt: string;
  visualizacoes: number;
}

export function Publicacoes() {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("todos");

  useEffect(() => {
    carregarPublicacoes();
  }, [categoria]);

  const carregarPublicacoes = async () => {
    setLoading(true);
    try {
      const url = `/api/publicacoes?categoria=${categoria}&limit=3`;
      const res = await fetch(url);
      const data = await res.json();
      setPublicacoes(data.publicacoes || []);
    } catch (error) {
      console.error("Erro ao carregar publicações:", error);
    } finally {
      setLoading(false);
    }
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
        return <CalendarDays className="w-3 h-3" />;
      case "COMUNICADO":
        return <Megaphone className="w-3 h-3" />;
      default:
        return <Newspaper className="w-3 h-3" />;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (publicacoes.length === 0) {
    return (
      <div className="text-center py-12">
        <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Nenhuma publicação encontrada</h3>
        <p className="text-gray-500 mt-2">Fique atento, em breve teremos novidades!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtro de categorias */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={categoria === "todos" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoria("todos")}
          className={categoria === "todos" ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          Todos
        </Button>
        <Button
          variant={categoria === "NOTICIA" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoria("NOTICIA")}
          className={categoria === "NOTICIA" ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          Notícias
        </Button>
        <Button
          variant={categoria === "EVENTO" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoria("EVENTO")}
          className={categoria === "EVENTO" ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          Eventos
        </Button>
        <Button
          variant={categoria === "COMUNICADO" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoria("COMUNICADO")}
          className={categoria === "COMUNICADO" ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          Comunicados
        </Button>
      </div>

      {/* Grid de publicações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {publicacoes.map((pub) => (
          <Link key={pub.id} href={`/publicacoes/${pub.id}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              {/* Imagem */}
              <div className="relative h-48 overflow-hidden">
                {pub.imagemUrl ? (
                  <Image
                    src={pub.imagemUrl}
                    alt={pub.titulo}
                    fill
                    sizes="100"
                    className="object-cover transition-transform hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-white/50" />
                  </div>
                )}
                {/* Categoria badge */}
                <Badge className={`absolute top-3 left-3 ${getCategoriaCor(pub.categoria)}`}>
                  {getCategoriaIcon(pub.categoria)}
                  <span className="ml-1">
                    {pub.categoria === "EVENTO" ? "Evento" : pub.categoria === "COMUNICADO" ? "Comunicado" : "Notícia"}
                  </span>
                </Badge>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                {/* Data e visualizações */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatarData(pub.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {pub.visualizacoes}
                  </div>
                </div>

                {/* Título */}
                <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-orange-600 transition">
                  {pub.titulo}
                </h3>

                {/* Resumo */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                  {pub.resumo || pub.titulo}
                </p>

                {/* Link ler mais */}
                <div className="flex items-center text-orange-600 font-medium text-sm mt-auto">
                  Ler mais
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
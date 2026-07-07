// app/publicacoes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Eye,
  ChevronRight,
  ChevronLeft,
  Newspaper,
  CalendarDays,
  Megaphone,
  Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Publicacao {
  id: number;
  titulo: string;
  resumo: string;
  conteudo: string;
  imagemUrl: string | null;
  categoria: string;
  createdAt: string;
  visualizacoes: number;
}

export default function PublicacoesPage() {
  const searchParams = useSearchParams();
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState(searchParams.get("categoria") || "todos");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaTemp, setBuscaTemp] = useState("");

  useEffect(() => {
    carregarPublicacoes();
  }, [categoria, pagina, busca]);

  const carregarPublicacoes = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/publicacoes", window.location.origin);
      url.searchParams.set("categoria", categoria);
      url.searchParams.set("page", pagina.toString());
      url.searchParams.set("limit", "9");
      if (busca) url.searchParams.set("busca", busca);

      const res = await fetch(url.toString());
      const data = await res.json();
      setPublicacoes(data.publicacoes || []);
      setTotalPaginas(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Erro ao carregar publicações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setBusca(buscaTemp);
    setPagina(1);
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
        return <CalendarDays className="w-4 h-4" />;
      case "COMUNICADO":
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Newspaper className="w-4 h-4" />;
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

  if (loading && publicacoes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Notícias e Eventos</h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto">
            Fique por dentro das últimas novidades do Pensador do Futuro Academy
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={categoria === "todos" ? "default" : "outline"}
              onClick={() => {
                setCategoria("todos");
                setPagina(1);
              }}
              className={categoria === "todos" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              Todos
            </Button>
            <Button
              variant={categoria === "NOTICIA" ? "default" : "outline"}
              onClick={() => {
                setCategoria("NOTICIA");
                setPagina(1);
              }}
              className={categoria === "NOTICIA" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              Notícias
            </Button>
            <Button
              variant={categoria === "EVENTO" ? "default" : "outline"}
              onClick={() => {
                setCategoria("EVENTO");
                setPagina(1);
              }}
              className={categoria === "EVENTO" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              Eventos
            </Button>
            <Button
              variant={categoria === "COMUNICADO" ? "default" : "outline"}
              onClick={() => {
                setCategoria("COMUNICADO");
                setPagina(1);
              }}
              className={categoria === "COMUNICADO" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              Comunicados
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Buscar..."
              value={buscaTemp}
              onChange={(e) => setBuscaTemp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              className="max-w-xs"
            />
            <Button onClick={handleBuscar} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grid de publicações */}
        {publicacoes.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Nenhuma publicação encontrada</h3>
            <p className="text-gray-500 mt-2">Tente ajustar os filtros ou buscar por outro termo.</p>
          </div>
        ) : (
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
                        className="object-cover transition-transform hover:scale-105 duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <Badge className={`absolute top-3 left-3 ${getCategoriaCor(pub.categoria)}`}>
                      {getCategoriaIcon(pub.categoria)}
                      <span className="ml-1">
                        {pub.categoria === "EVENTO" ? "Evento" : pub.categoria === "COMUNICADO" ? "Comunicado" : "Notícia"}
                      </span>
                    </Badge>
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col">
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
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-orange-600 transition">
                      {pub.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                      {pub.resumo}
                    </p>
                    <div className="flex items-center text-orange-600 font-medium text-sm mt-auto">
                      Ler mais
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {pagina} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
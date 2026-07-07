// app/adm/pages/publicacoes/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Loader2,
  Newspaper,
  CalendarDays,
  Megaphone,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

interface Publicacao {
  id: number;
  titulo: string;
  conteudo: string;
  resumo: string;
  imagemUrl: string | null;
  autor: string;
  categoria: string;
  destaque: boolean;
  publicado: boolean;
  visualizacoes: number;
  createdAt: string;
  updatedAt: string;
}

export default function PublicacoesAdminPage() {
  const router = useRouter();
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogExcluir, setDialogExcluir] = useState(false);
  const [editando, setEditando] = useState<Publicacao | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    resumo: "",
    imagemUrl: "",
    autor: "",
    categoria: "NOTICIA",
    destaque: false,
    publicado: true,
  });

  useEffect(() => {
    carregarPublicacoes();
  }, []);

  const carregarPublicacoes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/publicacoes?limit=100");
      const data = await res.json();
      if (data && Array.isArray(data.publicacoes)) {
        setPublicacoes(data.publicacoes);
      } else if (Array.isArray(data)) {
        setPublicacoes(data);
      } else {
        setPublicacoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar publicações:", error);
      toast.error("Erro ao carregar publicações");
      setPublicacoes([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer upload da imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG, WEBP ou GIF");
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para o servidor
    setUploading(true);
    const toastId = toast.loading("Enviando imagem...");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) throw new Error("Erro ao fazer upload");

      const data = await res.json();
      setFormData({ ...formData, imagemUrl: data.url });
      toast.success("Imagem enviada!", { id: toastId });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar imagem", { id: toastId });
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  const removerImagem = () => {
    setFormData({ ...formData, imagemUrl: "" });
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.conteudo) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(editando ? "Atualizando..." : "Criando publicação...");

    try {
      const url = editando ? `/api/publicacoes/${editando.id}` : "/api/publicacoes";
      const method = editando ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      toast.success(editando ? "Publicação atualizada!" : "Publicação criada!", { id: toastId });
      setDialogAberto(false);
      resetForm();
      carregarPublicacoes();
    } catch (error) {
      toast.error("Erro ao salvar", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editando) return;

    setSubmitting(true);
    const toastId = toast.loading("Excluindo publicação...");

    try {
      const res = await fetch(`/api/publicacoes/${editando.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir");

      toast.success("Publicação excluída!", { id: toastId });
      setDialogExcluir(false);
      setEditando(null);
      carregarPublicacoes();
    } catch (error) {
      toast.error("Erro ao excluir", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      conteudo: "",
      resumo: "",
      imagemUrl: "",
      autor: "",
      categoria: "NOTICIA",
      destaque: false,
      publicado: true,
    });
    setPreviewImage(null);
    setEditando(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const editarPublicacao = (pub: Publicacao) => {
    setEditando(pub);
    setFormData({
      titulo: pub.titulo,
      conteudo: pub.conteudo,
      resumo: pub.resumo || "",
      imagemUrl: pub.imagemUrl || "",
      autor: pub.autor || "",
      categoria: pub.categoria,
      destaque: pub.destaque,
      publicado: pub.publicado,
    });
    setPreviewImage(pub.imagemUrl);
    setDialogAberto(true);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case "EVENTO":
        return { label: "Evento", icon: <CalendarDays className="w-3 h-3" />, color: "bg-green-100 text-green-700" };
      case "COMUNICADO":
        return { label: "Comunicado", icon: <Megaphone className="w-3 h-3" />, color: "bg-blue-100 text-blue-700" };
      default:
        return { label: "Notícia", icon: <Newspaper className="w-3 h-3" />, color: "bg-orange-100 text-orange-700" };
    }
  };

  const publicacoesFiltradas = Array.isArray(publicacoes) 
    ? publicacoes.filter(pub => 
        pub.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        pub.resumo?.toLowerCase().includes(busca.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Publicações</h1>
          <p className="text-gray-500 mt-1">Gerencie notícias, eventos e comunicados</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogAberto(true);
          }}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Publicação
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar publicações..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publicacoesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma publicação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                publicacoesFiltradas.map((pub) => {
                  const categoria = getCategoriaLabel(pub.categoria);
                  return (
                    <TableRow key={pub.id}>
                      <TableCell className="font-medium">{pub.titulo}</TableCell>
                      <TableCell>
                        <Badge className={categoria.color}>
                          {categoria.icon}
                          <span className="ml-1">{categoria.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pub.publicado ? "default" : "secondary"}>
                          {pub.publicado ? "Publicado" : "Rascunho"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pub.destaque && (
                          <Badge className="bg-purple-100 text-purple-700">Destaque</Badge>
                        )}
                      </TableCell>
                      <TableCell>{pub.visualizacoes}</TableCell>
                      <TableCell className="text-gray-500">{formatarData(pub.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/publicacoes/${pub.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editarPublicacao(pub)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => {
                              setEditando(pub);
                              setDialogExcluir(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Publicação" : "Nova Publicação"}</DialogTitle>
            <DialogDescription>
              Preencha os dados da publicação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Digite o título"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOTICIA">Notícia</SelectItem>
                  <SelectItem value="EVENTO">Evento</SelectItem>
                  <SelectItem value="COMUNICADO">Comunicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Resumo</Label>
              <Textarea
                value={formData.resumo}
                onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                placeholder="Breve resumo da publicação"
                rows={2}
              />
            </div>
            <div>
              <Label>Conteúdo *</Label>
              <Textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                placeholder="Conteúdo completo (aceita HTML)"
                rows={8}
              />
            </div>
            
            {/* Upload de Imagem */}
            <div>
              <Label>Imagem</Label>
              <div className="mt-2">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Enviando..." : "Selecionar Imagem"}
                  </Button>
                  {(formData.imagemUrl || previewImage) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removerImagem}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  )}
                </div>
                
                {/* Preview da imagem */}
                {(previewImage || formData.imagemUrl) && (
                  <div className="mt-4 relative w-48 h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={previewImage || formData.imagemUrl || ""}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Formatos: JPG, PNG, WEBP, GIF. Máximo 5MB
                </p>
              </div>
            </div>
            
            <div>
              <Label>Autor</Label>
              <Input
                value={formData.autor}
                onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                placeholder="Nome do autor"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Publicado</Label>
              <Switch
                checked={formData.publicado}
                onCheckedChange={(checked) => setFormData({ ...formData, publicado: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Destaque</Label>
              <Switch
                checked={formData.destaque}
                onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editando ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={dialogExcluir} onOpenChange={setDialogExcluir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a publicação {editando?.titulo}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogExcluir(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
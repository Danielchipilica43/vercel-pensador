// app/adm/pages/configuracao/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Settings,
  Shield,
  Save,
  UserPlus,
  Edit,
  Trash2,
  DownloadCloud,
  UploadCloud,
  RefreshCw,
  Plus,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Tipos
interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "gestor";
  status: "ativo" | "inativo";
}

interface Curso {
  id: number;
  nome: string;
  duracao: number;
  descricao: string | null;
  vagas: number;
  ativo: boolean;
  turmas: Turma[];
  _count?: {
    inscricoes: number;
    turmas: number;
  };
}

interface Turma {
  id: number;
  nome: string;
  descricao: string | null;
  cursoId: number;
  curso?: { nome: string };
  anoLetivo: string;
  turnoId: number;
  turno?: { nome: string };
  vagasTotais: number;
  vagasDisponiveis: number;
  _count?: {
    alunos: number;
  };
}

interface Turno {
  id: number;
  nome: string;
}

interface BackupInfo {
  nome: string;
  data: string;
  tamanho: string;
}

export default function ConfiguracaoPage() {
  const [activeTab, setActiveTab] = useState("geral");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  
  // Estados para diálogos
  const [dialogNovoUsuario, setDialogNovoUsuario] = useState(false);
  const [dialogEditarUsuario, setDialogEditarUsuario] = useState(false);
  const [dialogNovoCurso, setDialogNovoCurso] = useState(false);
  const [dialogNovaTurma, setDialogNovaTurma] = useState(false);
  const [dialogEditarCurso, setDialogEditarCurso] = useState(false);
  const [dialogEditarTurma, setDialogEditarTurma] = useState(false);
  
  // Estados para formulários
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "gestor"
  });
  
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [editUsuario, setEditUsuario] = useState({
    nome: "",
    email: "",
    role: "",
    status: ""
  });
  
  const [novoCurso, setNovoCurso] = useState({
    nome: "",
    duracao: "",
    descricao: "",
    vagas: "60",
    ativo: true
  });
  
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  
  const [novaTurma, setNovaTurma] = useState({
    nome: "",
    descricao: "",
    cursoId: "",
    anoLetivo: new Date().getFullYear().toString(),
    turnoId: "",
    vagasTotais: "70"
  });
  
  const [turmaEditando, setTurmaEditando] = useState<Turma | null>(null);

  const [config, setConfig] = useState({
    nomeEscola: "IPP - Instituto Politécnico",
    email: "contato@ipp.ao",
    telefone: "+244 999 999 999",
    endereco: "Luanda, Angola",
    vagasPadrao: 70,
    idadeMinima: 15,
    idadeMaxima: 40,
    notificacoes: {
      emailAdmin: true,
      emailAluno: true,
      sms: false,
    },
    seguranca: {
      doisFatores: false,
      tempoSessao: 60,
      tentativasLogin: 5,
    },
    backup: {
      automatico: true,
      frequencia: "diario",
    }
  });

  // Carregar dados
  useEffect(() => {
    carregarConfiguracoes();
    carregarUsuarios();
    carregarCursos();
    carregarTurmas();
    carregarTurnos();
    carregarBackups();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (res.ok) {
        setConfig(data);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const res = await fetch("/api/usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const carregarCursos = async () => {
    try {
      const res = await fetch("/api/cursos");
      const data = await res.json();
      setCursos(data);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    }
  };

  const carregarTurmas = async () => {
    try {
      const res = await fetch("/api/turmas");
      const data = await res.json();
      setTurmas(data);
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const carregarTurnos = async () => {
    try {
      const res = await fetch("/api/turnos");
      const data = await res.json();
      setTurnos(data);
    } catch (error) {
      console.error("Erro ao carregar turnos:", error);
    }
  };

  const carregarBackups = async () => {
    try {
      const res = await fetch("/api/backup");
      const data = await res.json();
      setBackups(data);
    } catch (error) {
      console.error("Erro ao carregar backups:", error);
    }
  };

  const handleSave = async (section: string) => {
    setIsLoading(true);
    const toastId = toast.loading("Guardando configurações...");

    try {
      let dataToSave = {};
      
      if (section === "geral") {
        dataToSave = {
          nomeEscola: config.nomeEscola,
          email: config.email,
          telefone: config.telefone,
          endereco: config.endereco,
          vagasPadrao: config.vagasPadrao,
          idadeMinima: config.idadeMinima,
          idadeMaxima: config.idadeMaxima,
        };
      } else if (section === "seguranca") {
        dataToSave = config.seguranca;
      } else if (section === "backup") {
        dataToSave = config.backup;
      }

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data: dataToSave }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      toast.success("Configurações guardadas!", { id: toastId });
    } catch (error) {
      toast.error("Erro ao guardar configurações: " + error, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // USUÁRIOS
  // ============================================

  const handleCriarUsuario = async () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Criando usuário...");

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario),
      });

      if (!res.ok) throw new Error("Erro ao criar");

      toast.success("Usuário criado com sucesso!", { id: toastId });
      setDialogNovoUsuario(false);
      setNovoUsuario({ nome: "", email: "", senha: "", role: "gestor" });
      carregarUsuarios();
    } catch (error) {
      toast.error("Erro ao criar usuário: " + error, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbrirEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setEditUsuario({
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      status: usuario.status
    });
    setDialogEditarUsuario(true);
  };

  const handleEditarUsuario = async () => {
    if (!usuarioEditando) return;

    setIsLoading(true);
    const toastId = toast.loading("Atualizando usuário...");

    try {
      const res = await fetch(`/api/usuarios/${usuarioEditando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUsuario),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao atualizar");
      }

      toast.success("Usuário atualizado com sucesso!", { id: toastId });
      setDialogEditarUsuario(false);
      setUsuarioEditando(null);
      setEditUsuario({ nome: "", email: "", role: "", status: "" });
      carregarUsuarios();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar usuário", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const toastId = toast.loading("Removendo usuário...");

    try {
      const res = await fetch(`/api/usuarios/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao remover");

      toast.success("Usuário removido!", { id: toastId });
      carregarUsuarios();
    } catch (error) {
      toast.error("Erro ao remover usuário: " + error, { id: toastId });
    }
  };

  // ============================================
  // CURSOS - CORRIGIDOS
  // ============================================

  const handleCriarCurso = async () => {
    if (!novoCurso.nome || !novoCurso.duracao) {
      toast.error("Nome e duração são obrigatórios");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Criando curso...");

    try {
      // 🔥 CONVERTER PARA NÚMERO ANTES DE ENVIAR
      const dadosParaEnviar = {
        nome: novoCurso.nome,
        duracao: parseInt(novoCurso.duracao),
        descricao: novoCurso.descricao,
        vagas: parseInt(novoCurso.vagas),
        ativo: novoCurso.ativo
      };

      const res = await fetch("/api/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao criar curso");
      }

      toast.success("Curso criado com sucesso!", { id: toastId });
      setDialogNovoCurso(false);
      setNovoCurso({ nome: "", duracao: "", descricao: "", vagas: "40", ativo: true });
      carregarCursos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar curso", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarCurso = async () => {
    if (!cursoEditando) return;

    setIsLoading(true);
    const toastId = toast.loading("Atualizando curso...");

    try {
      // 🔥 CONVERTER PARA NÚMERO ANTES DE ENVIAR
      const dadosParaEnviar = {
        nome: cursoEditando.nome,
        duracao: cursoEditando.duracao,
        descricao: cursoEditando.descricao,
        vagas: cursoEditando.vagas,
        ativo: cursoEditando.ativo
      };

      const res = await fetch(`/api/cursos/${cursoEditando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao atualizar");
      }

      toast.success("Curso atualizado!", { id: toastId });
      setDialogEditarCurso(false);
      setCursoEditando(null);
      carregarCursos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar curso", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCurso = async (id: number) => {
    const toastId = toast.loading("Removendo curso...");

    try {
      const res = await fetch(`/api/cursos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover");

      toast.success(data.message || "Curso removido!", { id: toastId });
      carregarCursos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover curso", { id: toastId });
    }
  };

  // ============================================
  // TURMAS
  // ============================================

  const handleCriarTurma = async () => {
    if (!novaTurma.nome || !novaTurma.cursoId || !novaTurma.anoLetivo || !novaTurma.turnoId) {
      toast.error("Nome, curso, ano letivo e turno são obrigatórios");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Criando turma...");

    try {
      // 🔥 CONVERTER PARA NÚMERO ANTES DE ENVIAR
      const dadosParaEnviar = {
        nome: novaTurma.nome,
        descricao: novaTurma.descricao,
        cursoId: parseInt(novaTurma.cursoId),
        anoLetivo: novaTurma.anoLetivo,
        turnoId: parseInt(novaTurma.turnoId),
        vagasTotais: parseInt(novaTurma.vagasTotais)
      };

      const res = await fetch("/api/turmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao criar");
      }

      toast.success("Turma criada com sucesso!", { id: toastId });
      setDialogNovaTurma(false);
      setNovaTurma({
        nome: "",
        descricao: "",
        cursoId: "",
        anoLetivo: new Date().getFullYear().toString(),
        turnoId: "",
        vagasTotais: "70"
      });
      carregarTurmas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar turma", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarTurma = async () => {
    if (!turmaEditando) return;

    setIsLoading(true);
    const toastId = toast.loading("Atualizando turma...");

    try {
      const res = await fetch(`/api/turmas/${turmaEditando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(turmaEditando),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao atualizar");
      }

      toast.success("Turma atualizada!", { id: toastId });
      setDialogEditarTurma(false);
      setTurmaEditando(null);
      carregarTurmas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar turma", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTurma = async (id: number) => {
    const toastId = toast.loading("Removendo turma...");

    try {
      const res = await fetch(`/api/turmas/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover");

      toast.success(data.message || "Turma removida!", { id: toastId });
      carregarTurmas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover turma", { id: toastId });
    }
  };

  // ============================================
  // BACKUP
  // ============================================

  const handleCriarBackup = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Criando backup...");

    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "criar" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar backup");

      toast.success(data.message || "Backup criado!", { id: toastId });
      carregarBackups();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar backup", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurarBackup = async (arquivo: string) => {
    setIsLoading(true);
    const toastId = toast.loading("Restaurando backup...");

    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "restaurar", arquivo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao restaurar");

      toast.success(data.message || "Backup restaurado!", { id: toastId });
      carregarConfiguracoes();
      carregarUsuarios();
      carregarCursos();
      carregarTurmas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao restaurar backup", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" />
          Configurações
        </h1>
        <Badge variant="outline" className="bg-orange-50 text-orange-600">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="usuarios">Utilizadores</TabsTrigger>
          <TabsTrigger value="cursos">Cursos</TabsTrigger>
          <TabsTrigger value="turmas">Turmas</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Geral */}
        <TabsContent value="geral" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Instituição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Instituição</Label>
                  <Input value={config.nomeEscola} onChange={(e) => setConfig({...config, nomeEscola: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={config.email} onChange={(e) => setConfig({...config, email: e.target.value})} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={config.telefone} onChange={(e) => setConfig({...config, telefone: e.target.value})} />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input value={config.endereco} onChange={(e) => setConfig({...config, endereco: e.target.value})} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vagas padrão por curso</Label>
                  <Input type="number" value={config.vagasPadrao} onChange={(e) => setConfig({...config, vagasPadrao: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label>Idade mínima</Label>
                  <Input type="number" value={config.idadeMinima} onChange={(e) => setConfig({...config, idadeMinima: parseInt(e.target.value)})} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("geral")} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Utilizadores */}
        <TabsContent value="usuarios" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Utilizadores</CardTitle>
                <CardDescription>Gerencie os acessos ao sistema</CardDescription>
              </div>
              <Dialog open={dialogNovoUsuario} onOpenChange={setDialogNovoUsuario}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Utilizador</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input 
                      placeholder="Nome completo" 
                      value={novoUsuario.nome}
                      onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                    />
                    <Input 
                      type="email" 
                      placeholder="Email"
                      value={novoUsuario.email}
                      onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                    />
                    <Input 
                      type="password" 
                      placeholder="Senha"
                      value={novoUsuario.senha}
                      onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                    />
                    <Select value={novoUsuario.role} onValueChange={(value) => setNovoUsuario({...novoUsuario, role: value as string})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nível de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogNovoUsuario(false)}>Cancelar</Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCriarUsuario} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Criar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Administrador" : "Gestor"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.status === "ativo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {user.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-600"
                            onClick={() => handleAbrirEditarUsuario(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600" 
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cursos */}
        <TabsContent value="cursos" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cursos</CardTitle>
                <CardDescription>Gerencie os cursos da instituição</CardDescription>
              </div>
              <Dialog open={dialogNovoCurso} onOpenChange={setDialogNovoCurso}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Curso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Curso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Nome do Curso *</Label>
                      <Input 
                        placeholder="Ex: INFORMATICA"
                        value={novoCurso.nome}
                        onChange={(e) => setNovoCurso({...novoCurso, nome: e.target.value.toUpperCase()})}
                      /> 
                    </div>
                    <div>
                      <Label>Duração (anos) *</Label>
                      <Input 
                        type="number"
                        placeholder="4"
                        value={novoCurso.duracao}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setNovoCurso({...novoCurso, duracao: value})
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea 
                        placeholder="Descrição do curso"
                        value={novoCurso.descricao}
                        onChange={(e) => setNovoCurso({...novoCurso, descricao: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Vagas *</Label>
                      <Input 
                        type="number"
                        placeholder="50"
                        value={novoCurso.vagas}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setNovoCurso({...novoCurso, vagas: value})
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Curso Ativo</Label>
                      <Switch 
                        checked={novoCurso.ativo} 
                        onCheckedChange={(checked) => setNovoCurso({...novoCurso, ativo: checked})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogNovoCurso(false)}>Cancelar</Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCriarCurso} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Criar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Inscrições</TableHead>
                    <TableHead>Turmas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cursos.map((curso) => (
                    <TableRow key={curso.id}>
                      <TableCell className="font-medium">{curso.nome}</TableCell>
                      <TableCell>{curso.duracao} anos</TableCell>
                      <TableCell>{curso.vagas}</TableCell>
                      <TableCell>{curso._count?.inscricoes || 0}</TableCell>
                      <TableCell>{curso._count?.turmas || 0}</TableCell>
                      <TableCell>
                        <Badge className={curso.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {curso.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              setCursoEditando(curso);
                              setDialogEditarCurso(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteCurso(curso.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Turmas */}
        <TabsContent value="turmas" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Turmas</CardTitle>
                <CardDescription>Gerencie as turmas da instituição</CardDescription>
              </div>
              <Dialog open={dialogNovaTurma} onOpenChange={setDialogNovaTurma}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Turma
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Turma</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Nome da Turma *</Label>
                      <Input 
                        placeholder="Ex: 10ª INF - A"
                        value={novaTurma.nome}
                        onChange={(e) => setNovaTurma({...novaTurma, nome: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Curso *</Label>
                      <Select value={novaTurma.cursoId} onValueChange={(value) => setNovaTurma({...novaTurma, cursoId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {cursos.filter(c => c.ativo).map((curso) => (
                            <SelectItem key={curso.id} value={curso.id.toString()}>
                              {curso.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ano Letivo *</Label>
                      <Input 
                        placeholder="2026"
                        value={novaTurma.anoLetivo}
                        onChange={(e) => setNovaTurma({...novaTurma, anoLetivo: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Turno *</Label>
                      <Select value={novaTurma.turnoId} onValueChange={(value) => setNovaTurma({...novaTurma, turnoId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                        <SelectContent>
                          {turnos.map((turno) => (
                            <SelectItem key={turno.id} value={turno.id.toString()}>
                              {turno.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Vagas Totais</Label>
                      <Input 
                        type="number"
                        placeholder="65"
                        value={novaTurma.vagasTotais}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setNovaTurma({...novaTurma, vagasTotais: value})
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea 
                        placeholder="Descrição da turma"
                        value={novaTurma.descricao}
                        onChange={(e) => setNovaTurma({...novaTurma, descricao: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogNovaTurma(false)}>Cancelar</Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCriarTurma} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Criar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Turma</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Ano Letivo</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Vagas Restante</TableHead>
                    <TableHead>Alunos</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turmas.map((turma) => (
                    <TableRow key={turma.id}>
                      <TableCell className="font-medium">{turma.nome}</TableCell>
                      <TableCell>{turma.curso?.nome}</TableCell>
                      <TableCell>{turma.anoLetivo}</TableCell>
                      <TableCell>{turma.turno?.nome}</TableCell>
                      <TableCell>{turma.vagasTotais}</TableCell>
                      <TableCell>
                        <Badge className={turma.vagasDisponiveis > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {turma.vagasTotais - (turma._count?.alunos || 0)}
                        </Badge>
                      </TableCell>
                      <TableCell>{turma._count?.alunos || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => { 
                              setTurmaEditando(turma);
                              setDialogEditarTurma(true);
                            }} 
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteTurma(turma.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação dois fatores</Label>
                  <p className="text-sm text-gray-500">Exigir 2FA para admins</p>
                </div>
                <Switch checked={config.seguranca.doisFatores} onCheckedChange={(checked) => setConfig({
                  ...config, seguranca: {...config.seguranca, doisFatores: checked}
                })} />
              </div>

              <Separator />

              <div>
                <Label>Tempo de sessão (minutos)</Label>
                <Input type="number" value={config.seguranca.tempoSessao} onChange={(e) => setConfig({
                  ...config, seguranca: {...config.seguranca, tempoSessao: parseInt(e.target.value)}
                })} />
              </div>

              <Separator />

              <div>
                <Label>Tentativas de login</Label>
                <Input type="number" value={config.seguranca.tentativasLogin} onChange={(e) => setConfig({
                  ...config, seguranca: {...config.seguranca, tentativasLogin: parseInt(e.target.value)}
                })} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("seguranca")} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Backup automático</Label>
                  <p className="text-sm text-gray-500">Realizar backup diário</p>
                </div>
                <Switch checked={config.backup.automatico} onCheckedChange={(checked) => setConfig({
                  ...config, backup: {...config.backup, automatico: checked}
                })} />
              </div>

              {config.backup.automatico && (
                <>
                  <Separator />
                  <div>
                    <Label>Frequência</Label>
                    <Select value={config.backup.frequencia} onValueChange={(value) => setConfig({
                      ...config, backup: {...config.backup, frequencia: value}
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={handleCriarBackup} disabled={isLoading}>
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  Criar Backup
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleSave("backup")} disabled={isLoading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Guardar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backups recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum backup encontrado</p>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div key={backup.nome} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm">{new Date(backup.data).toLocaleString()}</span>
                        <span className="text-xs text-gray-500 ml-2">({backup.tamanho})</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRestaurarBackup(backup.nome)}
                      >
                        <UploadCloud className="w-4 h-4 mr-1" />
                        Restaurar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Editar Usuário */}
      <Dialog open={dialogEditarUsuario} onOpenChange={setDialogEditarUsuario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
            <DialogDescription>
              Altere as informações do usuário cadastrado.
            </DialogDescription>
          </DialogHeader>
          {usuarioEditando && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Nome completo</Label>
                <Input 
                  value={editUsuario.nome}
                  onChange={(e) => setEditUsuario({...editUsuario, nome: e.target.value})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={editUsuario.email}
                  onChange={(e) => setEditUsuario({...editUsuario, email: e.target.value})}
                />
              </div>
              <div>
                <Label>Nível de acesso</Label>
                <Select value={editUsuario.role} onValueChange={(value) => setEditUsuario({...editUsuario, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editUsuario.status} onValueChange={(value) => setEditUsuario({...editUsuario, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarUsuario(false)}>Cancelar</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleEditarUsuario} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Curso */}
      <Dialog open={dialogEditarCurso} onOpenChange={setDialogEditarCurso}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          {cursoEditando && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Nome do Curso</Label>
                <Input 
                  value={cursoEditando.nome}
                  onChange={(e) => setCursoEditando({...cursoEditando, nome: e.target.value.toUpperCase()})}
                />
              </div>
              <div>
                <Label>Duração (anos)</Label>
                <Input 
                  type="number"
                  value={cursoEditando.duracao}
                  onChange={(e) => setCursoEditando({...cursoEditando, duracao: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea 
                  value={cursoEditando.descricao || ""}
                  onChange={(e) => setCursoEditando({...cursoEditando, descricao: e.target.value})}
                />
              </div>
              <div>
                <Label>Vagas</Label>
                <Input 
                  type="number"
                  value={cursoEditando.vagas}
                  onChange={(e) => setCursoEditando({...cursoEditando, vagas: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Curso Ativo</Label>
                <Switch 
                  checked={cursoEditando.ativo} 
                  onCheckedChange={(checked) => setCursoEditando({...cursoEditando, ativo: checked})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarCurso(false)}>Cancelar</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleEditarCurso} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Turma */}
      <Dialog open={dialogEditarTurma} onOpenChange={setDialogEditarTurma}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
          </DialogHeader>
          {turmaEditando && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Nome da Turma</Label>
                <Input 
                  value={turmaEditando.nome}
                  onChange={(e) => setTurmaEditando({...turmaEditando, nome: e.target.value})}
                />
              </div>
              <div>
                <Label>Curso</Label>
                <Select value={turmaEditando.cursoId.toString()} onValueChange={(value) => setTurmaEditando({...turmaEditando, cursoId: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.filter(c => c.ativo).map((curso) => (
                      <SelectItem key={curso.id} value={curso.id.toString()}>
                        {curso.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ano Letivo</Label>
                <Input 
                  value={turmaEditando.anoLetivo}
                  onChange={(e) => setTurmaEditando({...turmaEditando, anoLetivo: e.target.value})}
                />
              </div>
              <div>
                <Label>Turno</Label>
                <Select value={turmaEditando.turnoId.toString()} onValueChange={(value) => setTurmaEditando({...turmaEditando, turnoId: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {turnos.map((turno) => (
                      <SelectItem key={turno.id} value={turno.id.toString()}>
                        {turno.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vagas Totais</Label>
                <Input 
                  type="number"
                  value={turmaEditando.vagasTotais}
                  onChange={(e) => setTurmaEditando({...turmaEditando, vagasTotais: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea 
                  value={turmaEditando.descricao || ""}
                  onChange={(e) => setTurmaEditando({...turmaEditando, descricao: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarTurma(false)}>Cancelar</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleEditarTurma} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
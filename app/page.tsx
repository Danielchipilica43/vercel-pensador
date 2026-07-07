"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  ArrowRight, 
  Clock,
  ChevronRight,
  Sparkles,
  School,
  FileCheck,
  Megaphone,
  Award,
  Users,
  Calendar
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Publicacoes } from "./components/Publicacoes";

export default function HomePage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [stats, setStats] = useState({
    inscricoes: 0,
    matriculas: 0,
    cursos: 4
  });

  // Carregar estatísticas reais da API
  useEffect(() => {
    const carregarStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
        // Fallback para dados mockados
        setStats({
          inscricoes: 150,
          matriculas: 89,
          cursos: 4
        });
      }
    };
    carregarStats();
  }, []);

  const features = [
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Inscrição Online",
      description: "Faça sua inscrição de forma rápida e segura",
      color: "from-blue-500 to-blue-600",
      link: "/inscricao"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Acompanhamento",
      description: "Acompanhe o status da sua candidatura em tempo real",
      color: "from-orange-500 to-orange-600",
      link: "/status"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Matrícula",
      description: "Finalize sua matrícula com documentos digitais",
      color: "from-green-500 to-green-600",
      link: "/matricula"
    }
  ];

  const cursos = [
    { nome: "Informática", vagas: 75, inscritos: 55, icon: "💻" },
    { nome: "Electricidade", vagas: 80, inscritos: 49, icon: "⚡" },
    { nome: "Construção Civil", vagas: 80, inscritos: 45, icon: "🏗️" },
    { nome: "Máquinas e Motores", vagas: 85, inscritos: 60, icon: "🔧" }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-gray-50">
      {/* Header com navegação */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur rounded-b-full-md z-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-linear-to-r from-orange-500 to-orange-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800">
                Pensador do Futuro
              </span>
              <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-600 border-orange-200">
                Academy
              </Badge>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#inicio" className="text-gray-600 hover:text-orange-600 transition">
                Início
              </Link>
              <Link href="#cursos" className="text-gray-600 hover:text-orange-600 transition">
                Cursos
              </Link>
              <Link href="#sobre" className="text-gray-600 hover:text-orange-600 transition">
                Sobre
              </Link>
              <Link href="#contacto" className="text-gray-600 hover:text-orange-600 transition">
                Contacto
              </Link>
            </nav>

            {/* Botão Acesso Sistema */}
            <Button
              onClick={() => handleNavigation("/auth/login")}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50 hidden md:flex"
            >
              Acessar Sistema
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Menu Mobile (simplificado) */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <School className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Espaçador para o header fixo */}
      <div className="h-16" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorativo animado */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-orange-200 rounded-full opacity-20"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-200 rounded-full opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Conteúdo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Inscrições Abertas 2026
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                Bem-vindo ao{' '}
                <span className="bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Pensador do Futuro
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Inscreva-se, matricule-se e acompanhe seu processo de forma rápida e segura. 
                Sua jornada educacional começa aqui.
              </p>

              {/* Botões CTA */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  onClick={() => handleNavigation("/inscricao")}
                  size="lg"
                  variant="secondary"
                  className="bg-linear-to-r z-10 from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white group"
                >
                  Faça sua Inscrição
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Button>
                
                <Button
                 onClick={() => handleNavigation("/status")}
                  size="lg"
                  variant="outline"
                  className="border-orange-500 z-10 text-orange-600 hover:bg-orange-50"
                >
                  Ver Status
                </Button>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-orange-600">{stats.inscricoes}+</div>
                  <div className="text-sm text-gray-600">Inscrições</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">{stats.matriculas}+</div>
                  <div className="text-sm text-gray-600">Matrículas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">{stats.cursos}</div>
                  <div className="text-sm text-gray-600">Cursos</div>
                </div>
              </div>
            </motion.div>

            {/* Imagem/Ilustração */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-125">
                <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-orange-600 rounded-3xl opacity-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <Card className="p-6 bg-white/90 backdrop-blur rounded-full flex justify-center items-center">
                      <GraduationCap className="w-8 h-8 text-orange-500 mb-2" />
                      <p className="font-semibold">Ensino Técnico</p>
                    </Card>
                    <Card className="p-6 bg-white/90 backdrop-blur rounded-full flex justify-center items-center">
                      <Award className="w-8 h-8 text-orange-500 mb-2" />
                      <p className="font-semibold">Certificação</p>
                    </Card>
                    <Card className="p-6 bg-white/90 backdrop-blur rounded-full flex justify-center items-center">
                      <Users className="w-8 h-8 text-orange-500 mb-2" />
                      <p className="font-semibold">Turmas Reduzidas</p>
                    </Card>
                    <Card className="p-6 bg-white/90 backdrop-blur rounded-full flex justify-center items-center">
                      <Calendar className="w-8 h-8 text-orange-500 mb-2" />
                      <p className="font-semibold">Início Imediato</p>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seção de Publicações/Eventos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge variant="outline" className="mb-2 bg-orange-50">
                <Megaphone className="w-3 h-3 mr-1" />
                Novidades
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Notícias e Eventos
              </h2>
              <p className="text-gray-600 mt-1">Fique por dentro das últimas novidades da nossa instituição</p>
            </div>
            <Link href="/publicacoes">
              <Button variant="link" className="text-orange-600">
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <Publicacoes />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Como Funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Processo Simplificado em 3 Passos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Facilitamos sua jornada desde a inscrição até a matrícula
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onHoverStart={() => setIsHovered(feature.title)}
                onHoverEnd={() => setIsHovered(null)}
                onClick={() => handleNavigation(feature.link)}
                className="cursor-pointer"
              >
                <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isHovered === feature.title ? 'scale-105' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-linear-to-r ${feature.color} text-white flex items-center justify-center mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="flex items-center text-orange-600 font-medium">
                      Acessar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                    
                    {/* Número decorativo */}
                    <div className="absolute -bottom-4 -right-4 text-8xl font-bold text-gray-100">
                      {index + 1}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cursos Section */}
      <section id="cursos" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-orange-50">Nossos Cursos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Cursos Técnicos Profissionalizantes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Escolha o curso que melhor se adequa ao seu futuro profissional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cursos.map((curso, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{curso.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{curso.nome}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Vagas:</span>
                        <span className="font-medium">{curso.vagas}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Inscritos:</span>
                        <span className="font-medium">{curso.inscritos}</span>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-linear-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                        style={{ width: `${(curso.inscritos / curso.vagas) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {curso.vagas - curso.inscritos} vagas restantes
                    </p>

                    <Button 
                      variant="link" 
                      className="mt-4 p-0 text-orange-600"
                      onClick={() => handleNavigation("/inscricao")}
                    >
                      Inscrever-se
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-linear-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-lg mb-8 text-orange-100 max-w-2xl mx-auto">
                Garanta sua vaga em um dos nossos cursos técnicos e dê o primeiro passo para o seu futuro profissional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => handleNavigation("/inscricao")}
                  size="lg"
                  variant="secondary"
                  className="bg-white text-orange-600 hover:bg-gray-300 hover:text-orange-700"
                >
                  Fazer Inscrição Agora
                </Button>
                <Button
                  onClick={() => handleNavigation("/status")}
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-orange-700 hover:border-orange-700 hover:text-orange-700"
                >
                  Verificar Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">
                  Pensador do Futuro
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Formando profissionais para o futuro com excelência e dedicação.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/inscricao" className="hover:text-orange-400 transition">Inscrição</Link></li>
                <li><Link href="/status" className="hover:text-orange-400 transition">Status</Link></li>
                <li><Link href="/matricula" className="hover:text-orange-400 transition">Matrícula</Link></li>
                <li><Link href="/publicacoes" className="hover:text-orange-400 transition">Notícias</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Cursos</h4>
              <ul className="space-y-2 text-sm">
                <li>Informática</li>
                <li>Electricidade</li>
                <li>Construção Civil</li>
                <li>Máquinas e Motores</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>contacto@pensadordofuturo.ao</li>
                <li>+244 999 999 999</li>
                <li>Luanda, Angola</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            &copy; 2026 Pensador do Futuro Academy. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Botão flutuante para mobile */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <Button
          onClick={() => handleNavigation("/inscricao")}
          className="bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-full w-14 h-14 shadow-lg"
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
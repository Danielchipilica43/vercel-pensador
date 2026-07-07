// app/not-found.tsx
"use client"
import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {



  function voltar() { 
    window.history.back()
  } 
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Número 404 animado */}
        <div className="relative mb-8">
          <div className="text-[200px] md:text-[300px] font-bold text-gray-800 opacity-5 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <h1 className="text-9xl font-bold text-gray-800">
                4
                <span className="inline-block animate-bounce text-blue-600">0</span>
                4
              </h1>
              <div className="absolute -right-4 -top-4 w-8 h-8 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
        </div>

        {/* Mensagem principal */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Oops! Parece que você seguiu um link quebrado ou digitou um URL que não existe em nosso site.
          </p>
        </div>

        {/* Ilustração/Ícone */}
        <div className="mb-12">
          <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="relative">
              <div className="w-24 h-24 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-red-400 rounded-full border-4 border-white"></div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Voltar para Home
          </Link>
          
          <button
            onClick={voltar }
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para página anterior
          </button>
        </div>

        {/* Busca */}
        <div className="max-w-md mx-auto">
          <p className="text-gray-600 mb-4">Ou tente buscar o que procura:</p>
          <div className="relative">
            <input
              type="text"
              placeholder="O que você está procurando?"
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <button className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Buscar
            </button>
          </div>
        </div>

        {/* Links úteis */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Talvez você queira visitar:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Blog', 'Sobre', 'Contato', 'Produtos', 'Suporte'].map((link) => (
              <Link
                key={link}
                href={`/${link.toLowerCase()}`}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
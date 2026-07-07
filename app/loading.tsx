export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-white">
      <div className="text-center">
        {/* Spinner animado */}
        <div className="relative">
          <div className=" justify-center flex items-center">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 ml-12 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            
          </div>
        </div>
        
        {/* Texto com fade */}
        <p className="mt-6 text-gray-600 font-medium animate-pulse">
          Carregando a pagina...
        </p>
        
        {/* Pontinhos animados */}
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
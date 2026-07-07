// app/adm/layout.tsx
'use client';


import { RouteGuard } from '../components/RouteGuard';
import Sidebar from './components/sidebar';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className="flex h-screen">
       <Sidebar />
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}

<script
  dangerouslySetInnerHTML={{
    __html: `
      // Monitorar todas as requisições fetch
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        if (args[0].includes('/404')) {
          console.warn('🔴 Requisição suspeita:', args[0]);
          console.trace();
        }
        return originalFetch.apply(this, args);
      };
    `,
  }}
/>
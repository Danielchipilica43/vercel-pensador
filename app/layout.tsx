import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instituto Politecnico",
  description: "Pensador do Futuro 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        {children}
          <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}


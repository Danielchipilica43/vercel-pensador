// app/adm/pages/email-logs/page.tsx
"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EmailLogsPage() {
  const { data: logs, isLoading } = useSWR("/api/email-logs", fetcher);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Logs de Emails</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs?.map((log: any) => (
              <div key={log.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.to}</p>
                    <p className="text-sm text-gray-500">{log.subject}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <Badge className={log.status === "ENVIADO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {log.status}
                  </Badge>
                </div>
                {log.error && (
                  <p className="text-xs text-red-500 mt-2">Erro: {log.error}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
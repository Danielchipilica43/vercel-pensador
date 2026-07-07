// /app/adm/usuarios/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UsuariosPage() {
  const usuarios = [
    { id: 1, email: "root@ipp.com", role: "root" },
    { id: 2, email: "usuario1@ipp.com", role: "limited" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h1>
      {usuarios.map((user) => (
        <Card key={user.id} className="mb-2">
          <CardHeader>
            <CardTitle>{user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Role: {user.role}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

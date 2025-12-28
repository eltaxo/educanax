import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Bell, Plus, ExternalLink } from 'lucide-react';
import { CopyButton } from '@/components/admin/copy-button';

// Force dynamic rendering to avoid database queries during build
export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [unidadesActivas, unidadesCompletadas, unidadesProximas, avisosActivos, configuracion] =
    await Promise.all([
      prisma.unidadDidactica.count({
        where: { estado: 'ACTIVA', visible: true },
      }),
      prisma.unidadDidactica.count({
        where: { estado: 'COMPLETADA', visible: true },
      }),
      prisma.unidadDidactica.count({
        where: { estado: 'PROXIMA', visible: true },
      }),
      prisma.aviso.findMany({
        where: {
          visible: true,
          fechaPublicacion: { lte: new Date() },
          OR: [
            { fechaExpiracion: null },
            { fechaExpiracion: { gte: new Date() } },
          ],
        },
        orderBy: { fechaPublicacion: 'desc' },
        take: 5,
        include: {
          curso: true,
        },
      }),
      prisma.configuracion.findFirst(),
    ]);

  return {
    unidadesActivas,
    unidadesCompletadas,
    unidadesProximas,
    avisosActivos,
    configuracion,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();
  const portalUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestiona tu portal educativo
          </p>
        </div>
      </div>

      {/* URL pública del portal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            URL Pública del Portal
          </CardTitle>
          <CardDescription>
            Comparte esta URL con los padres para que accedan al portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-gray-100 px-4 py-2 text-sm">
              {portalUrl}
            </code>
            <CopyButton text={portalUrl} />
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unidades Activas
            </CardTitle>
            <Badge variant="success">Activa</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.unidadesActivas}</div>
            <p className="text-xs text-muted-foreground">
              Unidades en curso actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unidades Completadas
            </CardTitle>
            <Badge variant="secondary">Completada</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.unidadesCompletadas}</div>
            <p className="text-xs text-muted-foreground">
              Unidades finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unidades Próximas
            </CardTitle>
            <Badge>Próxima</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.unidadesProximas}</div>
            <p className="text-xs text-muted-foreground">
              Unidades planificadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/unidades?nuevo=true">
              <Button className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Crear Nueva Unidad
              </Button>
            </Link>
            <Link href="/admin/avisos?nuevo=true">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                Publicar Aviso
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Avisos Activos
            </CardTitle>
            <CardDescription>Últimos avisos publicados</CardDescription>
          </CardHeader>
          <CardContent>
            {data.avisosActivos.length > 0 ? (
              <div className="space-y-2">
                {data.avisosActivos.map((aviso) => (
                  <div
                    key={aviso.id}
                    className="flex items-start gap-2 rounded-lg border p-3"
                  >
                    <Badge
                      variant={
                        aviso.tipo === 'URGENTE'
                          ? 'destructive'
                          : aviso.tipo === 'IMPORTANTE'
                          ? 'warning'
                          : 'default'
                      }
                      className="mt-0.5"
                    >
                      {aviso.tipo}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {aviso.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {aviso.curso?.nombre || 'Todos los cursos'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay avisos activos
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

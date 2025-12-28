import { prisma } from '@/lib/prisma';
import PortalHeader from '@/components/portal/header';
import PortalFooter from '@/components/portal/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Info, AlertCircle, AlertTriangle, BookOpen, Calculator, Globe, Music, Palette, Beaker } from 'lucide-react';

const iconMap: Record<string, any> = {
  BookOpen,
  Calculator,
  Globe,
  Music,
  Palette,
  Beaker,
};

const tipoAvisoConfig = {
  INFO: { icon: Info, color: 'bg-blue-100', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
  IMPORTANTE: { icon: AlertCircle, color: 'bg-orange-100', textColor: 'text-orange-600', borderColor: 'border-orange-200' },
  URGENTE: { icon: AlertTriangle, color: 'bg-red-100', textColor: 'text-red-600', borderColor: 'border-red-200' },
};

export default async function Home() {
  // Obtener configuración
  const config = await prisma.configuracion.findFirst();

  // Obtener avisos activos
  const now = new Date();
  const avisos = await prisma.aviso.findMany({
    where: {
      visible: true,
      fechaPublicacion: { lte: now },
      OR: [
        { fechaExpiracion: null },
        { fechaExpiracion: { gte: now } },
      ],
    },
    orderBy: [
      { tipo: 'desc' }, // URGENTE primero
      { fechaPublicacion: 'desc' },
    ],
    include: {
      curso: true,
    },
  });

  // Obtener cursos activos con asignaturas visibles
  const cursos = await prisma.curso.findMany({
    where: { activo: true },
    include: {
      asignaturas: {
        where: { visible: true },
        orderBy: { orden: 'asc' },
      },
    },
    orderBy: { nombre: 'asc' },
  });

  const colorPrimario = config?.colorPrimario || '#3B82F6';

  return (
    <>
      <PortalHeader
        nombreColegio={config?.nombreColegio || 'Portal Educativo'}
        logo={config?.logo}
        colorPrimario={colorPrimario}
      />

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Mensaje de bienvenida */}
          {config?.mensajeBienvenida && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-lg text-center text-muted-foreground">
                  {config.mensajeBienvenida}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Avisos */}
          {avisos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: colorPrimario }}>
                Avisos y Comunicaciones
              </h2>
              <div className="space-y-3">
                {avisos.map((aviso) => {
                  const config = tipoAvisoConfig[aviso.tipo];
                  const Icon = config.icon;

                  return (
                    <Card key={aviso.id} className={`border-2 ${config.borderColor}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color} flex-shrink-0`}>
                            <Icon className={`h-5 w-5 ${config.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{aviso.titulo}</h3>
                              <div className="flex gap-2 flex-shrink-0">
                                <Badge variant={aviso.tipo === 'URGENTE' ? 'destructive' : aviso.tipo === 'IMPORTANTE' ? 'default' : 'secondary'}>
                                  {aviso.tipo}
                                </Badge>
                                {aviso.curso && (
                                  <Badge variant="outline">{aviso.curso.nombre}</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-line">{aviso.mensaje}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(aviso.fechaPublicacion).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Asignaturas por curso */}
          {cursos.map((curso) => {
            if (curso.asignaturas.length === 0) return null;

            return (
              <section key={curso.id}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: colorPrimario }}>
                  {curso.nombre}
                </h2>
                {curso.descripcion && (
                  <p className="text-muted-foreground mb-4">{curso.descripcion}</p>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {curso.asignaturas.map((asignatura) => {
                    const Icon = iconMap[asignatura.icono] || BookOpen;

                    return (
                      <Link key={asignatura.id} href={`/asignatura/${asignatura.slug}`}>
                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="h-12 w-12 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: asignatura.color + '20' }}
                              >
                                <Icon
                                  className="h-6 w-6"
                                  style={{ color: asignatura.color }}
                                />
                              </div>
                              <CardTitle className="text-xl">{asignatura.nombre}</CardTitle>
                            </div>
                          </CardHeader>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Estado vacío */}
          {cursos.every(c => c.asignaturas.length === 0) && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No hay asignaturas disponibles</h3>
              <p className="text-muted-foreground">
                El profesor aún no ha publicado contenido educativo.
              </p>
            </div>
          )}
        </div>
      </main>

      <PortalFooter contactoProfesor={config?.contactoProfesor} />
    </>
  );
}

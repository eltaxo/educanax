import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PortalHeader from '@/components/portal/header';
import PortalFooter from '@/components/portal/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BookOpen, Calculator, Globe, Music, Palette, Beaker, ArrowLeft, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

// Force dynamic rendering to avoid database queries during build
export const dynamic = 'force-dynamic';

const iconMap: Record<string, any> = {
  BookOpen,
  Calculator,
  Globe,
  Music,
  Palette,
  Beaker,
};

const estadoConfig = {
  PROXIMA: { label: 'Próxima', color: 'secondary', icon: Clock },
  ACTIVA: { label: 'Activa', color: 'default', icon: PlayCircle },
  COMPLETADA: { label: 'Completada', color: 'outline', icon: CheckCircle2 },
};

export default async function AsignaturaPage({ params }: { params: { slug: string } }) {
  // Obtener configuración
  const config = await prisma.configuracion.findFirst();

  // Obtener asignatura con unidades
  const asignatura = await prisma.asignatura.findFirst({
    where: { slug: params.slug, visible: true },
    include: {
      curso: true,
      unidades: {
        where: { visible: true },
        orderBy: { numero: 'asc' },
        include: {
          _count: {
            select: {
              contenidos: true,
              criterios: true,
            },
          },
        },
      },
    },
  });

  if (!asignatura) {
    notFound();
  }

  const Icon = iconMap[asignatura.icono] || BookOpen;
  const colorPrimario = config?.colorPrimario || '#3B82F6';

  return (
    <>
      <PortalHeader
        nombreColegio={config?.nombreColegio || 'Portal Educativo'}
        logo={config?.logo}
        colorPrimario={colorPrimario}
      />

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {/* Cabecera de la asignatura */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div
                  className="h-16 w-16 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: asignatura.color + '20' }}
                >
                  <Icon className="h-8 w-8" style={{ color: asignatura.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-1">{asignatura.nombre}</h1>
                      <p className="text-muted-foreground">{asignatura.curso.nombre}</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {asignatura.unidades.length} unidad{asignatura.unidades.length !== 1 ? 'es' : ''}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Unidades didácticas */}
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colorPrimario }}>
              Unidades Didácticas
            </h2>

            {asignatura.unidades.length > 0 ? (
              <div className="grid gap-4">
                {asignatura.unidades.map((unidad) => {
                  const estadoInfo = estadoConfig[unidad.estado as keyof typeof estadoConfig];
                  const EstadoIcon = estadoInfo.icon;

                  return (
                    <Link key={unidad.id} href={`/unidad/${unidad.slug}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono">
                                  Unidad {unidad.numero}
                                </Badge>
                                <Badge variant={estadoInfo.color as any} className="gap-1">
                                  <EstadoIcon className="h-3 w-3" />
                                  {estadoInfo.label}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl mb-1">{unidad.titulo}</CardTitle>
                              {unidad.descripcion && (
                                <CardDescription className="line-clamp-2">
                                  {unidad.descripcion}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {unidad._count.contenidos > 0 && (
                              <div>
                                {unidad._count.contenidos} contenido{unidad._count.contenidos !== 1 ? 's' : ''}
                              </div>
                            )}
                            {unidad._count.criterios > 0 && (
                              <div>
                                {unidad._count.criterios} criterio{unidad._count.criterios !== 1 ? 's' : ''}
                              </div>
                            )}
                            {unidad.fechaInicio && (
                              <div>
                                Inicio: {new Date(unidad.fechaInicio).toLocaleDateString('es-ES')}
                              </div>
                            )}
                            {unidad.fechaFin && (
                              <div>
                                Fin: {new Date(unidad.fechaFin).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No hay unidades publicadas</h3>
                  <p className="text-muted-foreground">
                    El profesor aún no ha publicado unidades para esta asignatura.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <PortalFooter contactoProfesor={config?.contactoProfesor} />
    </>
  );
}

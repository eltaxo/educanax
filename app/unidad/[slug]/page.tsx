'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PortalHeader from '@/components/portal/header';
import PortalFooter from '@/components/portal/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Video, FileText, Link2, Image as ImageIcon, File, Award, Target } from 'lucide-react';

interface Configuracion {
  nombreColegio?: string;
  logo?: string | null;
  colorPrimario?: string;
  contactoProfesor?: string | null;
}

interface Unidad {
  id: string;
  numero: number;
  titulo: string;
  descripcion?: string;
  objetivos?: string;
  estado: string;
  asignatura: {
    nombre: string;
    slug: string;
    color: string;
    curso: {
      nombre: string;
    };
  };
  contenidos: Contenido[];
  criterios: CriterioEvaluacion[];
}

interface Contenido {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'TEORIA' | 'ACTIVIDAD' | 'REPASO';
  orden: number;
  recursos: Recurso[];
}

interface Recurso {
  id: string;
  tipo: 'VIDEO' | 'PDF' | 'LINK' | 'IMAGEN' | 'DOCUMENTO';
  titulo: string;
  url: string;
  descripcion?: string;
  metadata?: { youtubeId?: string };
}

interface CriterioEvaluacion {
  id: string;
  codigo: string;
  descripcion: string;
  peso?: number | null;
  competencias?: string[];
}

const tipoRecursoIcon: Record<string, any> = {
  VIDEO: Video,
  PDF: FileText,
  LINK: Link2,
  IMAGEN: ImageIcon,
  DOCUMENTO: File,
};

export default function UnidadPage() {
  const params = useParams();
  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TEORIA' | 'ACTIVIDAD' | 'REPASO'>('TEORIA');

  useEffect(() => {
    fetchData();
  }, [params.slug]);

  const fetchData = async () => {
    try {
      const [configRes, unidadRes] = await Promise.all([
        fetch('/api/configuracion'),
        fetch(`/api/unidades?slug=${params.slug}`),
      ]);

      const configData = await configRes.json();
      const unidadesData = await unidadRes.json();

      setConfig(configData);

      if (unidadesData && unidadesData.length > 0) {
        setUnidad(unidadesData[0]);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!unidad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Unidad no encontrada</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const colorPrimario = config?.colorPrimario || '#3B82F6';

  const contenidosPorTipo = {
    TEORIA: unidad.contenidos.filter(c => c.tipo === 'TEORIA'),
    ACTIVIDAD: unidad.contenidos.filter(c => c.tipo === 'ACTIVIDAD'),
    REPASO: unidad.contenidos.filter(c => c.tipo === 'REPASO'),
  };

  const tabs = [
    { key: 'TEORIA' as const, label: 'Teoría', count: contenidosPorTipo.TEORIA.length },
    { key: 'ACTIVIDAD' as const, label: 'Actividades', count: contenidosPorTipo.ACTIVIDAD.length },
    { key: 'REPASO' as const, label: 'Repaso', count: contenidosPorTipo.REPASO.length },
  ];

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <span>/</span>
            <Link href={`/asignatura/${unidad.asignatura.slug}`} className="hover:text-foreground">
              {unidad.asignatura.nombre}
            </Link>
            <span>/</span>
            <span className="text-foreground">Unidad {unidad.numero}</span>
          </div>

          {/* Cabecera de la unidad */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-mono">
                      Unidad {unidad.numero}
                    </Badge>
                    <Badge style={{ backgroundColor: unidad.asignatura.color + '20', color: unidad.asignatura.color }}>
                      {unidad.asignatura.nombre}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{unidad.titulo}</h1>
                  {unidad.descripcion && (
                    <p className="text-muted-foreground">{unidad.descripcion}</p>
                  )}
                </div>
              </div>

              {unidad.objetivos && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: colorPrimario }} />
                    <div>
                      <h3 className="font-semibold mb-1">Objetivos de aprendizaje</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{unidad.objetivos}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Tabs de contenido */}
          <div>
            <div className="border-b mb-6">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-current'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    style={activeTab === tab.key ? { color: colorPrimario } : {}}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido del tab activo */}
            <div className="space-y-6">
              {contenidosPorTipo[activeTab].length > 0 ? (
                contenidosPorTipo[activeTab].map((contenido) => (
                  <Card key={contenido.id}>
                    <CardHeader>
                      <CardTitle>{contenido.titulo}</CardTitle>
                      {contenido.descripcion && (
                        <p className="text-sm text-muted-foreground">{contenido.descripcion}</p>
                      )}
                    </CardHeader>
                    {contenido.recursos.length > 0 && (
                      <CardContent className="space-y-4">
                        {contenido.recursos.map((recurso) => {
                          const Icon = tipoRecursoIcon[recurso.tipo] || File;

                          return (
                            <div key={recurso.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5" style={{ color: colorPrimario }} />
                                <h4 className="font-medium">{recurso.titulo}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {recurso.tipo}
                                </Badge>
                              </div>

                              {recurso.descripcion && (
                                <p className="text-sm text-muted-foreground pl-7">
                                  {recurso.descripcion}
                                </p>
                              )}

                              {/* Renderizado según tipo de recurso */}
                              <div className="pl-7">
                                {recurso.tipo === 'VIDEO' && recurso.metadata?.youtubeId && (
                                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      src={`https://www.youtube.com/embed/${recurso.metadata.youtubeId}`}
                                      title={recurso.titulo}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="w-full h-full"
                                    ></iframe>
                                  </div>
                                )}

                                {recurso.tipo === 'PDF' && (
                                  <a
                                    href={recurso.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Abrir PDF
                                  </a>
                                )}

                                {recurso.tipo === 'LINK' && (
                                  <a
                                    href={recurso.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-blue-600 hover:text-blue-700"
                                  >
                                    <Link2 className="h-4 w-4" />
                                    Visitar enlace
                                  </a>
                                )}

                                {recurso.tipo === 'IMAGEN' && (
                                  <img
                                    src={recurso.url}
                                    alt={recurso.titulo}
                                    className="max-w-full h-auto rounded-lg border"
                                  />
                                )}

                                {recurso.tipo === 'DOCUMENTO' && (
                                  <a
                                    href={recurso.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                                  >
                                    <File className="h-4 w-4" />
                                    Descargar documento
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No hay contenido disponible en esta sección
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Criterios de evaluación */}
          {unidad.criterios && unidad.criterios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" style={{ color: colorPrimario }} />
                  Criterios de Evaluación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unidad.criterios.map((criterio) => (
                    <div key={criterio.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {criterio.codigo}
                        </Badge>
                        {criterio.peso && (
                          <Badge variant="secondary">{criterio.peso}%</Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{criterio.descripcion}</p>
                      {criterio.competencias && criterio.competencias.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {criterio.competencias.map((comp) => (
                            <Badge
                              key={comp}
                              className="text-xs"
                              style={{ backgroundColor: colorPrimario + '20', color: colorPrimario }}
                            >
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <PortalFooter contactoProfesor={config?.contactoProfesor} />
    </>
  );
}

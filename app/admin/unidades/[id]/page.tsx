'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2, Video, FileText, Link as LinkIcon, Image as ImageIcon, File, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import Link from 'next/link';

interface Unidad {
  id: string;
  numero: number;
  titulo: string;
  descripcion?: string;
  objetivos?: string;
  estado: string;
  asignatura: {
    nombre: string;
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
  visible: boolean;
  recursos: Recurso[];
}

interface Recurso {
  id: string;
  tipo: 'VIDEO' | 'PDF' | 'LINK' | 'IMAGEN' | 'DOCUMENTO';
  titulo: string;
  url: string;
  descripcion?: string;
  orden: number;
  metadata?: any;
}

interface CriterioEvaluacion {
  id: string;
  codigo: string;
  descripcion: string;
  peso?: number | null;
  competencias?: string[];
  indicadores?: string | null;
}

const tiposContenido = [
  { value: 'TEORIA', label: 'Teoría', color: 'default' },
  { value: 'ACTIVIDAD', label: 'Actividad', color: 'success' },
  { value: 'REPASO', label: 'Repaso', color: 'warning' },
];

const tiposRecurso = [
  { value: 'VIDEO', label: 'Vídeo YouTube', icon: Video },
  { value: 'PDF', label: 'PDF', icon: FileText },
  { value: 'LINK', label: 'Enlace', icon: LinkIcon },
  { value: 'IMAGEN', label: 'Imagen', icon: ImageIcon },
  { value: 'DOCUMENTO', label: 'Documento', icon: File },
];

const competenciasLOMLOE = [
  { value: 'CCL', label: 'CCL - Comunicación lingüística' },
  { value: 'CP', label: 'CP - Plurilingüe' },
  { value: 'STEM', label: 'STEM - Matemática, ciencia, tecnología e ingeniería' },
  { value: 'CD', label: 'CD - Digital' },
  { value: 'CPSAA', label: 'CPSAA - Personal, social y aprender a aprender' },
  { value: 'CC', label: 'CC - Ciudadana' },
  { value: 'CE', label: 'CE - Emprendedora' },
  { value: 'CCEC', label: 'CCEC - Conciencia y expresión culturales' },
];

export default function UnidadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para contenidos
  const [showContenidoForm, setShowContenidoForm] = useState(false);
  const [editingContenido, setEditingContenido] = useState<Contenido | null>(null);
  const [contenidoForm, setContenidoForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'TEORIA' as 'TEORIA' | 'ACTIVIDAD' | 'REPASO',
    orden: 0,
    visible: true,
  });

  // Estados para recursos
  const [showRecursoForm, setShowRecursoForm] = useState(false);
  const [selectedContenido, setSelectedContenido] = useState<string | null>(null);
  const [recursoForm, setRecursoForm] = useState({
    tipo: 'VIDEO' as 'VIDEO' | 'PDF' | 'LINK' | 'IMAGEN' | 'DOCUMENTO',
    titulo: '',
    url: '',
    descripcion: '',
    orden: 0,
  });

  // Estados para criterios de evaluación
  const [showCriterioForm, setShowCriterioForm] = useState(false);
  const [editingCriterio, setEditingCriterio] = useState<CriterioEvaluacion | null>(null);
  const [criterioForm, setCriterioForm] = useState({
    codigo: '',
    descripcion: '',
    peso: '',
    competencias: [] as string[],
    indicadores: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchUnidad();
    }
  }, [params.id]);

  const fetchUnidad = async () => {
    try {
      const res = await fetch(`/api/unidades/${params.id}`);
      const data = await res.json();
      setUnidad(data);
    } catch (error) {
      console.error('Error al cargar unidad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContenidoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingContenido
        ? `/api/contenidos/${editingContenido.id}`
        : '/api/contenidos';
      const method = editingContenido ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contenidoForm,
          unidadId: params.id,
        }),
      });

      if (res.ok) {
        await fetchUnidad();
        resetContenidoForm();
      }
    } catch (error) {
      console.error('Error al guardar contenido:', error);
    }
  };

  const handleRecursoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContenido) return;

    try {
      const res = await fetch('/api/recursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recursoForm,
          contenidoId: selectedContenido,
        }),
      });

      if (res.ok) {
        await fetchUnidad();
        resetRecursoForm();
      }
    } catch (error) {
      console.error('Error al guardar recurso:', error);
    }
  };

  const handleDeleteContenido = async (id: string) => {
    if (!confirm('¿Eliminar este contenido?')) return;
    try {
      const res = await fetch(`/api/contenidos/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchUnidad();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteRecurso = async (id: string) => {
    if (!confirm('¿Eliminar este recurso?')) return;
    try {
      const res = await fetch(`/api/recursos/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchUnidad();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCriterioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCriterio
        ? `/api/criterios/${editingCriterio.id}`
        : '/api/criterios';
      const method = editingCriterio ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: criterioForm.codigo,
          descripcion: criterioForm.descripcion,
          peso: criterioForm.peso ? parseFloat(criterioForm.peso) : null,
          competencias: criterioForm.competencias,
          indicadores: criterioForm.indicadores || null,
          unidadId: params.id,
        }),
      });

      if (res.ok) {
        await fetchUnidad();
        resetCriterioForm();
      }
    } catch (error) {
      console.error('Error al guardar criterio:', error);
    }
  };

  const handleDeleteCriterio = async (id: string) => {
    if (!confirm('¿Eliminar este criterio de evaluación?')) return;
    try {
      const res = await fetch(`/api/criterios/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchUnidad();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEditCriterio = (criterio: CriterioEvaluacion) => {
    setEditingCriterio(criterio);
    setCriterioForm({
      codigo: criterio.codigo,
      descripcion: criterio.descripcion,
      peso: criterio.peso ? criterio.peso.toString() : '',
      competencias: criterio.competencias || [],
      indicadores: criterio.indicadores || '',
    });
    setShowCriterioForm(true);
  };

  const toggleCompetencia = (value: string) => {
    setCriterioForm({
      ...criterioForm,
      competencias: criterioForm.competencias.includes(value)
        ? criterioForm.competencias.filter(c => c !== value)
        : [...criterioForm.competencias, value],
    });
  };

  const resetContenidoForm = () => {
    setContenidoForm({
      titulo: '',
      descripcion: '',
      tipo: 'TEORIA',
      orden: 0,
      visible: true,
    });
    setEditingContenido(null);
    setShowContenidoForm(false);
  };

  const resetRecursoForm = () => {
    setRecursoForm({
      tipo: 'VIDEO',
      titulo: '',
      url: '',
      descripcion: '',
      orden: 0,
    });
    setSelectedContenido(null);
    setShowRecursoForm(false);
  };

  const resetCriterioForm = () => {
    setCriterioForm({
      codigo: '',
      descripcion: '',
      peso: '',
      competencias: [],
      indicadores: '',
    });
    setEditingCriterio(null);
    setShowCriterioForm(false);
  };

  const getRecursoIcon = (tipo: string) => {
    const recursoInfo = tiposRecurso.find(t => t.value === tipo);
    return recursoInfo ? recursoInfo.icon : File;
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!unidad) {
    return <div className="p-6">Unidad no encontrada</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/unidades">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            Unidad {unidad.numero}: {unidad.titulo}
          </h1>
          <p className="text-muted-foreground">
            {unidad.asignatura.nombre} - {unidad.asignatura.curso.nombre}
          </p>
        </div>
      </div>

      {/* Información de la unidad */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {unidad.descripcion && (
            <div>
              <h4 className="text-sm font-medium mb-1">Descripción</h4>
              <p className="text-sm text-muted-foreground">{unidad.descripcion}</p>
            </div>
          )}
          {unidad.objetivos && (
            <div>
              <h4 className="text-sm font-medium mb-1">Objetivos</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{unidad.objetivos}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contenidos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contenidos</CardTitle>
              <CardDescription>Organiza el contenido en secciones de teoría, actividades y repaso</CardDescription>
            </div>
            <Button onClick={() => setShowContenidoForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contenido
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showContenidoForm && (
            <form onSubmit={handleContenidoSubmit} className="mb-6 p-4 border rounded-lg space-y-4 bg-gray-50">
              <h3 className="font-medium">{editingContenido ? 'Editar' : 'Nuevo'} Contenido</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cont-titulo">Título *</Label>
                  <Input
                    id="cont-titulo"
                    value={contenidoForm.titulo}
                    onChange={(e) => setContenidoForm({ ...contenidoForm, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cont-tipo">Tipo *</Label>
                  <Select
                    id="cont-tipo"
                    value={contenidoForm.tipo}
                    onChange={(e) => setContenidoForm({ ...contenidoForm, tipo: e.target.value as any })}
                  >
                    {tiposContenido.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cont-desc">Descripción</Label>
                <Textarea
                  id="cont-desc"
                  rows={2}
                  value={contenidoForm.descripcion}
                  onChange={(e) => setContenidoForm({ ...contenidoForm, descripcion: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Guardar</Button>
                <Button type="button" variant="outline" onClick={resetContenidoForm}>Cancelar</Button>
              </div>
            </form>
          )}

          {unidad.contenidos.length > 0 ? (
            <div className="space-y-4">
              {unidad.contenidos.map((contenido) => {
                const tipoInfo = tiposContenido.find(t => t.value === contenido.tipo);
                return (
                  <div key={contenido.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{contenido.titulo}</h4>
                          <Badge variant={tipoInfo?.color as any}>{tipoInfo?.label}</Badge>
                        </div>
                        {contenido.descripcion && (
                          <p className="text-sm text-muted-foreground">{contenido.descripcion}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContenido(contenido.id);
                            setShowRecursoForm(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Recurso
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContenido(contenido.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Recursos */}
                    {contenido.recursos.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Recursos:</h5>
                        {contenido.recursos.map((recurso) => {
                          const Icon = getRecursoIcon(recurso.tipo);
                          return (
                            <div key={recurso.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                              <Icon className="h-4 w-4" />
                              <span className="flex-1">{recurso.titulo}</span>
                              <Badge variant="outline">{recurso.tipo}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecurso(recurso.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay contenidos creados</p>
              <p className="text-sm">Crea el primer contenido para empezar</p>
            </div>
          )}

          {/* Formulario de recurso */}
          {showRecursoForm && selectedContenido && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="max-w-lg w-full">
                <CardHeader>
                  <CardTitle>Añadir Recurso</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRecursoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rec-tipo">Tipo de recurso *</Label>
                      <Select
                        id="rec-tipo"
                        value={recursoForm.tipo}
                        onChange={(e) => setRecursoForm({ ...recursoForm, tipo: e.target.value as any })}
                      >
                        {tiposRecurso.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rec-titulo">Título *</Label>
                      <Input
                        id="rec-titulo"
                        value={recursoForm.titulo}
                        onChange={(e) => setRecursoForm({ ...recursoForm, titulo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rec-url">URL *</Label>
                      <Input
                        id="rec-url"
                        type="url"
                        placeholder={
                          recursoForm.tipo === 'VIDEO'
                            ? 'https://youtube.com/watch?v=...'
                            : 'https://...'
                        }
                        value={recursoForm.url}
                        onChange={(e) => setRecursoForm({ ...recursoForm, url: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rec-desc">Descripción</Label>
                      <Textarea
                        id="rec-desc"
                        rows={2}
                        value={recursoForm.descripcion}
                        onChange={(e) => setRecursoForm({ ...recursoForm, descripcion: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Añadir Recurso</Button>
                      <Button type="button" variant="outline" onClick={resetRecursoForm}>Cancelar</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Criterios de Evaluación */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Criterios de Evaluación
              </CardTitle>
              <CardDescription>Define los criterios de evaluación según LOMLOE</CardDescription>
            </div>
            <Button onClick={() => setShowCriterioForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Criterio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCriterioForm && (
            <form onSubmit={handleCriterioSubmit} className="mb-6 p-4 border rounded-lg space-y-4 bg-gray-50">
              <h3 className="font-medium">{editingCriterio ? 'Editar' : 'Nuevo'} Criterio</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="crit-codigo">Código *</Label>
                  <Input
                    id="crit-codigo"
                    placeholder="ej: CE1.1"
                    value={criterioForm.codigo}
                    onChange={(e) => setCriterioForm({ ...criterioForm, codigo: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Código del criterio (ej: CE1.1)</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="crit-descripcion">Descripción *</Label>
                  <Textarea
                    id="crit-descripcion"
                    placeholder="Descripción del criterio de evaluación..."
                    rows={2}
                    value={criterioForm.descripcion}
                    onChange={(e) => setCriterioForm({ ...criterioForm, descripcion: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Competencias clave (LOMLOE)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {competenciasLOMLOE.map((comp) => (
                    <label
                      key={comp.value}
                      className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={criterioForm.competencias.includes(comp.value)}
                        onChange={() => toggleCompetencia(comp.value)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{comp.value}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Selecciona las competencias clave que desarrolla este criterio
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="crit-peso">Peso (%)</Label>
                  <Input
                    id="crit-peso"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="ej: 10"
                    value={criterioForm.peso}
                    onChange={(e) => setCriterioForm({ ...criterioForm, peso: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Peso del criterio en la evaluación</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crit-indicadores">Indicadores de logro</Label>
                  <Textarea
                    id="crit-indicadores"
                    placeholder="Indicadores específicos para evaluar este criterio..."
                    rows={2}
                    value={criterioForm.indicadores}
                    onChange={(e) => setCriterioForm({ ...criterioForm, indicadores: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingCriterio ? 'Actualizar' : 'Crear'} Criterio
                </Button>
                <Button type="button" variant="outline" onClick={resetCriterioForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {unidad.criterios && unidad.criterios.length > 0 ? (
            <div className="space-y-3">
              {unidad.criterios.map((criterio) => (
                <div key={criterio.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono">
                          {criterio.codigo}
                        </Badge>
                        {criterio.peso && (
                          <Badge variant="secondary">
                            {criterio.peso}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{criterio.descripcion}</p>

                      {criterio.competencias && criterio.competencias.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {criterio.competencias.map((comp) => (
                            <Badge key={comp} variant="default" className="text-xs">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {criterio.indicadores && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Indicadores:</span> {criterio.indicadores}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCriterio(criterio)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCriterio(criterio.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay criterios de evaluación definidos</p>
              <p className="text-sm">Añade criterios según la normativa LOMLOE</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

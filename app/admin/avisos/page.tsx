'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface Curso {
  id: string;
  nombre: string;
}

interface Aviso {
  id: string;
  cursoId?: string | null;
  titulo: string;
  mensaje: string;
  tipo: 'INFO' | 'IMPORTANTE' | 'URGENTE';
  fechaPublicacion: string;
  fechaExpiracion?: string | null;
  visible: boolean;
  curso?: Curso | null;
}

const tiposAviso = [
  { value: 'INFO', label: 'Informativo', color: 'default', icon: Info },
  { value: 'IMPORTANTE', label: 'Importante', color: 'warning', icon: AlertCircle },
  { value: 'URGENTE', label: 'Urgente', color: 'destructive', icon: AlertTriangle },
];

export default function AvisosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);
  const [formData, setFormData] = useState({
    cursoId: '',
    titulo: '',
    mensaje: '',
    tipo: 'INFO' as 'INFO' | 'IMPORTANTE' | 'URGENTE',
    fechaPublicacion: '',
    fechaExpiracion: '',
    visible: true,
  });

  useEffect(() => {
    fetchCursos();
    fetchAvisos();
  }, []);

  const fetchCursos = async () => {
    try {
      const res = await fetch('/api/cursos');
      const data = await res.json();
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const fetchAvisos = async () => {
    try {
      const res = await fetch('/api/avisos');
      const data = await res.json();
      setAvisos(data);
    } catch (error) {
      console.error('Error al cargar avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingAviso
        ? `/api/avisos/${editingAviso.id}`
        : '/api/avisos';
      const method = editingAviso ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cursoId: formData.cursoId || null,
        }),
      });

      if (res.ok) {
        await fetchAvisos();
        resetForm();
      }
    } catch (error) {
      console.error('Error al guardar aviso:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este aviso?')) return;

    try {
      const res = await fetch(`/api/avisos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAvisos();
      }
    } catch (error) {
      console.error('Error al eliminar aviso:', error);
    }
  };

  const handleEdit = (aviso: Aviso) => {
    setEditingAviso(aviso);
    setFormData({
      cursoId: aviso.cursoId || '',
      titulo: aviso.titulo,
      mensaje: aviso.mensaje,
      tipo: aviso.tipo,
      fechaPublicacion: aviso.fechaPublicacion
        ? new Date(aviso.fechaPublicacion).toISOString().split('T')[0]
        : '',
      fechaExpiracion: aviso.fechaExpiracion
        ? new Date(aviso.fechaExpiracion).toISOString().split('T')[0]
        : '',
      visible: aviso.visible,
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      cursoId: '',
      titulo: '',
      mensaje: '',
      tipo: 'INFO',
      fechaPublicacion: '',
      fechaExpiracion: '',
      visible: true,
    });
    setEditingAviso(null);
    setIsFormOpen(false);
  };

  const isAvisoActivo = (aviso: Aviso) => {
    const now = new Date();
    const publicacion = new Date(aviso.fechaPublicacion);
    const expiracion = aviso.fechaExpiracion ? new Date(aviso.fechaExpiracion) : null;

    return (
      aviso.visible &&
      publicacion <= now &&
      (!expiracion || expiracion >= now)
    );
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Avisos</h1>
          <p className="text-muted-foreground">
            Gestiona las notificaciones para las familias
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Aviso
        </Button>
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAviso ? 'Editar Aviso' : 'Nuevo Aviso'}
            </CardTitle>
            <CardDescription>
              {editingAviso
                ? 'Modifica la información del aviso'
                : 'Crea un nuevo aviso para las familias'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="ej: Próxima excursión"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de aviso *</Label>
                  <Select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value as any })
                    }
                    required
                  >
                    {tiposAviso.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensaje">Mensaje *</Label>
                <Textarea
                  id="mensaje"
                  placeholder="Contenido del aviso para las familias..."
                  rows={4}
                  value={formData.mensaje}
                  onChange={(e) =>
                    setFormData({ ...formData, mensaje: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cursoId">Curso (opcional)</Label>
                  <Select
                    id="cursoId"
                    value={formData.cursoId}
                    onChange={(e) =>
                      setFormData({ ...formData, cursoId: e.target.value })
                    }
                  >
                    <option value="">Todos los cursos</option>
                    {cursos.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaPublicacion">Fecha publicación</Label>
                  <Input
                    id="fechaPublicacion"
                    type="date"
                    value={formData.fechaPublicacion}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaPublicacion: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Si no se especifica, se publica ahora
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaExpiracion">Fecha expiración</Label>
                  <Input
                    id="fechaExpiracion"
                    type="date"
                    value={formData.fechaExpiracion}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaExpiracion: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional: desaparece automáticamente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={formData.visible}
                  onChange={(e) =>
                    setFormData({ ...formData, visible: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="visible" className="cursor-pointer">
                  Visible en el portal
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingAviso ? 'Actualizar' : 'Crear Aviso'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla de avisos */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Avisos</CardTitle>
          <CardDescription>
            {avisos.length} aviso{avisos.length !== 1 ? 's' : ''} en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {avisos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aviso</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avisos.map((aviso) => {
                  const tipoInfo = tiposAviso.find(t => t.value === aviso.tipo);
                  const Icon = tipoInfo?.icon || Info;
                  const activo = isAvisoActivo(aviso);

                  return (
                    <TableRow key={aviso.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              aviso.tipo === 'URGENTE'
                                ? 'bg-red-100'
                                : aviso.tipo === 'IMPORTANTE'
                                ? 'bg-orange-100'
                                : 'bg-blue-100'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                aviso.tipo === 'URGENTE'
                                  ? 'text-red-600'
                                  : aviso.tipo === 'IMPORTANTE'
                                  ? 'text-orange-600'
                                  : 'text-blue-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{aviso.titulo}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {aviso.mensaje}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {aviso.curso?.nombre || 'Todos'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            📅 {new Date(aviso.fechaPublicacion).toLocaleDateString('es-ES')}
                          </div>
                          {aviso.fechaExpiracion && (
                            <div className="text-muted-foreground">
                              ⏰ {new Date(aviso.fechaExpiracion).toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={tipoInfo?.color as any}>
                            {tipoInfo?.label}
                          </Badge>
                          {activo && (
                            <Badge variant="success" className="ml-2">
                              Activo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(aviso)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(aviso.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay avisos creados</p>
              <p className="text-sm">Crea el primer aviso para las familias</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

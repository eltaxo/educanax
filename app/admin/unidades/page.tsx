'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
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

interface Asignatura {
  id: string;
  nombre: string;
  curso: {
    nombre: string;
  };
}

interface Unidad {
  id: string;
  asignaturaId: string;
  numero: number;
  titulo: string;
  descripcion?: string | null;
  objetivos?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  estado: 'PROXIMA' | 'ACTIVA' | 'COMPLETADA';
  orden: number;
  visible: boolean;
  asignatura: Asignatura;
  _count?: {
    contenidos: number;
    criterios: number;
  };
}

const estadosUnidad = [
  { value: 'PROXIMA', label: 'Próxima', color: 'default' },
  { value: 'ACTIVA', label: 'Activa', color: 'success' },
  { value: 'COMPLETADA', label: 'Completada', color: 'secondary' },
];

export default function UnidadesPage() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState<Unidad | null>(null);
  const [formData, setFormData] = useState({
    asignaturaId: '',
    numero: 1,
    titulo: '',
    descripcion: '',
    objetivos: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'PROXIMA' as 'PROXIMA' | 'ACTIVA' | 'COMPLETADA',
    orden: 0,
    visible: true,
  });

  useEffect(() => {
    fetchAsignaturas();
    fetchUnidades();
  }, []);

  const fetchAsignaturas = async () => {
    try {
      const res = await fetch('/api/asignaturas');
      const data = await res.json();
      setAsignaturas(data);
      if (data.length > 0 && !formData.asignaturaId) {
        setFormData(prev => ({ ...prev, asignaturaId: data[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    }
  };

  const fetchUnidades = async () => {
    try {
      const res = await fetch('/api/unidades');
      const data = await res.json();
      setUnidades(data);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUnidad
        ? `/api/unidades/${editingUnidad.id}`
        : '/api/unidades';
      const method = editingUnidad ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchUnidades();
        resetForm();
      }
    } catch (error) {
      console.error('Error al guardar unidad:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta unidad didáctica?')) return;

    try {
      const res = await fetch(`/api/unidades/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUnidades();
      }
    } catch (error) {
      console.error('Error al eliminar unidad:', error);
    }
  };

  const handleEdit = (unidad: Unidad) => {
    setEditingUnidad(unidad);
    setFormData({
      asignaturaId: unidad.asignaturaId,
      numero: unidad.numero,
      titulo: unidad.titulo,
      descripcion: unidad.descripcion || '',
      objetivos: unidad.objetivos || '',
      fechaInicio: unidad.fechaInicio ? unidad.fechaInicio.split('T')[0] : '',
      fechaFin: unidad.fechaFin ? unidad.fechaFin.split('T')[0] : '',
      estado: unidad.estado,
      orden: unidad.orden,
      visible: unidad.visible,
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      asignaturaId: asignaturas[0]?.id || '',
      numero: 1,
      titulo: '',
      descripcion: '',
      objetivos: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'PROXIMA',
      orden: 0,
      visible: true,
    });
    setEditingUnidad(null);
    setIsFormOpen(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unidades Didácticas</h1>
          <p className="text-muted-foreground">
            Gestiona las unidades didácticas por asignatura
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} disabled={asignaturas.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Unidad
        </Button>
      </div>

      {asignaturas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No hay asignaturas disponibles</p>
            <p className="text-sm">Crea primero una asignatura para poder añadir unidades</p>
          </CardContent>
        </Card>
      )}

      {/* Formulario */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUnidad ? 'Editar Unidad Didáctica' : 'Nueva Unidad Didáctica'}
            </CardTitle>
            <CardDescription>
              {editingUnidad
                ? 'Modifica la información de la unidad'
                : 'Crea una nueva unidad didáctica'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="asignaturaId">Asignatura *</Label>
                  <Select
                    id="asignaturaId"
                    value={formData.asignaturaId}
                    onChange={(e) =>
                      setFormData({ ...formData, asignaturaId: e.target.value })
                    }
                    required
                  >
                    {asignaturas.map((asig) => (
                      <option key={asig.id} value={asig.id}>
                        {asig.curso.nombre} - {asig.nombre}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número de unidad *</Label>
                  <Input
                    id="numero"
                    type="number"
                    min="1"
                    value={formData.numero}
                    onChange={(e) =>
                      setFormData({ ...formData, numero: parseInt(e.target.value) || 1 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    id="estado"
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value as any })
                    }
                    required
                  >
                    {estadosUnidad.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="ej: Los seres vivos"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Descripción general de la unidad..."
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivos">Objetivos de aprendizaje</Label>
                <Textarea
                  id="objetivos"
                  placeholder="Objetivos que se trabajan en esta unidad..."
                  rows={3}
                  value={formData.objetivos}
                  onChange={(e) =>
                    setFormData({ ...formData, objetivos: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaInicio: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha de fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaFin: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orden">Orden</Label>
                  <Input
                    id="orden"
                    type="number"
                    value={formData.orden}
                    onChange={(e) =>
                      setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })
                    }
                  />
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
                  {editingUnidad ? 'Actualizar' : 'Crear Unidad'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla de unidades */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Unidades</CardTitle>
          <CardDescription>
            {unidades.length} unidad{unidades.length !== 1 ? 'es' : ''} en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unidades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Asignatura / Curso</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Contenidos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unidades.map((unidad) => {
                  const estadoInfo = estadosUnidad.find(e => e.value === unidad.estado);
                  return (
                    <TableRow key={unidad.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            Unidad {unidad.numero}: {unidad.titulo}
                          </div>
                          {unidad.descripcion && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {unidad.descripcion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{unidad.asignatura.nombre}</div>
                          <div className="text-muted-foreground">{unidad.asignatura.curso.nombre}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {unidad.fechaInicio && (
                            <div>
                              {new Date(unidad.fechaInicio).toLocaleDateString('es-ES')}
                            </div>
                          )}
                          {unidad.fechaFin && (
                            <div className="text-muted-foreground">
                              - {new Date(unidad.fechaFin).toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {unidad._count?.contenidos || 0} contenidos
                      </TableCell>
                      <TableCell>
                        <Badge variant={estadoInfo?.color as any || 'default'}>
                          {estadoInfo?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/unidades/${unidad.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(unidad)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(unidad.id)}
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
              <p>No hay unidades creadas</p>
              <p className="text-sm">Crea tu primera unidad para empezar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

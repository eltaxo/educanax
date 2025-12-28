'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Calculator, Globe, Music, Palette, Beaker } from 'lucide-react';
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

interface Curso {
  id: string;
  nombre: string;
}

interface Asignatura {
  id: string;
  cursoId: string;
  nombre: string;
  slug: string;
  color: string;
  icono: string;
  orden: number;
  visible: boolean;
  curso: Curso;
  _count?: {
    unidades: number;
  };
}

const iconosDisponibles = [
  { name: 'BookOpen', icon: BookOpen, label: 'Libro' },
  { name: 'Calculator', icon: Calculator, label: 'Calculadora' },
  { name: 'Globe', icon: Globe, label: 'Globo' },
  { name: 'Music', icon: Music, label: 'Música' },
  { name: 'Palette', icon: Palette, label: 'Paleta' },
  { name: 'Beaker', icon: Beaker, label: 'Ciencia' },
];

const coloresDisponibles = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Naranja' },
  { value: '#8B5CF6', label: 'Púrpura' },
  { value: '#EC4899', label: 'Rosa' },
];

export default function AsignaturasPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | null>(null);
  const [formData, setFormData] = useState({
    cursoId: '',
    nombre: '',
    color: '#3B82F6',
    icono: 'BookOpen',
    orden: 0,
    visible: true,
  });

  useEffect(() => {
    fetchCursos();
    fetchAsignaturas();
  }, []);

  const fetchCursos = async () => {
    try {
      const res = await fetch('/api/cursos');
      const data = await res.json();
      setCursos(data);
      if (data.length > 0 && !formData.cursoId) {
        setFormData(prev => ({ ...prev, cursoId: data[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const fetchAsignaturas = async () => {
    try {
      const res = await fetch('/api/asignaturas');
      const data = await res.json();
      setAsignaturas(data);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingAsignatura
        ? `/api/asignaturas/${editingAsignatura.id}`
        : '/api/asignaturas';
      const method = editingAsignatura ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchAsignaturas();
        resetForm();
      }
    } catch (error) {
      console.error('Error al guardar asignatura:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta asignatura?')) return;

    try {
      const res = await fetch(`/api/asignaturas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAsignaturas();
      }
    } catch (error) {
      console.error('Error al eliminar asignatura:', error);
    }
  };

  const handleEdit = (asignatura: Asignatura) => {
    setEditingAsignatura(asignatura);
    setFormData({
      cursoId: asignatura.cursoId,
      nombre: asignatura.nombre,
      color: asignatura.color,
      icono: asignatura.icono,
      orden: asignatura.orden,
      visible: asignatura.visible,
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      cursoId: cursos[0]?.id || '',
      nombre: '',
      color: '#3B82F6',
      icono: 'BookOpen',
      orden: 0,
      visible: true,
    });
    setEditingAsignatura(null);
    setIsFormOpen(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asignaturas</h1>
          <p className="text-muted-foreground">
            Gestiona las asignaturas de cada curso
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} disabled={cursos.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignatura
        </Button>
      </div>

      {cursos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No hay cursos disponibles</p>
            <p className="text-sm">Crea primero un curso para poder añadir asignaturas</p>
          </CardContent>
        </Card>
      )}

      {/* Formulario */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAsignatura ? 'Editar Asignatura' : 'Nueva Asignatura'}
            </CardTitle>
            <CardDescription>
              {editingAsignatura
                ? 'Modifica la información de la asignatura'
                : 'Crea una nueva asignatura'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cursoId">Curso *</Label>
                  <select
                    id="cursoId"
                    value={formData.cursoId}
                    onChange={(e) =>
                      setFormData({ ...formData, cursoId: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    {cursos.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    placeholder="ej: Lengua Castellana"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color identificativo</Label>
                <div className="flex gap-2">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-110 ${
                        formData.color === color.value
                          ? 'border-gray-900 ring-2 ring-gray-300'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Icono</Label>
                <div className="flex gap-2">
                  {iconosDisponibles.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icono: item.name })}
                        className={`flex h-12 w-12 items-center justify-center rounded-md border-2 transition-all hover:bg-gray-100 ${
                          formData.icono === item.name
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200'
                        }`}
                        title={item.label}
                      >
                        <Icon className="h-6 w-6" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orden">Orden de visualización</Label>
                  <Input
                    id="orden"
                    type="number"
                    value={formData.orden}
                    onChange={(e) =>
                      setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
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
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingAsignatura ? 'Actualizar' : 'Crear Asignatura'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla de asignaturas */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Asignaturas</CardTitle>
          <CardDescription>
            {asignaturas.length} asignatura{asignaturas.length !== 1 ? 's' : ''} en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {asignaturas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asignatura</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asignaturas.map((asignatura) => {
                  const IconComponent = iconosDisponibles.find(
                    (i) => i.name === asignatura.icono
                  )?.icon || BookOpen;

                  return (
                    <TableRow key={asignatura.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: asignatura.color + '20' }}
                          >
                            <IconComponent
                              className="h-5 w-5"
                              style={{ color: asignatura.color }}
                            />
                          </div>
                          <span className="font-medium">{asignatura.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>{asignatura.curso.nombre}</TableCell>
                      <TableCell>
                        {asignatura._count?.unidades || 0} unidades
                      </TableCell>
                      <TableCell>{asignatura.orden}</TableCell>
                      <TableCell>
                        <Badge variant={asignatura.visible ? 'success' : 'secondary'}>
                          {asignatura.visible ? 'Visible' : 'Oculta'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(asignatura)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(asignatura.id)}
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
              <p>No hay asignaturas creadas</p>
              <p className="text-sm">Crea tu primera asignatura para empezar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

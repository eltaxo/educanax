'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
  slug: string;
  descripcion?: string | null;
  anioAcademico: string;
  activo: boolean;
  _count?: {
    asignaturas: number;
  };
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    anioAcademico: '',
    activo: true,
  });

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const res = await fetch('/api/cursos');
      const data = await res.json();
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCurso
        ? `/api/cursos/${editingCurso.id}`
        : '/api/cursos';
      const method = editingCurso ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchCursos();
        resetForm();
      }
    } catch (error) {
      console.error('Error al guardar curso:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;

    try {
      const res = await fetch(`/api/cursos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCursos();
      }
    } catch (error) {
      console.error('Error al eliminar curso:', error);
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso);
    setFormData({
      nombre: curso.nombre,
      descripcion: curso.descripcion || '',
      anioAcademico: curso.anioAcademico,
      activo: curso.activo,
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      anioAcademico: '',
      activo: true,
    });
    setEditingCurso(null);
    setIsFormOpen(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona los cursos escolares
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Curso
        </Button>
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCurso ? 'Editar Curso' : 'Nuevo Curso'}
            </CardTitle>
            <CardDescription>
              {editingCurso
                ? 'Modifica la información del curso'
                : 'Crea un nuevo curso escolar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del curso *</Label>
                  <Input
                    id="nombre"
                    placeholder="ej: 3º Primaria"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anioAcademico">Año académico *</Label>
                  <Input
                    id="anioAcademico"
                    placeholder="ej: 2024/2025"
                    value={formData.anioAcademico}
                    onChange={(e) =>
                      setFormData({ ...formData, anioAcademico: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  placeholder="Descripción opcional"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) =>
                    setFormData({ ...formData, activo: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="activo" className="cursor-pointer">
                  Activo (visible en el portal)
                </Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCurso ? 'Actualizar' : 'Crear Curso'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla de cursos */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Cursos</CardTitle>
          <CardDescription>
            {cursos.length} curso{cursos.length !== 1 ? 's' : ''} en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cursos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Año Académico</TableHead>
                  <TableHead>Asignaturas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursos.map((curso) => (
                  <TableRow key={curso.id}>
                    <TableCell className="font-medium">
                      {curso.nombre}
                    </TableCell>
                    <TableCell>{curso.anioAcademico}</TableCell>
                    <TableCell>
                      {curso._count?.asignaturas || 0} asignaturas
                    </TableCell>
                    <TableCell>
                      <Badge variant={curso.activo ? 'success' : 'secondary'}>
                        {curso.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(curso)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(curso.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay cursos creados</p>
              <p className="text-sm">Crea tu primer curso para empezar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

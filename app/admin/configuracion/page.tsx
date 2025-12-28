'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Configuracion {
  id: string;
  nombreColegio: string;
  logo?: string | null;
  mensajeBienvenida?: string | null;
  contactoProfesor?: string | null;
  colorPrimario: string;
}

const coloresDisponibles = [
  { value: '#3B82F6', label: 'Azul', name: 'blue' },
  { value: '#EF4444', label: 'Rojo', name: 'red' },
  { value: '#10B981', label: 'Verde', name: 'green' },
  { value: '#F59E0B', label: 'Naranja', name: 'orange' },
  { value: '#8B5CF6', label: 'Púrpura', name: 'purple' },
  { value: '#EC4899', label: 'Rosa', name: 'pink' },
];

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombreColegio: '',
    logo: '',
    mensajeBienvenida: '',
    contactoProfesor: '',
    colorPrimario: '#3B82F6',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/configuracion');
      const data = await res.json();

      if (data && data.id) {
        setConfig(data);
        setFormData({
          nombreColegio: data.nombreColegio || '',
          logo: data.logo || '',
          mensajeBienvenida: data.mensajeBienvenida || '',
          contactoProfesor: data.contactoProfesor || '',
          colorPrimario: data.colorPrimario || '#3B82F6',
        });
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        alert('Configuración guardada correctamente');
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza la apariencia y contenido del portal público
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Portal</CardTitle>
            <CardDescription>
              Configura la información básica que se mostrará en el portal público
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombreColegio">Nombre del colegio/clase *</Label>
              <Input
                id="nombreColegio"
                placeholder="ej: Colegio San José - 3º Primaria"
                value={formData.nombreColegio}
                onChange={(e) =>
                  setFormData({ ...formData, nombreColegio: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Este nombre aparecerá en el encabezado del portal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensajeBienvenida">Mensaje de bienvenida</Label>
              <Textarea
                id="mensajeBienvenida"
                placeholder="Bienvenidos al portal educativo de nuestra clase..."
                rows={3}
                value={formData.mensajeBienvenida}
                onChange={(e) =>
                  setFormData({ ...formData, mensajeBienvenida: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Mensaje personalizado para las familias en la página principal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactoProfesor">Información de contacto</Label>
              <Input
                id="contactoProfesor"
                placeholder="Email: profesor@colegio.com | Teléfono: 123456789"
                value={formData.contactoProfesor}
                onChange={(e) =>
                  setFormData({ ...formData, contactoProfesor: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Cómo pueden contactarte las familias
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">URL del logo (opcional)</Label>
              <Input
                id="logo"
                type="url"
                placeholder="https://ejemplo.com/logo.png"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                URL de una imagen para el logo del portal (recomendado: PNG o SVG)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personalización visual */}
        <Card>
          <CardHeader>
            <CardTitle>Personalización Visual</CardTitle>
            <CardDescription>
              Elige el color principal del portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Color primario del portal</Label>
              <div className="flex flex-wrap gap-4">
                {coloresDisponibles.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, colorPrimario: color.value })}
                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.colorPrimario === color.value
                        ? 'border-gray-900 ring-2 ring-gray-300 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className="h-12 w-12 rounded-full shadow-lg"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm font-medium">{color.label}</span>
                    {formData.colorPrimario === color.value && (
                      <Badge variant="default" className="absolute -top-2 -right-2">
                        Seleccionado
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista previa */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              Así se verá tu portal público
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 p-6 space-y-4">
              <div
                className="flex items-center gap-4 pb-4 border-b"
                style={{ borderColor: formData.colorPrimario + '40' }}
              >
                {formData.logo && (
                  <img
                    src={formData.logo}
                    alt="Logo"
                    className="h-12 w-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <h2
                  className="text-2xl font-bold"
                  style={{ color: formData.colorPrimario }}
                >
                  {formData.nombreColegio || 'Nombre del colegio'}
                </h2>
              </div>
              {formData.mensajeBienvenida && (
                <p className="text-muted-foreground">{formData.mensajeBienvenida}</p>
              )}
              {formData.contactoProfesor && (
                <div className="text-sm text-muted-foreground">
                  📧 {formData.contactoProfesor}
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <div
                  className="px-4 py-2 rounded-md text-white font-medium"
                  style={{ backgroundColor: formData.colorPrimario }}
                >
                  Botón de ejemplo
                </div>
                <Badge
                  style={{
                    backgroundColor: formData.colorPrimario + '20',
                    color: formData.colorPrimario,
                  }}
                >
                  Badge de ejemplo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL pública */}
        <Card>
          <CardHeader>
            <CardTitle>URL del Portal Público</CardTitle>
            <CardDescription>
              Comparte esta URL con las familias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-100 px-4 py-2 text-sm">
                {portalUrl}
              </code>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(portalUrl);
                  alert('URL copiada al portapapeles');
                }}
              >
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botón guardar */}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
          {config && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (config) {
                  setFormData({
                    nombreColegio: config.nombreColegio || '',
                    logo: config.logo || '',
                    mensajeBienvenida: config.mensajeBienvenida || '',
                    contactoProfesor: config.contactoProfesor || '',
                    colorPrimario: config.colorPrimario || '#3B82F6',
                  });
                }
              }}
            >
              Restaurar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

'use client'

import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
            <FileQuestion className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Página no encontrada</h2>
          <p className="text-muted-foreground">
            Lo sentimos, no pudimos encontrar la página que estás buscando.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Ir al panel de administración</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

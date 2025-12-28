import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.configuracion.findFirst();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nombreColegio, logo, mensajeBienvenida, contactoProfesor, colorPrimario } = body;

    // Verificar si ya existe una configuración
    const existingConfig = await prisma.configuracion.findFirst();

    let config;
    if (existingConfig) {
      // Actualizar la existente
      config = await prisma.configuracion.update({
        where: { id: existingConfig.id },
        data: {
          nombreColegio,
          logo,
          mensajeBienvenida,
          contactoProfesor,
          colorPrimario: colorPrimario || '#3B82F6',
        },
      });
    } else {
      // Crear nueva
      config = await prisma.configuracion.create({
        data: {
          nombreColegio,
          logo,
          mensajeBienvenida,
          contactoProfesor,
          colorPrimario: colorPrimario || '#3B82F6',
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    );
  }
}

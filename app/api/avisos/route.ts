import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const avisos = await prisma.aviso.findMany({
      orderBy: { fechaPublicacion: 'desc' },
      include: {
        curso: true,
      },
    });

    return NextResponse.json(avisos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener avisos' },
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
    const { cursoId, titulo, mensaje, tipo, fechaPublicacion, fechaExpiracion, visible } = body;

    const aviso = await prisma.aviso.create({
      data: {
        cursoId: cursoId || null,
        titulo,
        mensaje,
        tipo: tipo || 'INFO',
        fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : new Date(),
        fechaExpiracion: fechaExpiracion ? new Date(fechaExpiracion) : null,
        visible: visible ?? true,
      },
    });

    return NextResponse.json(aviso);
  } catch (error) {
    console.error('Error al crear aviso:', error);
    return NextResponse.json(
      { error: 'Error al crear aviso' },
      { status: 500 }
    );
  }
}

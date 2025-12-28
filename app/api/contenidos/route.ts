import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unidadId = searchParams.get('unidadId');

    const contenidos = await prisma.contenido.findMany({
      where: unidadId ? { unidadId } : undefined,
      orderBy: { orden: 'asc' },
      include: {
        recursos: {
          orderBy: { orden: 'asc' },
        },
        _count: {
          select: {
            recursos: true,
          },
        },
      },
    });

    return NextResponse.json(contenidos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener contenidos' },
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
    const { unidadId, titulo, descripcion, tipo, orden, visible } = body;

    const contenido = await prisma.contenido.create({
      data: {
        unidadId,
        titulo,
        descripcion,
        tipo,
        orden: orden ?? 0,
        visible: visible ?? true,
      },
    });

    return NextResponse.json(contenido);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear contenido' },
      { status: 500 }
    );
  }
}

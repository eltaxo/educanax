import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { tipo, titulo, url, descripcion, orden, metadata } = body;

    const recurso = await prisma.recurso.update({
      where: { id: params.id },
      data: {
        tipo,
        titulo,
        url,
        descripcion,
        orden,
        metadata,
      },
    });

    return NextResponse.json(recurso);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar recurso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.recurso.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar recurso' },
      { status: 500 }
    );
  }
}

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
    const { titulo, descripcion, tipo, orden, visible } = body;

    const contenido = await prisma.contenido.update({
      where: { id: params.id },
      data: {
        titulo,
        descripcion,
        tipo,
        orden,
        visible,
      },
    });

    return NextResponse.json(contenido);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar contenido' },
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

    await prisma.contenido.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar contenido' },
      { status: 500 }
    );
  }
}

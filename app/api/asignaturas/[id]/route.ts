import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

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
    const { nombre, color, icono, orden, visible } = body;

    const slug = generateSlug(nombre);

    const asignatura = await prisma.asignatura.update({
      where: { id: params.id },
      data: {
        nombre,
        slug,
        color,
        icono,
        orden,
        visible,
      },
    });

    return NextResponse.json(asignatura);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar asignatura' },
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

    await prisma.asignatura.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar asignatura' },
      { status: 500 }
    );
  }
}

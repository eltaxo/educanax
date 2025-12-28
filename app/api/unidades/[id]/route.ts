import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const unidad = await prisma.unidadDidactica.findUnique({
      where: { id: params.id },
      include: {
        asignatura: {
          include: {
            curso: true,
          },
        },
        contenidos: {
          orderBy: { orden: 'asc' },
          include: {
            recursos: {
              orderBy: { orden: 'asc' },
            },
          },
        },
        criterios: true,
      },
    });

    if (!unidad) {
      return NextResponse.json(
        { error: 'Unidad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(unidad);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener unidad' },
      { status: 500 }
    );
  }
}

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
    const {
      numero,
      titulo,
      descripcion,
      objetivos,
      fechaInicio,
      fechaFin,
      estado,
      orden,
      visible,
    } = body;

    const slug = generateSlug(titulo);

    const unidad = await prisma.unidadDidactica.update({
      where: { id: params.id },
      data: {
        slug,
        numero,
        titulo,
        descripcion,
        objetivos,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado,
        orden,
        visible,
      },
    });

    return NextResponse.json(unidad);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar unidad' },
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

    await prisma.unidadDidactica.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar unidad' },
      { status: 500 }
    );
  }
}

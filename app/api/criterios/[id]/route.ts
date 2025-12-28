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
    const { codigo, descripcion, peso, competencias, indicadores } = body;

    const criterio = await prisma.criterioEvaluacion.update({
      where: { id: params.id },
      data: {
        codigo,
        descripcion,
        peso: peso ? parseFloat(peso) : null,
        competencias: competencias || [],
        indicadores,
      },
    });

    return NextResponse.json(criterio);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar criterio' },
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

    await prisma.criterioEvaluacion.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar criterio' },
      { status: 500 }
    );
  }
}

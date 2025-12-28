import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unidadId = searchParams.get('unidadId');

    const criterios = await prisma.criterioEvaluacion.findMany({
      where: unidadId ? { unidadId } : undefined,
      orderBy: { codigo: 'asc' },
    });

    return NextResponse.json(criterios);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener criterios' },
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
    const { unidadId, codigo, descripcion, peso, competencias, indicadores } = body;

    const criterio = await prisma.criterioEvaluacion.create({
      data: {
        unidadId,
        codigo,
        descripcion,
        peso: peso ? parseFloat(peso) : null,
        competencias: competencias || [],
        indicadores,
      },
    });

    return NextResponse.json(criterio);
  } catch (error) {
    console.error('Error al crear criterio:', error);
    return NextResponse.json(
      { error: 'Error al crear criterio' },
      { status: 500 }
    );
  }
}

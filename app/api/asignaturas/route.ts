import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get('cursoId');

    const asignaturas = await prisma.asignatura.findMany({
      where: cursoId ? { cursoId } : undefined,
      orderBy: { orden: 'asc' },
      include: {
        curso: true,
        _count: {
          select: { unidades: true },
        },
      },
    });

    return NextResponse.json(asignaturas);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener asignaturas' },
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
    const { cursoId, nombre, color, icono, orden, visible } = body;

    const slug = generateSlug(nombre);

    const asignatura = await prisma.asignatura.create({
      data: {
        cursoId,
        nombre,
        slug,
        color,
        icono,
        orden: orden ?? 0,
        visible: visible ?? true,
      },
    });

    return NextResponse.json(asignatura);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear asignatura' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get('asignaturaId');
    const slug = searchParams.get('slug');

    // Si se busca por slug, devolver unidad completa con contenidos
    if (slug) {
      const unidades = await prisma.unidadDidactica.findMany({
        where: {
          slug,
          visible: true,
        },
        include: {
          asignatura: {
            include: {
              curso: true,
            },
          },
          contenidos: {
            where: { visible: true },
            orderBy: { orden: 'asc' },
            include: {
              recursos: {
                orderBy: { orden: 'asc' },
              },
            },
          },
          criterios: {
            orderBy: { codigo: 'asc' },
          },
        },
      });

      return NextResponse.json(unidades);
    }

    // Búsqueda normal (para backoffice)
    const unidades = await prisma.unidadDidactica.findMany({
      where: asignaturaId ? { asignaturaId } : undefined,
      orderBy: { orden: 'asc' },
      include: {
        asignatura: {
          include: {
            curso: true,
          },
        },
        _count: {
          select: {
            contenidos: true,
            criterios: true,
          },
        },
      },
    });

    return NextResponse.json(unidades);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener unidades' },
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
    const {
      asignaturaId,
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

    const unidad = await prisma.unidadDidactica.create({
      data: {
        asignaturaId,
        slug,
        numero,
        titulo,
        descripcion,
        objetivos,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado: estado || 'PROXIMA',
        orden: orden ?? 0,
        visible: visible ?? true,
      },
    });

    return NextResponse.json(unidad);
  } catch (error) {
    console.error('Error al crear unidad:', error);
    return NextResponse.json(
      { error: 'Error al crear unidad' },
      { status: 500 }
    );
  }
}

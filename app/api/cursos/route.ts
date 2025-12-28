import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { asignaturas: true },
        },
      },
    });

    return NextResponse.json(cursos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener cursos' },
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
    const { nombre, descripcion, anioAcademico, activo } = body;

    const slug = generateSlug(nombre);

    const curso = await prisma.curso.create({
      data: {
        nombre,
        slug,
        descripcion,
        anioAcademico,
        activo: activo ?? true,
      },
    });

    return NextResponse.json(curso);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear curso' },
      { status: 500 }
    );
  }
}

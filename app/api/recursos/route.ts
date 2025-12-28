import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contenidoId = searchParams.get('contenidoId');

    const recursos = await prisma.recurso.findMany({
      where: contenidoId ? { contenidoId } : undefined,
      orderBy: { orden: 'asc' },
    });

    return NextResponse.json(recursos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener recursos' },
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
    const { contenidoId, tipo, titulo, url, descripcion, orden, metadata } = body;

    // Extraer metadata automáticamente según el tipo
    let finalMetadata = metadata || {};

    if (tipo === 'VIDEO' && url.includes('youtube.com')) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        finalMetadata = {
          ...finalMetadata,
          videoId,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        };
      }
    }

    const recurso = await prisma.recurso.create({
      data: {
        contenidoId,
        tipo,
        titulo,
        url,
        descripcion,
        orden: orden ?? 0,
        metadata: finalMetadata,
      },
    });

    return NextResponse.json(recurso);
  } catch (error) {
    console.error('Error al crear recurso:', error);
    return NextResponse.json(
      { error: 'Error al crear recurso' },
      { status: 500 }
    );
  }
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

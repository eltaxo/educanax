import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear usuario administrador
  console.log('👤 Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuarioAdmin.upsert({
    where: { email: 'admin@educanax.com' },
    update: {},
    create: {
      email: 'admin@educanax.com',
      nombre: 'Administrador',
      password: hashedPassword,
    },
  });
  console.log('✅ Usuario creado:', admin.email);

  // 2. Crear configuración global
  console.log('⚙️ Creando configuración...');
  const config = await prisma.configuracion.upsert({
    where: { id: 'config-1' },
    update: {},
    create: {
      id: 'config-1',
      nombreColegio: 'CEIP San José - 3º Primaria',
      mensajeBienvenida: 'Bienvenidos al portal educativo de nuestra clase. Aquí podréis consultar todo el contenido que estamos trabajando en el aula.',
      contactoProfesor: 'Email: profesor@educanax.com | Teléfono: 123 456 789',
      colorPrimario: '#3B82F6',
    },
  });
  console.log('✅ Configuración creada');

  // 3. Crear curso
  console.log('📚 Creando curso...');
  const curso = await prisma.curso.upsert({
    where: { slug: '3-primaria-2024-2025' },
    update: {},
    create: {
      nombre: '3º Primaria',
      slug: '3-primaria-2024-2025',
      descripcion: 'Curso académico 2024-2025',
      anioAcademico: '2024-2025',
      activo: true,
    },
  });
  console.log('✅ Curso creado:', curso.nombre);

  // 4. Crear asignaturas
  console.log('📖 Creando asignaturas...');

  const matematicas = await prisma.asignatura.upsert({
    where: { cursoId_slug: { cursoId: curso.id, slug: 'matematicas' } },
    update: {},
    create: {
      cursoId: curso.id,
      nombre: 'Matemáticas',
      slug: 'matematicas',
      color: '#EF4444',
      icono: 'Calculator',
      orden: 1,
      visible: true,
    },
  });

  const lengua = await prisma.asignatura.upsert({
    where: { cursoId_slug: { cursoId: curso.id, slug: 'lengua' } },
    update: {},
    create: {
      cursoId: curso.id,
      nombre: 'Lengua Castellana',
      slug: 'lengua',
      color: '#3B82F6',
      icono: 'BookOpen',
      orden: 2,
      visible: true,
    },
  });

  const ciencias = await prisma.asignatura.upsert({
    where: { cursoId_slug: { cursoId: curso.id, slug: 'ciencias-naturales' } },
    update: {},
    create: {
      cursoId: curso.id,
      nombre: 'Ciencias Naturales',
      slug: 'ciencias-naturales',
      color: '#10B981',
      icono: 'Beaker',
      orden: 3,
      visible: true,
    },
  });

  console.log('✅ Asignaturas creadas:', matematicas.nombre, lengua.nombre, ciencias.nombre);

  // 5. Crear avisos
  console.log('📢 Creando avisos...');

  await prisma.aviso.create({
    data: {
      cursoId: curso.id,
      titulo: 'Excursión al museo',
      mensaje: 'El próximo viernes iremos de excursión al Museo de Ciencias. Recordad traer la autorización firmada y el almuerzo.',
      tipo: 'IMPORTANTE',
      fechaPublicacion: new Date(),
      visible: true,
    },
  });

  await prisma.aviso.create({
    data: {
      titulo: 'Reunión de padres',
      mensaje: 'El jueves 15 de enero tendremos reunión de padres a las 17:00h en el aula.',
      tipo: 'INFO',
      fechaPublicacion: new Date(),
      visible: true,
    },
  });

  console.log('✅ Avisos creados');

  // 6. Crear unidad de Matemáticas con contenidos
  console.log('📝 Creando unidad de Matemáticas...');

  const unidadMates = await prisma.unidadDidactica.create({
    data: {
      asignaturaId: matematicas.id,
      slug: 'la-multiplicacion',
      numero: 1,
      titulo: 'La Multiplicación',
      descripcion: 'Aprendemos las tablas de multiplicar y sus propiedades',
      objetivos: '- Conocer las tablas de multiplicar del 1 al 10\n- Aplicar la propiedad conmutativa\n- Resolver problemas con multiplicaciones',
      fechaInicio: new Date('2024-09-01'),
      fechaFin: new Date('2024-10-15'),
      estado: 'ACTIVA',
      visible: true,
    },
  });

  // Contenido: Teoría
  const teoria = await prisma.contenido.create({
    data: {
      unidadId: unidadMates.id,
      titulo: '¿Qué es la multiplicación?',
      descripcion: 'Introducción al concepto de multiplicación como suma repetida',
      tipo: 'TEORIA',
      orden: 1,
      visible: true,
    },
  });

  // Recursos de teoría
  await prisma.recurso.create({
    data: {
      contenidoId: teoria.id,
      tipo: 'VIDEO',
      titulo: 'Introducción a la multiplicación',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      descripcion: 'Video explicativo sobre el concepto de multiplicación',
      metadata: { youtubeId: 'dQw4w9WgXcQ' },
      orden: 1,
    },
  });

  await prisma.recurso.create({
    data: {
      contenidoId: teoria.id,
      tipo: 'PDF',
      titulo: 'Tabla de multiplicar',
      url: 'https://ejemplo.com/tabla-multiplicar.pdf',
      descripcion: 'Tabla del 1 al 10 para imprimir',
      orden: 2,
    },
  });

  // Contenido: Actividad
  const actividad = await prisma.contenido.create({
    data: {
      unidadId: unidadMates.id,
      titulo: 'Practicamos las tablas',
      descripcion: 'Ejercicios interactivos para practicar',
      tipo: 'ACTIVIDAD',
      orden: 2,
      visible: true,
    },
  });

  await prisma.recurso.create({
    data: {
      contenidoId: actividad.id,
      tipo: 'LINK',
      titulo: 'Juego de multiplicaciones',
      url: 'https://ejemplo.com/juego-multiplicaciones',
      descripcion: 'Practica jugando en línea',
      orden: 1,
    },
  });

  // Contenido: Repaso
  const repaso = await prisma.contenido.create({
    data: {
      unidadId: unidadMates.id,
      titulo: 'Repaso general',
      descripcion: 'Ejercicios de repaso de toda la unidad',
      tipo: 'REPASO',
      orden: 3,
      visible: true,
    },
  });

  await prisma.recurso.create({
    data: {
      contenidoId: repaso.id,
      tipo: 'DOCUMENTO',
      titulo: 'Ficha de repaso',
      url: 'https://ejemplo.com/ficha-repaso.pdf',
      descripcion: 'Descarga la ficha para practicar en casa',
      orden: 1,
    },
  });

  // Criterios de evaluación
  await prisma.criterioEvaluacion.createMany({
    data: [
      {
        unidadId: unidadMates.id,
        codigo: 'CE.1.1',
        descripcion: 'Conoce y aplica las tablas de multiplicar hasta el 10',
        peso: 40,
        competencias: ['STEM', 'CPSAA'],
        indicadores: 'Resuelve correctamente multiplicaciones básicas',
      },
      {
        unidadId: unidadMates.id,
        codigo: 'CE.1.2',
        descripcion: 'Resuelve problemas aplicando la multiplicación',
        peso: 60,
        competencias: ['STEM', 'CPSAA', 'CCL'],
        indicadores: 'Identifica situaciones donde aplicar multiplicación y las resuelve correctamente',
      },
    ],
  });

  console.log('✅ Unidad de Matemáticas creada con contenidos');

  // 7. Crear unidad de Lengua
  console.log('📝 Creando unidad de Lengua...');

  const unidadLengua = await prisma.unidadDidactica.create({
    data: {
      asignaturaId: lengua.id,
      slug: 'el-sustantivo',
      numero: 1,
      titulo: 'El Sustantivo',
      descripcion: 'Identificamos y clasificamos sustantivos',
      objetivos: '- Reconocer sustantivos en un texto\n- Diferenciar entre sustantivos propios y comunes\n- Clasificar sustantivos por género y número',
      fechaInicio: new Date('2024-09-01'),
      estado: 'ACTIVA',
      visible: true,
    },
  });

  const teoriaLengua = await prisma.contenido.create({
    data: {
      unidadId: unidadLengua.id,
      titulo: '¿Qué es un sustantivo?',
      descripcion: 'Definición y tipos de sustantivos',
      tipo: 'TEORIA',
      orden: 1,
      visible: true,
    },
  });

  await prisma.recurso.create({
    data: {
      contenidoId: teoriaLengua.id,
      tipo: 'VIDEO',
      titulo: 'Los sustantivos explicados',
      url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
      descripcion: 'Video educativo sobre sustantivos',
      metadata: { youtubeId: 'oHg5SJYRHA0' },
      orden: 1,
    },
  });

  await prisma.criterioEvaluacion.create({
    data: {
      unidadId: unidadLengua.id,
      codigo: 'CE.L.1.1',
      descripcion: 'Identifica sustantivos en textos',
      peso: 50,
      competencias: ['CCL'],
      indicadores: 'Señala correctamente sustantivos en oraciones',
    },
  });

  console.log('✅ Unidad de Lengua creada');

  // 8. Crear unidad próxima (no activa aún)
  console.log('📝 Creando unidad próxima...');

  await prisma.unidadDidactica.create({
    data: {
      asignaturaId: ciencias.id,
      slug: 'los-seres-vivos',
      numero: 1,
      titulo: 'Los Seres Vivos',
      descripcion: 'Características de los seres vivos',
      objetivos: '- Conocer las características de los seres vivos\n- Clasificar seres vivos',
      fechaInicio: new Date('2024-10-20'),
      estado: 'PROXIMA',
      visible: true,
    },
  });

  console.log('✅ Unidad próxima creada');

  console.log('\n🎉 ¡Seed completado exitosamente!\n');
  console.log('📋 Resumen:');
  console.log('  - Usuario admin: admin@educanax.com / admin123');
  console.log('  - 1 curso creado');
  console.log('  - 3 asignaturas creadas');
  console.log('  - 3 unidades didácticas');
  console.log('  - Múltiples contenidos y recursos');
  console.log('  - 2 avisos activos');
  console.log('\n🚀 Puedes iniciar la app con: npm run dev');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

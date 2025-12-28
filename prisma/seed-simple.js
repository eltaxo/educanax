// Simple seed script that works with Node.js (no tsx required)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed básico...');

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
  await prisma.configuracion.upsert({
    where: { id: 'config-1' },
    update: {},
    create: {
      id: 'config-1',
      nombreColegio: 'Portal Educativo',
      mensajeBienvenida: 'Bienvenidos al portal educativo. Aquí podréis consultar todo el contenido didáctico.',
      contactoProfesor: 'Contacta con tu profesor/a para más información',
      colorPrimario: '#3B82F6',
    },
  });
  console.log('✅ Configuración creada');

  console.log('\n🎉 Seed básico completado!\n');
  console.log('📋 Credenciales:');
  console.log('  Email: admin@educanax.com');
  console.log('  Password: admin123');
  console.log('\n⚠️  Cambia la contraseña después del primer login\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

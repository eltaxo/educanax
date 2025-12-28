# 🎓 Educanax - Portal Educativo para Familias

Portal web educativo que permite a profesores gestionar contenido académico y compartirlo con las familias de forma sencilla y organizada.

## 📋 Características

### Backoffice para Profesores
- ✅ Gestión de cursos y asignaturas
- ✅ Creación de unidades didácticas
- ✅ Organización de contenidos (Teoría, Actividades, Repaso)
- ✅ Recursos multimedia (YouTube, PDFs, enlaces, imágenes)
- ✅ Criterios de evaluación según LOMLOE
- ✅ Sistema de avisos programables
- ✅ Configuración personalizable (colores, logo, mensajes)

### Portal Público para Familias
- ✅ Vista de todas las asignaturas organizadas por curso
- ✅ Navegación por unidades didácticas
- ✅ Contenido organizado en pestañas (Teoría/Actividades/Repaso)
- ✅ Reproducción de videos de YouTube integrada
- ✅ Visualización de criterios de evaluación
- ✅ Avisos y comunicaciones
- ✅ Sin necesidad de registro para familias

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL
- **ORM**: Prisma 5.22.0
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui
- **Iconos**: Lucide React

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado y corriendo
- npm o yarn

### Paso 1: Instalar dependencias

```bash
npm install
```

### Paso 2: Configurar base de datos

1. Crea una base de datos PostgreSQL:

```bash
# Conéctate a PostgreSQL
psql -U postgres

# Crea la base de datos
CREATE DATABASE educanax;
```

2. Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

3. Edita el archivo `.env` y configura la URL de tu base de datos:

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/educanax"
NEXTAUTH_SECRET="tu-secret-aqui-genera-uno-aleatorio"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_PORTAL_URL="http://localhost:3000"
```

Para generar un secret seguro puedes usar:
```bash
openssl rand -base64 32
```

### Paso 3: Ejecutar migraciones

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Paso 4: Poblar datos de ejemplo

```bash
npm run prisma:seed
```

Esto creará:
- ✅ Usuario administrador: `admin@educanax.com` / `admin123`
- ✅ Configuración inicial del portal
- ✅ 1 curso (3º Primaria)
- ✅ 3 asignaturas (Matemáticas, Lengua, Ciencias)
- ✅ 3 unidades didácticas con contenidos
- ✅ Recursos de ejemplo (videos, PDFs, enlaces)
- ✅ Criterios de evaluación LOMLOE
- ✅ Avisos de comunicación

### Paso 5: Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:
- **Portal público**: http://localhost:3000
- **Backoffice**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login

## 👤 Credenciales de Acceso

Después de ejecutar el seed, puedes acceder al backoffice con:

- **Email**: `admin@educanax.com`
- **Contraseña**: `admin123`

> ⚠️ **Importante**: Cambia estas credenciales en producción

## 📁 Estructura del Proyecto

```
educanax/
├── app/                          # Next.js App Router
│   ├── admin/                   # Backoffice (protegido)
│   │   ├── page.tsx            # Dashboard
│   │   ├── cursos/             # CRUD Cursos
│   │   ├── asignaturas/        # CRUD Asignaturas
│   │   ├── unidades/           # CRUD Unidades
│   │   ├── avisos/             # Gestión de avisos
│   │   └── configuracion/      # Configuración del portal
│   ├── api/                     # API Routes
│   ├── asignatura/[slug]/      # Vista pública de asignatura
│   ├── unidad/[slug]/          # Vista pública de unidad
│   ├── login/                   # Página de login
│   └── page.tsx                # Home pública
├── components/
│   ├── admin/                   # Componentes del backoffice
│   ├── portal/                  # Componentes del portal público
│   └── ui/                      # Componentes UI reutilizables
├── lib/
│   ├── auth.ts                  # Configuración NextAuth
│   ├── prisma.ts                # Cliente Prisma
│   └── utils.ts                 # Utilidades
├── prisma/
│   ├── schema.prisma            # Esquema de base de datos
│   └── seed.ts                  # Datos de ejemplo
└── middleware.ts                # Protección de rutas admin
```

## 🎨 Personalización

Desde el panel de administración (`/admin/configuracion`) puedes personalizar:

- Nombre del colegio/clase
- Logo del portal
- Mensaje de bienvenida
- Información de contacto
- Color principal del portal (6 opciones predefinidas)

## 📚 Guía de Uso

### Para Profesores

1. **Login**: Accede a `/login` con tus credenciales
2. **Dashboard**: Vista general del contenido publicado
3. **Crear Curso**: Define el curso académico
4. **Crear Asignaturas**: Añade las materias con colores e iconos
5. **Crear Unidades**: Organiza el temario en unidades didácticas
6. **Añadir Contenidos**: Dentro de cada unidad, añade teoría, actividades y repaso
7. **Subir Recursos**: Videos de YouTube, PDFs, enlaces, imágenes
8. **Definir Criterios**: Añade criterios de evaluación LOMLOE
9. **Publicar Avisos**: Comunica información a las familias
10. **Personalizar**: Configura colores, logo y mensajes

### Para Familias

1. **Navegar**: Accede directamente a la home pública
2. **Ver Avisos**: Lee las comunicaciones del profesor
3. **Explorar Asignaturas**: Haz clic en una asignatura
4. **Consultar Unidades**: Accede a cada unidad didáctica
5. **Ver Contenidos**: Navega por las pestañas (Teoría/Actividades/Repaso)
6. **Ver Videos**: Reproduce videos de YouTube integrados
7. **Descargar Recursos**: Accede a PDFs y documentos
8. **Consultar Criterios**: Revisa qué se evaluará en cada unidad

## 🗄️ Modelos de Base de Datos

- **UsuarioAdmin**: Profesores con acceso al backoffice
- **Configuracion**: Configuración global del portal
- **Curso**: Cursos académicos (ej: 3º Primaria)
- **Asignatura**: Materias (ej: Matemáticas, Lengua)
- **UnidadDidactica**: Temas o unidades de cada asignatura
- **Contenido**: Contenidos dentro de unidades (Teoría/Actividad/Repaso)
- **Recurso**: Recursos multimedia (Videos, PDFs, Enlaces)
- **CriterioEvaluacion**: Criterios LOMLOE con competencias
- **Aviso**: Comunicaciones para familias

## 🔒 Seguridad

- ✅ Autenticación con NextAuth.js
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Middleware de protección para rutas `/admin/*`
- ✅ Variables de entorno para datos sensibles
- ✅ Validación de sesión en API routes

## 📝 Scripts Disponibles

```bash
npm run dev                 # Servidor de desarrollo
npm run build              # Build de producción
npm run start              # Ejecutar build de producción
npm run lint               # Linter

npm run prisma:generate    # Generar cliente Prisma
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:seed        # Poblar datos de ejemplo
npm run prisma:studio      # Abrir Prisma Studio (GUI)
```

## 🐛 Troubleshooting

### Error de conexión a base de datos

```
Can't reach database server at localhost:5432
```

**Solución**: Asegúrate de que PostgreSQL esté corriendo:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Inicia el servicio desde Services.msc
```

### Error en migraciones

```
Error: P1001: Can't reach database server
```

**Solución**: Verifica la `DATABASE_URL` en `.env` y que la base de datos exista.

### Error "Invalid `prisma` invocation"

**Solución**: Regenera el cliente Prisma:
```bash
npm run prisma:generate
```

## 🚀 Deployment en Producción

### Opción 1: VPS/Servidor Propio con Docker (Recomendado)

Esta es la opción ideal si tienes un servidor VPS (Ubuntu, Debian, etc.).

📘 **Ver guía completa**: [GUIA_DEPLOYMENT.md](./GUIA_DEPLOYMENT.md)

**Resumen rápido:**

```bash
# 1. En tu servidor, clona el repositorio
git clone https://github.com/TU-USUARIO/educanax.git
cd educanax

# 2. Configura las variables de entorno
cp .env.production .env
nano .env  # Edita con tus valores

# 3. Ejecuta el deployment
./scripts/deploy.sh

# 4. Configura SSL
./scripts/setup-ssl.sh
```

**Incluye:**
- ✅ Docker Compose con PostgreSQL, Next.js y Nginx
- ✅ Scripts automatizados de deployment
- ✅ Configuración SSL con Let's Encrypt
- ✅ Scripts de backup automático
- ✅ Guía paso a paso detallada

### Opción 2: Vercel

1. Push tu código a GitHub
2. Importa el proyecto en Vercel
3. Configura las variables de entorno:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_PORTAL_URL`
4. Conecta una base de datos PostgreSQL (Vercel Postgres, Neon, Supabase)
5. Ejecuta las migraciones y seed desde la terminal de Vercel

## 📄 Licencia

Este proyecto es un desarrollo educativo. Úsalo libremente para tus clases.

---

**¿Necesitas ayuda?** Consulta la documentación de [Next.js](https://nextjs.org/docs) y [Prisma](https://www.prisma.io/docs).

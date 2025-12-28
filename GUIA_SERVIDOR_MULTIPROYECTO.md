# 🏢 Guía para Servidor Multi-Proyecto

Esta guía es específica para servidores que **ya tienen otros proyectos corriendo**, como es tu caso.

---

## 📍 Tu Configuración

- Proyectos en: `/var/www/nombre-proyecto`
- Educanax irá en: `/var/www/educanax`
- Probablemente ya tienes **Nginx principal** gestionando subdominios
- Educanax usará el **puerto 3100** internamente
- El Nginx principal hará proxy pass a ese puerto

---

## ✅ PASO 1: Verificar tu Servidor

Antes de empezar, vamos a verificar qué tienes en el servidor:

```bash
# Conéctate al servidor
ssh tu-usuario@TU-IP-SERVIDOR

# Ejecuta el script de verificación
cd /var/www
git clone https://github.com/eltaxo/educanax.git
cd educanax
chmod +x scripts/check-server.sh
sudo ./scripts/check-server.sh
```

Este script te dirá:
- ✅ Si tienes Nginx principal corriendo
- ✅ Qué puertos están en uso
- ✅ Si Docker está instalado
- ✅ **Qué configuración debes usar**

---

## 🔧 PASO 2: Instalar Dependencias (si no las tienes)

### Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Activar Docker
sudo systemctl enable docker
sudo systemctl start docker

# Cerrar sesión y volver a entrar para que tome efecto
exit
# Volver a conectarte
ssh tu-usuario@TU-IP-SERVIDOR
```

### Docker Compose

```bash
# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker-compose --version
```

---

## 📦 PASO 3: Configurar Variables de Entorno

```bash
# En /var/www/educanax
cp .env.production .env
nano .env
```

Configura estos valores:

```env
# Database
DATABASE_URL="postgresql://postgres:TU_PASSWORD_SEGURO@postgres:5432/educanax"
DB_PASSWORD="TU_PASSWORD_SEGURO"

# NextAuth - Genera con: openssl rand -base64 32
NEXTAUTH_SECRET="tu-secret-generado"
NEXTAUTH_URL="https://educanax.eltaxo.com"

# Portal URL
NEXT_PUBLIC_PORTAL_URL="https://educanax.eltaxo.com"
```

Guarda con `Ctrl+X`, `Y`, `Enter`.

---

## 🚀 PASO 4: Desplegar la Aplicación

```bash
# Desde /var/www/educanax
./scripts/deploy.sh
```

El script detectará automáticamente que tienes Nginx principal y:
1. Usará `docker-compose.yml` (puerto 3100)
2. NO levantará un Nginx en Docker
3. Te dirá los pasos para configurar tu Nginx principal

---

## 🌐 PASO 5: Configurar Nginx Principal

### 5.1 Copiar configuración

```bash
sudo cp nginx-server-config/educanax.conf /etc/nginx/sites-available/educanax.conf
```

### 5.2 Editar la configuración (IMPORTANTE)

```bash
sudo nano /etc/nginx/sites-available/educanax.conf
```

**Comenta temporalmente** las líneas de SSL hasta que tengas el certificado:

```nginx
# Comenta estas líneas por ahora:
# ssl_certificate /etc/letsencrypt/live/educanax.eltaxo.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/educanax.eltaxo.com/privkey.pem;
```

Y **temporalmente** cambia el puerto 443 a 80:

```nginx
server {
    listen 80;  # Cambiar temporalmente
    # listen 443 ssl http2;  # Comentar temporalmente
    server_name educanax.eltaxo.com;

    # ...resto de la configuración
}
```

### 5.3 Activar el sitio

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/educanax.conf /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Si todo OK, recargar Nginx
sudo systemctl reload nginx
```

---

## 🔐 PASO 6: Configurar SSL con Certbot

### 6.1 Instalar Certbot (si no lo tienes)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtener certificado

```bash
sudo certbot --nginx -d educanax.eltaxo.com
```

Certbot te preguntará:
1. Tu email → Introduce tu email real
2. Términos de servicio → Acepta (A)
3. Newsletter → Lo que prefieras
4. **¿Redirigir HTTP a HTTPS?** → Sí (2)

¡Certbot configurará automáticamente el SSL en tu Nginx!

### 6.3 Verificar

Abre tu navegador: https://educanax.eltaxo.com

Deberías ver:
- ✅ Candado verde 🔒
- ✅ La aplicación cargando

---

## 👤 PASO 7: Crear Usuario Administrador

### Opción A: Usar el seed (rápido)

```bash
docker-compose exec app npm run prisma:seed
```

Usuario creado:
- Email: `admin@educanax.com`
- Password: `admin123`

⚠️ **Cambia el password después del primer login**

### Opción B: Prisma Studio (manual)

```bash
# En el servidor
docker-compose exec app npx prisma studio --browser none
```

Luego, **en tu computadora local**:

```bash
# Abrir túnel SSH
ssh -L 5555:localhost:5555 tu-usuario@TU-IP-SERVIDOR
```

Abre en tu navegador: http://localhost:5555

Crea el usuario manualmente:
1. Click en "User"
2. "Add record"
3. Completar datos
4. role: `TEACHER`
5. password: generar hash con:

```bash
docker-compose exec app node -e "console.log(require('bcryptjs').hashSync('tu-password', 10))"
```

---

## 📊 Verificación Final

### Servicios corriendo

```bash
docker-compose ps
```

Deberías ver:
```
educanax-postgres   running
educanax-app       running
```

### Logs

```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de PostgreSQL
docker-compose logs -f postgres
```

### Nginx

```bash
# Ver configuración de Nginx
sudo nginx -t

# Ver sitios activos
ls -la /etc/nginx/sites-enabled/

# Logs de Nginx
sudo tail -f /var/log/nginx/educanax.access.log
sudo tail -f /var/log/nginx/educanax.error.log
```

---

## 🔄 Comandos Útiles

### Ver qué está usando los puertos

```bash
sudo lsof -i :3100  # Educanax
sudo lsof -i :80    # Nginx
sudo lsof -i :443   # Nginx SSL
```

### Reiniciar servicios

```bash
# Reiniciar Educanax
docker-compose restart app

# Reiniciar Nginx principal
sudo systemctl reload nginx

# Reiniciar todo Docker
docker-compose restart
```

### Logs

```bash
# Logs de Educanax
docker-compose logs -f app

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### Backup

```bash
./scripts/backup-db.sh
```

---

## 🆘 Solución de Problemas

### Error: "port 3100 already in use"

```bash
# Ver qué está usando el puerto
sudo lsof -i :3100

# Si es un contenedor viejo de Educanax
docker-compose down
docker-compose up -d
```

### Error: "Nginx failed to start"

```bash
# Ver el error específico
sudo nginx -t

# Ver logs
sudo tail -20 /var/log/nginx/error.log

# Verificar sintaxis del archivo
sudo nano /etc/nginx/sites-available/educanax.conf
```

### La aplicación no carga

```bash
# Verificar que el contenedor está corriendo
docker-compose ps

# Ver logs de la aplicación
docker-compose logs app

# Verificar que Nginx hace proxy al puerto correcto
curl http://localhost:3100
# Debería devolver HTML
```

### Error de base de datos

```bash
# Ejecutar migraciones manualmente
docker-compose exec app npx prisma migrate deploy

# Resetear la base de datos (CUIDADO: borra datos)
docker-compose exec app npx prisma migrate reset
```

---

## 🎯 Estructura Final

Tu servidor quedará así:

```
/var/www/
├── otro-proyecto-1/
├── otro-proyecto-2/
└── educanax/              ← Nuevo
    ├── docker-compose.yml
    ├── .env
    ├── scripts/
    └── ...

/etc/nginx/sites-available/
├── otro-proyecto-1.conf
├── otro-proyecto-2.conf
└── educanax.conf          ← Nuevo

/etc/nginx/sites-enabled/
├── otro-proyecto-1.conf -> ../sites-available/otro-proyecto-1.conf
├── otro-proyecto-2.conf -> ../sites-available/otro-proyecto-2.conf
└── educanax.conf -> ../sites-available/educanax.conf    ← Nuevo
```

---

## 📦 Contenedores Docker

Educanax tendrá sus propios contenedores aislados:

```bash
docker ps
```

Verás:
- `educanax-postgres` - Base de datos PostgreSQL (puerto interno)
- `educanax-app` - Next.js (puerto 3100 → localhost)

**NO interferirán** con otros proyectos porque:
1. Tienen nombres únicos (`educanax-*`)
2. Usan su propia red Docker (`educanax-network`)
3. Los volúmenes son únicos (`educanax_postgres_data`)
4. El puerto expuesto (3100) no conflictúa con otros

---

## 🔐 Renovación Automática de SSL

Certbot ya configuró la renovación automática. Para verificar:

```bash
# Ver timer de renovación
sudo systemctl status certbot.timer

# Probar renovación (no renueva realmente)
sudo certbot renew --dry-run
```

---

## 📧 Entregar al Cliente

Una vez todo funcione:

1. ✅ Verifica que https://educanax.eltaxo.com funciona
2. ✅ Crea el usuario administrador
3. ✅ Envía credenciales al cliente
4. ✅ Envía el `MANUAL_USUARIO.pdf`
5. ✅ Configura backups automáticos (opcional):

```bash
# Agregar a crontab
crontab -e

# Backup diario a las 3 AM
0 3 * * * cd /var/www/educanax && ./scripts/backup-db.sh
```

---

## 🎉 ¡Listo!

Ahora tienes Educanax corriendo en tu servidor multi-proyecto:

- 🌐 https://educanax.eltaxo.com
- 🔒 SSL válido
- 📦 Aislado de otros proyectos
- 💾 Backups configurables
- 🔄 Actualizaciones fáciles con Git

---

**¿Dudas o problemas?** Consulta `COMANDOS_RAPIDOS.md` para una referencia rápida de comandos.

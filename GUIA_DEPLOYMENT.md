# 🚀 Guía de Deployment - Educanax

Esta guía te llevará paso a paso para desplegar Educanax en tu VPS con el dominio **educanax.eltaxo.com**.

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener:

✅ Un VPS/Servidor con Ubuntu 20.04 o superior
✅ Acceso SSH a tu servidor (usuario y contraseña o clave SSH)
✅ El dominio `educanax.eltaxo.com` apuntando a la IP de tu servidor
✅ Usuario de GitHub (para crear un repositorio)

---

## 🎯 PASO 1: Crear Repositorio en GitHub

### 1.1 Desde tu computadora local

```bash
# Navega al directorio del proyecto
cd /Users/albertoaznar/educanax

# Inicializa Git (si no lo has hecho)
git init

# Agrega todos los archivos
git add .

# Haz el primer commit
git commit -m "Initial commit - Educanax ready for production"
```

### 1.2 Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `educanax`
3. Déjalo como **Private** (para proteger tu código)
4. **NO** marques "Add README" ni ninguna opción (ya tienes archivos)
5. Click en "Create repository"

### 1.3 Conectar y subir el código

```bash
# Conecta tu repositorio local con GitHub (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/educanax.git

# Sube el código
git branch -M main
git push -u origin main
```

✅ **Verifica**: Deberías ver todos tus archivos en GitHub

---

## 🖥️ PASO 2: Preparar el Servidor VPS

### 2.1 Conectarse al servidor

```bash
# Desde tu terminal (reemplaza con tu IP y usuario)
ssh tu-usuario@TU-IP-DEL-SERVIDOR

# Por ejemplo:
# ssh root@185.123.45.67
```

### 2.2 Actualizar el sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.3 Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Añadir tu usuario al grupo docker (para no usar sudo siempre)
sudo usermod -aG docker $USER

# Activar Docker al inicio
sudo systemctl enable docker
sudo systemctl start docker

# Verificar que funciona
docker --version
```

### 2.4 Instalar Docker Compose

```bash
# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker-compose --version
```

### 2.5 Instalar Git

```bash
sudo apt install git -y
git --version
```

✅ **Checkpoint**: Deberías tener instalado Docker, Docker Compose y Git

---

## 📦 PASO 3: Clonar el Proyecto en el Servidor

### 3.1 Crear directorio para la aplicación

```bash
# Crear directorio
mkdir -p ~/apps
cd ~/apps
```

### 3.2 Clonar el repositorio

```bash
# Clonar desde GitHub (reemplaza TU-USUARIO)
git clone https://github.com/TU-USUARIO/educanax.git
cd educanax
```

✅ **Verifica**: `ls -la` debería mostrar todos los archivos del proyecto

---

## 🔐 PASO 4: Configurar Variables de Entorno

### 4.1 Generar secreto para NextAuth

```bash
# Ejecuta este comando y copia el resultado
openssl rand -base64 32
```

### 4.2 Crear archivo .env

```bash
# Crea el archivo .env
nano .env
```

### 4.3 Pega esta configuración (AJUSTA LOS VALORES)

```env
# Database - CAMBIA LA CONTRASEÑA
DATABASE_URL="postgresql://postgres:TU_PASSWORD_SUPER_SEGURO@postgres:5432/educanax"
DB_PASSWORD="TU_PASSWORD_SUPER_SEGURO"

# NextAuth - PEGA EL SECRET QUE GENERASTE ARRIBA
NEXTAUTH_SECRET="el-secret-que-generaste-con-openssl"
NEXTAUTH_URL="https://educanax.eltaxo.com"

# Portal URL
NEXT_PUBLIC_PORTAL_URL="https://educanax.eltaxo.com"
```

**IMPORTANTE:**
- Cambia `TU_PASSWORD_SUPER_SEGURO` por una contraseña fuerte
- Pega el secret que generaste con `openssl rand -base64 32`

### 4.4 Guardar y salir

- Presiona `Ctrl + X`
- Presiona `Y` para confirmar
- Presiona `Enter`

✅ **Verifica**: `cat .env` debería mostrar tu configuración

---

## 🐳 PASO 5: Preparar Docker

### 5.1 Detener servicios que usen puerto 80/443

```bash
# Verificar qué usa el puerto 80
sudo lsof -i :80

# Si hay algo (como Apache o Nginx), detenerlo
# Por ejemplo:
# sudo systemctl stop apache2
# sudo systemctl stop nginx
```

### 5.2 Abrir puertos en el firewall

```bash
# Si usas UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH, para no quedarte fuera
sudo ufw enable
sudo ufw status
```

---

## 🚀 PASO 6: Desplegar la Aplicación

### 6.1 Ejecutar el script de deployment

```bash
# Desde el directorio del proyecto
./scripts/deploy.sh
```

Este script va a:
1. ✅ Construir las imágenes Docker
2. ✅ Iniciar PostgreSQL
3. ✅ Ejecutar las migraciones de la base de datos
4. ✅ Iniciar la aplicación Next.js
5. ✅ Iniciar Nginx

**⏱️ Esto puede tardar 5-10 minutos** la primera vez.

### 6.2 Verificar que está corriendo

```bash
# Ver el estado de los contenedores
docker-compose ps

# Deberías ver:
# educanax-postgres   running
# educanax-app       running
# educanax-nginx     running
```

### 6.3 Ver los logs

```bash
# Ver todos los logs
docker-compose logs -f

# Ver solo logs de la aplicación
docker-compose logs -f app

# Presiona Ctrl+C para salir
```

✅ **Primera prueba**: Abre http://educanax.eltaxo.com en tu navegador

---

## 🔒 PASO 7: Configurar HTTPS (SSL)

### 7.1 Ejecutar el script de SSL

```bash
# Desde el directorio del proyecto
./scripts/setup-ssl.sh
```

### 7.2 Sigue las instrucciones

1. Te pedirá tu email (para Let's Encrypt)
2. Esperará a que obtenga los certificados
3. Te pedirá que edites `nginx/nginx.conf`

### 7.3 Editar nginx.conf

```bash
nano nginx/nginx.conf
```

Busca estas líneas y **descoméntalas** (quita el `#`):

#### En el bloque server HTTP (puerto 80):
```nginx
# Busca esta línea y DESCOMÉNTALA:
return 301 https://$server_name$request_uri;

# Y COMENTA todo el bloque location / para que solo redirija
```

#### Descomenta todo el bloque HTTPS:
```nginx
# Descomenta desde aquí:
server {
    listen 443 ssl http2;
    server_name educanax.eltaxo.com;

    # ... todo el bloque hasta el final
}
```

Guarda con `Ctrl+X`, luego `Y`, luego `Enter`.

### 7.4 El script reiniciará Nginx automáticamente

✅ **Prueba final**: Abre https://educanax.eltaxo.com

Deberías ver el 🔒 candado verde en tu navegador!

---

## 👤 PASO 8: Crear el Usuario Administrador

### 8.1 Acceder a Prisma Studio

```bash
# Desde el servidor, en el directorio del proyecto
docker-compose exec app npx prisma studio --browser none
```

Esto iniciará Prisma Studio en el puerto 5555.

### 8.2 Crear túnel SSH desde tu computadora local

Abre **otra terminal** en tu computadora local:

```bash
# Reemplaza con tu IP y usuario
ssh -L 5555:localhost:5555 tu-usuario@TU-IP-SERVIDOR
```

Ahora abre en tu navegador: http://localhost:5555

### 8.3 Crear el profesor admin

1. Click en "User"
2. Click en "Add record"
3. Completa:
   - **email**: tu@email.com
   - **name**: Tu Nombre
   - **password**: `$2a$10$...` (hash de bcrypt - ve abajo cómo generarlo)
   - **role**: TEACHER
4. Click en "Save 1 change"

#### Para generar el hash de la contraseña:

En tu servidor, ejecuta:

```bash
docker-compose exec app node -e "console.log(require('bcryptjs').hashSync('tu-password-aqui', 10))"
```

Copia el resultado y pégalo en el campo `password` de Prisma Studio.

✅ **Verifica**: Intenta hacer login en https://educanax.eltaxo.com/auth/signin

---

## 📊 Comandos Útiles

### Ver logs
```bash
docker-compose logs -f app      # Logs de la aplicación
docker-compose logs -f postgres # Logs de la base de datos
docker-compose logs -f nginx    # Logs de Nginx
```

### Reiniciar servicios
```bash
docker-compose restart app      # Reiniciar solo la app
docker-compose restart          # Reiniciar todo
```

### Detener todo
```bash
docker-compose down
```

### Iniciar todo
```bash
docker-compose up -d
```

### Backup de la base de datos
```bash
./scripts/backup-db.sh
```

### Actualizar la aplicación (después de hacer cambios en GitHub)
```bash
./scripts/update.sh
```

---

## 🆘 Solución de Problemas

### La aplicación no inicia

```bash
# Ver logs para detectar el error
docker-compose logs app

# Reiniciar desde cero
docker-compose down
docker-compose up -d --build
```

### Error de base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Ejecutar migraciones manualmente
docker-compose exec app npx prisma migrate deploy
```

### Nginx no sirve la página

```bash
# Verificar configuración de Nginx
docker-compose exec nginx nginx -t

# Reiniciar Nginx
docker-compose restart nginx
```

### No puedo acceder desde el navegador

1. Verifica que el dominio apunta a tu IP:
   ```bash
   nslookup educanax.eltaxo.com
   ```

2. Verifica que los puertos están abiertos:
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

3. Verifica el firewall:
   ```bash
   sudo ufw status
   ```

---

## 🎉 ¡Deployment Completado!

Tu aplicación Educanax debería estar corriendo en:
- 🌐 https://educanax.eltaxo.com

### Siguientes pasos recomendados:

1. ✅ Crear backups automáticos diarios (crontab)
2. ✅ Configurar monitoring (Uptime Robot, etc.)
3. ✅ Revisar logs regularmente
4. ✅ Mantener el sistema actualizado

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs`
2. Verifica que todos los servicios están corriendo: `docker-compose ps`
3. Consulta la sección de solución de problemas arriba

---

**¡Buena suerte! 🚀**

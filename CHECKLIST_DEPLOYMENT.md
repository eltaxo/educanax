# ✅ Checklist de Deployment - Educanax

Marca cada paso a medida que lo completes.

---

## 🏁 FASE 1: Preparación Local

- [ ] Crear repositorio en GitHub (nombre: `educanax`, tipo: Private)
- [ ] Inicializar Git: `git init`
- [ ] Hacer commit inicial: `git add . && git commit -m "Initial commit"`
- [ ] Conectar con GitHub: `git remote add origin [URL]`
- [ ] Subir código: `git push -u origin main`
- [ ] Verificar que el código está en GitHub

---

## 🖥️ FASE 2: Configurar Servidor

- [ ] Conectar al servidor por SSH
- [ ] Actualizar sistema: `sudo apt update && sudo apt upgrade -y`
- [ ] Instalar Docker
- [ ] Instalar Docker Compose
- [ ] Instalar Git
- [ ] Verificar instalaciones:
  - [ ] `docker --version`
  - [ ] `docker-compose --version`
  - [ ] `git --version`

---

## 🔥 FASE 3: Firewall y Puertos

- [ ] Verificar qué usa el puerto 80: `sudo lsof -i :80`
- [ ] Detener servicios en puerto 80/443 si existen
- [ ] Abrir puerto 80: `sudo ufw allow 80/tcp`
- [ ] Abrir puerto 443: `sudo ufw allow 443/tcp`
- [ ] Abrir puerto 22 (SSH): `sudo ufw allow 22/tcp`
- [ ] Activar firewall: `sudo ufw enable`
- [ ] Verificar: `sudo ufw status`

---

## 📦 FASE 4: Clonar Proyecto

- [ ] Crear directorio: `mkdir -p ~/apps && cd ~/apps`
- [ ] Clonar repositorio: `git clone [URL]`
- [ ] Entrar al directorio: `cd educanax`
- [ ] Verificar archivos: `ls -la`

---

## 🔐 FASE 5: Variables de Entorno

- [ ] Generar secret: `openssl rand -base64 32`
- [ ] Copiar archivo: `cp .env.production .env`
- [ ] Editar archivo: `nano .env`
- [ ] Configurar `DB_PASSWORD` (crear contraseña segura)
- [ ] Configurar `NEXTAUTH_SECRET` (pegar el secret generado)
- [ ] Verificar URLs: `https://educanax.eltaxo.com`
- [ ] Guardar archivo (Ctrl+X, Y, Enter)
- [ ] Verificar: `cat .env` (que tenga valores reales)

---

## 🚀 FASE 6: Deployment

- [ ] Dar permisos a scripts: `chmod +x scripts/*.sh`
- [ ] Ejecutar deployment: `./scripts/deploy.sh`
- [ ] Esperar a que termine (5-10 min)
- [ ] Verificar que no hay errores
- [ ] Verificar contenedores corriendo: `docker-compose ps`
  - [ ] `educanax-postgres` → running
  - [ ] `educanax-app` → running
  - [ ] `educanax-nginx` → running
- [ ] Ver logs: `docker-compose logs -f app`
- [ ] Verificar que la app inicia sin errores

---

## 🌐 FASE 7: Verificar HTTP

- [ ] Abrir navegador: `http://educanax.eltaxo.com`
- [ ] Verificar que la página carga
- [ ] Verificar que se ve correctamente
- [ ] Probar navegación básica

---

## 🔒 FASE 8: Configurar SSL

- [ ] Ejecutar: `./scripts/setup-ssl.sh`
- [ ] Introducir tu email cuando lo pida
- [ ] Esperar a que obtenga certificados
- [ ] Verificar que se creó: `ls -la nginx/ssl/live/educanax.eltaxo.com/`
- [ ] Editar nginx.conf: `nano nginx/nginx.conf`
- [ ] En el bloque HTTP (puerto 80):
  - [ ] Descomentar: `return 301 https://...`
  - [ ] Comentar todo el bloque `location /`
- [ ] Descomentar TODO el bloque HTTPS (server 443)
- [ ] Guardar (Ctrl+X, Y, Enter)
- [ ] El script reiniciará Nginx automáticamente
- [ ] Verificar que Nginx reinició: `docker-compose ps nginx`

---

## 🔐 FASE 9: Verificar HTTPS

- [ ] Abrir navegador: `https://educanax.eltaxo.com`
- [ ] Verificar candado verde 🔒
- [ ] Click en el candado → ver certificado
- [ ] Verificar que el certificado es válido
- [ ] Verificar que `http://` redirige a `https://`

---

## 👤 FASE 10: Crear Usuario Admin

### Opción A: Prisma Studio (recomendado)

- [ ] En el servidor: `docker-compose exec app npx prisma studio --browser none`
- [ ] En tu PC local, abrir nueva terminal
- [ ] Crear túnel SSH: `ssh -L 5555:localhost:5555 usuario@IP`
- [ ] Abrir navegador: `http://localhost:5555`
- [ ] Click en "User"
- [ ] Click en "Add record"
- [ ] Completar datos:
  - [ ] email: tu@email.com
  - [ ] name: Tu Nombre
  - [ ] password: (generar hash - ver abajo)
  - [ ] role: TEACHER
- [ ] Guardar
- [ ] Cerrar Prisma Studio (Ctrl+C en servidor)

**Generar hash de password:**
```bash
docker-compose exec app node -e "console.log(require('bcryptjs').hashSync('TU-PASSWORD', 10))"
```

### Opción B: Usar seed (más rápido)

- [ ] Ejecutar: `docker-compose exec app npm run prisma:seed`
- [ ] Usuario creado: `admin@educanax.com` / `admin123`
- [ ] ⚠️ CAMBIAR password después del primer login

---

## ✅ FASE 11: Verificación Final

- [ ] Ir a: `https://educanax.eltaxo.com/auth/signin`
- [ ] Hacer login con credenciales creadas
- [ ] Verificar que accede al backoffice
- [ ] Crear un curso de prueba
- [ ] Crear una asignatura de prueba
- [ ] Verificar que aparece en el portal público
- [ ] Hacer logout
- [ ] Verificar el portal público sin login

---

## 🎯 FASE 12: Configuración Inicial

- [ ] Login como admin
- [ ] Ir a "Configuración"
- [ ] Configurar:
  - [ ] Nombre del colegio/clase
  - [ ] Mensaje de bienvenida
  - [ ] Color del portal
  - [ ] Información de contacto
- [ ] Guardar cambios
- [ ] Verificar cambios en portal público

---

## 💾 FASE 13: Backup

- [ ] Ejecutar backup de prueba: `./scripts/backup-db.sh`
- [ ] Verificar que se creó: `ls -la backups/`
- [ ] Verificar que el archivo .sql.gz existe
- [ ] Opcional: Configurar cron para backups diarios

```bash
# Editar crontab
crontab -e

# Añadir esta línea (backup diario a las 2 AM)
0 2 * * * /home/usuario/apps/educanax/scripts/backup-db.sh
```

---

## 📊 FASE 14: Monitoreo (Opcional)

- [ ] Configurar Uptime Robot (https://uptimerobot.com)
- [ ] Añadir monitor para `https://educanax.eltaxo.com`
- [ ] Configurar alertas por email
- [ ] Verificar que recibe notificaciones

---

## 📧 FASE 15: Entrega al Cliente

- [ ] Crear documento con credenciales:
  - [ ] URL: https://educanax.eltaxo.com
  - [ ] Usuario: [email]
  - [ ] Contraseña: [password]
- [ ] Enviar `MANUAL_USUARIO.pdf`
- [ ] Explicar funcionalidades básicas
- [ ] Programar sesión de formación (opcional)

---

## 🎉 ¡DEPLOYMENT COMPLETADO!

### URLs Importantes:
- 🌐 Portal Público: https://educanax.eltaxo.com
- 🔐 Login Admin: https://educanax.eltaxo.com/auth/signin
- 📊 Dashboard: https://educanax.eltaxo.com/admin

### Comandos Útiles para Recordar:

```bash
# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Backup manual
./scripts/backup-db.sh

# Actualizar desde GitHub
./scripts/update.sh

# Ver estado de contenedores
docker-compose ps
```

---

## 📝 Notas y Observaciones

Espacio para tus notas durante el deployment:

```
Fecha de deployment: ______________
IP del servidor: ______________
Password DB: ______________
Email SSL: ______________
Usuario admin creado: ______________

Observaciones:
-
-
-
```

---

**✨ ¡Felicidades por completar el deployment! ✨**

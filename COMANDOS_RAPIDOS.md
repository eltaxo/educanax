# ⚡ Comandos Rápidos - Educanax

Referencia rápida de comandos útiles para gestionar Educanax en producción.

---

## 🚀 Deployment y Actualización

### Desplegar por primera vez
```bash
./scripts/deploy.sh
```

### Actualizar desde GitHub
```bash
./scripts/update.sh
```

### Deployment manual paso a paso
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🐳 Docker Compose

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Detener todos los servicios
```bash
docker-compose down
```

### Reiniciar todos los servicios
```bash
docker-compose restart
```

### Reiniciar un servicio específico
```bash
docker-compose restart app      # Solo la aplicación
docker-compose restart postgres # Solo la base de datos
docker-compose restart nginx    # Solo Nginx
```

### Ver estado de los servicios
```bash
docker-compose ps
```

### Rebuild completo (después de cambios en Dockerfile)
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## 📋 Logs

### Ver logs de todos los servicios (en tiempo real)
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f app       # Aplicación
docker-compose logs -f postgres  # Base de datos
docker-compose logs -f nginx     # Nginx
```

### Ver últimas 100 líneas de logs
```bash
docker-compose logs --tail=100 app
```

### Ver logs sin seguir (solo mostrar y salir)
```bash
docker-compose logs app
```

---

## 🗄️ Base de Datos

### Backup manual
```bash
./scripts/backup-db.sh
```

### Backup manual (sin script)
```bash
docker exec educanax-postgres pg_dump -U postgres educanax > backup_$(date +%Y%m%d).sql
```

### Restaurar desde backup
```bash
# Descomprimir backup
gunzip backups/educanax_backup_20240101_120000.sql.gz

# Restaurar
docker exec -i educanax-postgres psql -U postgres educanax < backups/educanax_backup_20240101_120000.sql
```

### Acceder a PostgreSQL (consola)
```bash
docker exec -it educanax-postgres psql -U postgres educanax
```

### Ver tablas
```sql
\dt
```

### Salir de PostgreSQL
```sql
\q
```

### Ejecutar migraciones
```bash
docker-compose exec app npx prisma migrate deploy
```

### Abrir Prisma Studio
```bash
docker-compose exec app npx prisma studio --browser none
# Luego desde tu PC local:
# ssh -L 5555:localhost:5555 usuario@IP-servidor
# Abrir: http://localhost:5555
```

---

## 🔐 SSL y Certificados

### Configurar SSL por primera vez
```bash
./scripts/setup-ssl.sh
```

### Renovar certificados manualmente
```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

### Verificar certificados SSL
```bash
ls -la nginx/ssl/live/educanax.eltaxo.com/
```

### Ver fecha de expiración del certificado
```bash
docker-compose run --rm certbot certificates
```

---

## 🌐 Nginx

### Verificar configuración de Nginx
```bash
docker-compose exec nginx nginx -t
```

### Recargar configuración (sin reiniciar)
```bash
docker-compose exec nginx nginx -s reload
```

### Ver logs de acceso de Nginx
```bash
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

### Ver logs de errores de Nginx
```bash
docker-compose exec nginx tail -f /var/log/nginx/error.log
```

---

## 🔍 Monitoreo y Estado

### Ver uso de recursos
```bash
docker stats
```

### Ver espacio en disco
```bash
df -h
```

### Ver espacio usado por Docker
```bash
docker system df
```

### Limpiar recursos no usados de Docker
```bash
docker system prune -a
# ⚠️ CUIDADO: Esto elimina imágenes y contenedores no usados
```

### Ver procesos dentro de un contenedor
```bash
docker-compose top app
```

---

## 🛠️ Mantenimiento

### Limpiar logs antiguos de Docker
```bash
sudo sh -c "truncate -s 0 /var/lib/docker/containers/**/*-json.log"
```

### Ver variables de entorno de un contenedor
```bash
docker-compose exec app env
```

### Ejecutar comando dentro del contenedor
```bash
docker-compose exec app sh
# Ahora estás dentro del contenedor, puedes ejecutar comandos
# Para salir: exit
```

### Ver IP del contenedor
```bash
docker inspect educanax-app | grep IPAddress
```

---

## 🔄 Git

### Ver estado del repositorio
```bash
git status
```

### Ver commits recientes
```bash
git log --oneline -10
```

### Descartar cambios locales y actualizar
```bash
git fetch origin
git reset --hard origin/main
```

### Ver qué cambios hay en GitHub
```bash
git fetch
git log HEAD..origin/main --oneline
```

---

## 🧪 Testing y Debug

### Ejecutar un comando en la aplicación
```bash
docker-compose exec app npm run [comando]
```

### Ver versión de Node.js en el contenedor
```bash
docker-compose exec app node --version
```

### Ver versión de npm en el contenedor
```bash
docker-compose exec app npm --version
```

### Generar password hash para usuarios
```bash
docker-compose exec app node -e "console.log(require('bcryptjs').hashSync('tu-password', 10))"
```

---

## 🚨 Emergencias

### Detener todo inmediatamente
```bash
docker-compose down
```

### Ver qué está usando un puerto
```bash
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :5432
```

### Reiniciar Docker completamente
```bash
sudo systemctl restart docker
```

### Eliminar todos los contenedores y empezar de cero
```bash
docker-compose down -v  # ⚠️ CUIDADO: Esto elimina los volúmenes (datos)
docker-compose up -d --build
```

### Backup de emergencia antes de hacer cambios
```bash
./scripts/backup-db.sh
docker-compose down
# Ahora puedes hacer cambios
```

---

## 📊 Información del Sistema

### Ver información del servidor
```bash
uname -a           # Información del sistema
free -h            # Memoria RAM
df -h              # Espacio en disco
htop              # Monitor de procesos (si está instalado)
```

### Ver puertos abiertos
```bash
sudo netstat -tulpn
```

### Ver reglas del firewall
```bash
sudo ufw status verbose
```

---

## 🔐 Seguridad

### Ver intentos de login fallidos
```bash
sudo grep "Failed password" /var/log/auth.log
```

### Ver conexiones activas
```bash
sudo netstat -anp | grep ESTABLISHED
```

### Ver quién está conectado por SSH
```bash
who
```

---

## 📦 Backups Automáticos

### Configurar backup diario (2 AM)
```bash
crontab -e
# Añadir:
0 2 * * * /home/usuario/apps/educanax/scripts/backup-db.sh
```

### Ver tareas de cron configuradas
```bash
crontab -l
```

### Ver logs de cron
```bash
sudo tail -f /var/log/syslog | grep CRON
```

---

## 🎯 Cheat Sheet de Un Vistazo

| Acción | Comando |
|--------|---------|
| Iniciar todo | `docker-compose up -d` |
| Detener todo | `docker-compose down` |
| Ver logs | `docker-compose logs -f app` |
| Reiniciar app | `docker-compose restart app` |
| Backup BD | `./scripts/backup-db.sh` |
| Actualizar código | `./scripts/update.sh` |
| SSL renovar | `docker-compose run --rm certbot renew` |
| Prisma Studio | `docker-compose exec app npx prisma studio` |
| Estado servicios | `docker-compose ps` |
| Ver recursos | `docker stats` |

---

**💡 Tip:** Guarda este archivo en tus marcadores para acceso rápido.

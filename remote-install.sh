#!/bin/bash

# Script de instalación remota para Educanax
# Este script se ejecuta EN EL SERVIDOR

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/educanax"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Deployment de Educanax - Servidor${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# PASO 1: Actualizar sistema
echo -e "${BLUE}[1/11] Actualizando sistema...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt update -qq
echo -e "${GREEN}✓ Sistema actualizado${NC}"
echo ""

# PASO 2: Instalar Docker
echo -e "${BLUE}[2/11] Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}→ Instalando Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✓ Docker instalado${NC}"
else
    echo -e "${GREEN}✓ Docker ya está instalado${NC}"
fi
echo ""

# PASO 3: Instalar Docker Compose
echo -e "${BLUE}[3/11] Verificando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}→ Instalando Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose instalado${NC}"
else
    echo -e "${GREEN}✓ Docker Compose ya está instalado${NC}"
fi
echo ""

# PASO 4: Instalar Git
echo -e "${BLUE}[4/11] Verificando Git...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}→ Instalando Git...${NC}"
    apt install -y git
    echo -e "${GREEN}✓ Git instalado${NC}"
else
    echo -e "${GREEN}✓ Git ya está instalado${NC}"
fi
echo ""

# PASO 5: Instalar Nginx
echo -e "${BLUE}[5/11] Verificando Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}→ Instalando Nginx...${NC}"
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}✓ Nginx instalado${NC}"
else
    echo -e "${GREEN}✓ Nginx ya está instalado${NC}"
fi
echo ""

# PASO 6: Clonar repositorio
echo -e "${BLUE}[6/11] Clonando repositorio...${NC}"
mkdir -p /var/www

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}→ Directorio existe, eliminando y clonando de nuevo...${NC}"
    rm -rf $PROJECT_DIR
fi

cd /var/www
git clone https://github.com/eltaxo/educanax.git
echo -e "${GREEN}✓ Repositorio clonado${NC}"
echo ""

# PASO 7: Generar configuración
echo -e "${BLUE}[7/11] Generando configuración...${NC}"
SECRET=$(openssl rand -base64 32)
DB_PASSWORD="educanax_$(openssl rand -hex 12)"

cat > $PROJECT_DIR/.env << ENVEOF
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@postgres:5432/educanax"
DB_PASSWORD="${DB_PASSWORD}"
NEXTAUTH_SECRET="${SECRET}"
NEXTAUTH_URL="https://educanax.eltaxo.com"
NEXT_PUBLIC_PORTAL_URL="https://educanax.eltaxo.com"
NODE_ENV="production"
ENVEOF

echo -e "${GREEN}✓ Configuración generada${NC}"
echo -e "${YELLOW}Password de BD guardado en: /root/educanax-db-password.txt${NC}"
echo "$DB_PASSWORD" > /root/educanax-db-password.txt
chmod 600 /root/educanax-db-password.txt
echo ""

# PASO 8: Desplegar con Docker
echo -e "${BLUE}[8/11] Desplegando con Docker...${NC}"
cd $PROJECT_DIR

# Detener contenedores existentes
docker-compose down 2>/dev/null || true

# Construir
echo -e "${YELLOW}→ Construyendo imágenes (esto puede tardar varios minutos)...${NC}"
docker-compose build --no-cache

# Iniciar
echo -e "${YELLOW}→ Iniciando servicios...${NC}"
docker-compose up -d

# Esperar a que inicien
echo -e "${YELLOW}→ Esperando a que los servicios estén listos...${NC}"
sleep 20

# Verificar
docker-compose ps
echo -e "${GREEN}✓ Servicios desplegados${NC}"
echo ""

# PASO 9: Configurar Nginx (HTTP temporal)
echo -e "${BLUE}[9/11] Configurando Nginx (HTTP temporal)...${NC}"

# Crear directorio para certbot
mkdir -p /var/www/certbot

# Copiar configuración HTTP temporal
cp $PROJECT_DIR/nginx-server-config/educanax-http.conf /etc/nginx/sites-available/educanax.conf

# Crear symlink
ln -sf /etc/nginx/sites-available/educanax.conf /etc/nginx/sites-enabled/educanax.conf

# Verificar configuración
nginx -t

# Recargar
systemctl reload nginx

echo -e "${GREEN}✓ Nginx configurado (HTTP)${NC}"
echo ""

# PASO 10: Instalar Certbot
echo -e "${BLUE}[10/11] Instalando Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓ Certbot instalado${NC}"
else
    echo -e "${GREEN}✓ Certbot ya está instalado${NC}"
fi
echo ""

# PASO 11: Obtener SSL y configurar HTTPS
echo -e "${BLUE}[11/11] Obteniendo certificado SSL...${NC}"
if certbot certonly --nginx -d educanax.eltaxo.com --non-interactive --agree-tos --register-unsafely-without-email; then
    echo -e "${GREEN}✓ Certificado SSL obtenido${NC}"

    # Ahora copiar la configuración completa con HTTPS
    echo -e "${YELLOW}→ Activando configuración HTTPS...${NC}"
    cp $PROJECT_DIR/nginx-server-config/educanax.conf /etc/nginx/sites-available/educanax.conf

    # Verificar y recargar
    if nginx -t; then
        systemctl reload nginx
        echo -e "${GREEN}✓ HTTPS activado${NC}"
    else
        echo -e "${RED}✗ Error en configuración HTTPS, manteniendo HTTP${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No se pudo obtener SSL automáticamente${NC}"
    echo -e "${YELLOW}La aplicación funciona en HTTP: http://educanax.eltaxo.com${NC}"
fi
echo ""

# BONUS: Crear usuario admin
echo -e "${BLUE}[BONUS] Creando usuario administrador...${NC}"
cd $PROJECT_DIR
docker-compose exec -T app node prisma/seed-simple.js || {
    echo -e "${YELLOW}⚠ No se pudo crear usuario automáticamente${NC}"
    echo -e "${YELLOW}Ejecuta manualmente: docker-compose exec app node prisma/seed-simple.js${NC}"
}
echo ""

# Resumen final
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETADO!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🌐 URL: https://educanax.eltaxo.com${NC}"
echo ""
echo -e "${GREEN}👤 Credenciales:${NC}"
echo -e "   Email: ${BLUE}admin@educanax.com${NC}"
echo -e "   Password: ${BLUE}admin123${NC}"
echo -e "   ${YELLOW}⚠ CAMBIA LA CONTRASEÑA${NC}"
echo ""
echo -e "${GREEN}🔐 Password de BD guardado en:${NC}"
echo -e "   ${BLUE}/root/educanax-db-password.txt${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"

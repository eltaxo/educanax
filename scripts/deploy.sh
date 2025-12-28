#!/bin/bash

# Script de deployment para Educanax
# Este script facilita el despliegue de la aplicación

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Deployment de Educanax${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encuentra package.json. Asegúrate de estar en el directorio del proyecto.${NC}"
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: No se encuentra el archivo .env${NC}"
    echo -e "${YELLOW}Copia .env.production a .env y configura tus variables${NC}"
    exit 1
fi

# Detectar si hay Nginx principal en el servidor
COMPOSE_FILE="docker-compose.yml"
if systemctl is-active --quiet nginx 2>/dev/null && sudo lsof -i :80 | grep -q nginx; then
    echo -e "${GREEN}✓ Nginx principal detectado en el servidor${NC}"
    echo -e "${YELLOW}→ Usando configuración con puerto 3100${NC}"
    COMPOSE_FILE="docker-compose.yml"
    NGINX_MODE="proxy"
else
    echo -e "${YELLOW}! No se detectó Nginx principal${NC}"
    echo -e "${YELLOW}→ ¿Quieres usar Nginx integrado en Docker? (y/n)${NC}"
    read -p "Respuesta: " USE_STANDALONE

    if [ "$USE_STANDALONE" = "y" ] || [ "$USE_STANDALONE" = "Y" ]; then
        COMPOSE_FILE="docker-compose.standalone.yml"
        NGINX_MODE="standalone"
        echo -e "${GREEN}→ Usando configuración standalone (con Nginx integrado)${NC}"
    else
        COMPOSE_FILE="docker-compose.yml"
        NGINX_MODE="proxy"
        echo -e "${GREEN}→ Usando configuración estándar (puerto 3100)${NC}"
    fi
fi
echo ""

# Pull del código más reciente (si usas git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Actualizando código desde Git...${NC}"
    git pull
fi

# Detener contenedores existentes
echo -e "${YELLOW}🛑 Deteniendo contenedores existentes...${NC}"
docker-compose -f $COMPOSE_FILE down

# Construir imágenes
echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose -f $COMPOSE_FILE build --no-cache

# Iniciar servicios
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar estado
echo -e "${YELLOW}📊 Verificando estado de los servicios...${NC}"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo -e "${GREEN}✅ Deployment completado!${NC}"

if [ "$NGINX_MODE" = "proxy" ]; then
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANTE: Configurar Nginx principal${NC}"
    echo -e "La aplicación está corriendo en el puerto 3100"
    echo ""
    echo -e "Pasos siguientes:"
    echo -e "1. Copia la configuración de Nginx:"
    echo -e "   ${BLUE}sudo cp nginx-server-config/educanax.conf /etc/nginx/sites-available/${NC}"
    echo ""
    echo -e "2. Crea el symlink:"
    echo -e "   ${BLUE}sudo ln -s /etc/nginx/sites-available/educanax.conf /etc/nginx/sites-enabled/${NC}"
    echo ""
    echo -e "3. Verifica la configuración:"
    echo -e "   ${BLUE}sudo nginx -t${NC}"
    echo ""
    echo -e "4. Obtén certificado SSL:"
    echo -e "   ${BLUE}sudo certbot --nginx -d educanax.eltaxo.com${NC}"
    echo ""
    echo -e "5. Recarga Nginx:"
    echo -e "   ${BLUE}sudo systemctl reload nginx${NC}"
else
    echo -e "${GREEN}🌐 La aplicación debería estar disponible en: http://educanax.eltaxo.com${NC}"
    echo ""
    echo -e "${YELLOW}Para configurar SSL ejecuta: ./scripts/setup-ssl.sh${NC}"
fi

echo ""
echo -e "${YELLOW}Para ver los logs ejecuta: docker-compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

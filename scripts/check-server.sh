#!/bin/bash

# Script para verificar la configuración del servidor

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Verificación de Servidor - Educanax${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Verificar si Nginx está instalado
echo -e "${YELLOW}1. Verificando Nginx...${NC}"
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d '/' -f 2)
    echo -e "${GREEN}✓ Nginx instalado: $NGINX_VERSION${NC}"

    # Verificar si está corriendo
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓ Nginx está corriendo${NC}"
        NGINX_RUNNING=true
    else
        echo -e "${YELLOW}! Nginx instalado pero no está corriendo${NC}"
        NGINX_RUNNING=false
    fi
else
    echo -e "${RED}✗ Nginx NO está instalado${NC}"
    NGINX_RUNNING=false
fi
echo ""

# Verificar puertos 80 y 443
echo -e "${YELLOW}2. Verificando puertos 80 y 443...${NC}"
if sudo lsof -i :80 &> /dev/null; then
    PUERTO_80=$(sudo lsof -i :80 | grep LISTEN | awk '{print $1}' | head -1)
    echo -e "${YELLOW}! Puerto 80 en uso por: $PUERTO_80${NC}"
    PORT_80_USED=true
else
    echo -e "${GREEN}✓ Puerto 80 libre${NC}"
    PORT_80_USED=false
fi

if sudo lsof -i :443 &> /dev/null; then
    PUERTO_443=$(sudo lsof -i :443 | grep LISTEN | awk '{print $1}' | head -1)
    echo -e "${YELLOW}! Puerto 443 en uso por: $PUERTO_443${NC}"
    PORT_443_USED=true
else
    echo -e "${GREEN}✓ Puerto 443 libre${NC}"
    PORT_443_USED=false
fi
echo ""

# Verificar Docker
echo -e "${YELLOW}3. Verificando Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f 3 | tr -d ',')
    echo -e "${GREEN}✓ Docker instalado: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}✗ Docker NO está instalado${NC}"
fi
echo ""

# Verificar Docker Compose
echo -e "${YELLOW}4. Verificando Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f 4 | tr -d ',')
    echo -e "${GREEN}✓ Docker Compose instalado: $COMPOSE_VERSION${NC}"
else
    echo -e "${RED}✗ Docker Compose NO está instalado${NC}"
fi
echo ""

# Verificar sitios de Nginx
if [ "$NGINX_RUNNING" = true ]; then
    echo -e "${YELLOW}5. Verificando sitios de Nginx...${NC}"
    if [ -d "/etc/nginx/sites-enabled" ]; then
        NUM_SITES=$(ls -l /etc/nginx/sites-enabled/ | grep -v '^total' | wc -l)
        echo -e "${GREEN}✓ Sitios activos en Nginx: $NUM_SITES${NC}"
        ls -1 /etc/nginx/sites-enabled/ | grep -v default | while read site; do
            echo -e "  - $site"
        done
    fi
    echo ""
fi

# Verificar puerto 3100
echo -e "${YELLOW}6. Verificando puerto 3100 (para Educanax)...${NC}"
if sudo lsof -i :3100 &> /dev/null; then
    PUERTO_3100=$(sudo lsof -i :3100 | grep LISTEN | awk '{print $1}' | head -1)
    echo -e "${YELLOW}! Puerto 3100 en uso por: $PUERTO_3100${NC}"
else
    echo -e "${GREEN}✓ Puerto 3100 libre (perfecto para Educanax)${NC}"
fi
echo ""

# Recomendación
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  RECOMENDACIÓN${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ "$NGINX_RUNNING" = true ] && [ "$PORT_80_USED" = true ]; then
    echo -e "${GREEN}✓ Tu servidor tiene Nginx principal corriendo${NC}"
    echo ""
    echo -e "Usa esta configuración:"
    echo -e "${YELLOW}1. docker-compose.yml${NC} (ya configurado para puerto 3100)"
    echo -e "${YELLOW}2. Copia nginx-server-config/educanax.conf a /etc/nginx/sites-available/${NC}"
    echo -e "${YELLOW}3. Crea symlink: sudo ln -s /etc/nginx/sites-available/educanax.conf /etc/nginx/sites-enabled/${NC}"
    echo -e "${YELLOW}4. Obtén SSL con certbot${NC}"
    echo -e "${YELLOW}5. Reinicia Nginx: sudo systemctl reload nginx${NC}"
    echo ""
elif [ "$PORT_80_USED" = false ] && [ "$PORT_443_USED" = false ]; then
    echo -e "${GREEN}✓ Los puertos 80 y 443 están libres${NC}"
    echo ""
    echo -e "Usa esta configuración:"
    echo -e "${YELLOW}1. docker-compose.standalone.yml${NC} (incluye Nginx en Docker)"
    echo -e "${YELLOW}2. Comando: docker-compose -f docker-compose.standalone.yml up -d${NC}"
    echo ""
else
    echo -e "${RED}⚠ Configuración mixta detectada${NC}"
    echo -e "Contacta con soporte para configuración personalizada."
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"

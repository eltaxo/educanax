#!/bin/bash

# Script para configurar SSL con Let's Encrypt en Educanax

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔐 Configurando SSL para educanax.eltaxo.com...${NC}"

# Solicitar email
read -p "Introduce tu email para Let's Encrypt: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Error: El email es obligatorio${NC}"
    exit 1
fi

# Actualizar docker-compose.yml con el email
echo -e "${YELLOW}📝 Actualizando configuración de Certbot...${NC}"
sed -i.bak "s/tu-email@ejemplo.com/$EMAIL/g" docker-compose.yml

# Asegurarse de que nginx esté corriendo
echo -e "${YELLOW}🚀 Iniciando Nginx...${NC}"
docker-compose up -d nginx

# Ejecutar Certbot
echo -e "${YELLOW}📜 Solicitando certificado SSL...${NC}"
docker-compose run --rm certbot

# Verificar que se obtuvieron los certificados
if [ -d "nginx/ssl/live/educanax.eltaxo.com" ]; then
    echo -e "${GREEN}✅ Certificados obtenidos exitosamente!${NC}"

    # Actualizar nginx.conf para usar HTTPS
    echo -e "${YELLOW}🔧 Activando configuración HTTPS en Nginx...${NC}"
    echo -e "${YELLOW}Por favor, edita manualmente nginx/nginx.conf:${NC}"
    echo -e "1. En el server HTTP (puerto 80), descomenta: return 301 https://\$server_name\$request_uri;"
    echo -e "2. Descomenta todo el bloque server HTTPS (puerto 443)"
    echo ""
    read -p "Presiona Enter cuando hayas editado nginx.conf..."

    # Recargar Nginx
    echo -e "${YELLOW}🔄 Recargando Nginx...${NC}"
    docker-compose restart nginx

    echo -e "${GREEN}✅ SSL configurado correctamente!${NC}"
    echo -e "${GREEN}🌐 Tu sitio ahora está disponible en: https://educanax.eltaxo.com${NC}"

    # Configurar renovación automática
    echo -e "${YELLOW}📅 Configurando renovación automática de certificados...${NC}"
    echo "0 0 * * 0 cd $(pwd) && docker-compose run --rm certbot renew && docker-compose restart nginx" | crontab -
    echo -e "${GREEN}✅ Renovación automática configurada (se ejecutará semanalmente)${NC}"
else
    echo -e "${RED}❌ Error: No se pudieron obtener los certificados SSL${NC}"
    echo -e "${YELLOW}Verifica que:${NC}"
    echo "1. El dominio educanax.eltaxo.com apunta a este servidor"
    echo "2. Los puertos 80 y 443 están abiertos"
    echo "3. No hay otro servicio usando estos puertos"
    exit 1
fi

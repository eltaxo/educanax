#!/bin/bash

# Script de deployment para Educanax
# Este script facilita el despliegue de la aplicación

set -e

echo "🚀 Iniciando deployment de Educanax..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Pull del código más reciente (si usas git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Actualizando código desde Git...${NC}"
    git pull
fi

# Detener contenedores existentes
echo -e "${YELLOW}🛑 Deteniendo contenedores existentes...${NC}"
docker-compose down

# Construir imágenes
echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose build --no-cache

# Iniciar servicios
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker-compose up -d

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar estado
echo -e "${YELLOW}📊 Verificando estado de los servicios...${NC}"
docker-compose ps

echo -e "${GREEN}✅ Deployment completado!${NC}"
echo -e "${GREEN}🌐 La aplicación debería estar disponible en: http://educanax.eltaxo.com${NC}"
echo ""
echo -e "${YELLOW}Para ver los logs ejecuta: docker-compose logs -f${NC}"

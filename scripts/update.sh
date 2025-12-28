#!/bin/bash

# Script para actualizar Educanax desde Git

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Actualizando Educanax...${NC}"

# Hacer backup antes de actualizar
echo -e "${YELLOW}💾 Creando backup de seguridad...${NC}"
./scripts/backup-db.sh

# Actualizar código desde Git
echo -e "${YELLOW}📥 Descargando últimos cambios...${NC}"
git pull

# Rebuild y restart
echo -e "${YELLOW}🔨 Reconstruyendo aplicación...${NC}"
docker-compose build --no-cache app

echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
docker-compose up -d

echo -e "${GREEN}✅ Actualización completada!${NC}"
echo -e "${YELLOW}Para ver los logs: docker-compose logs -f app${NC}"

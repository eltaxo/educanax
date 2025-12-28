#!/bin/bash

# Script para hacer backup de la base de datos de Educanax

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Crear directorio de backups si no existe
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# Nombre del archivo de backup con fecha
BACKUP_FILE="$BACKUP_DIR/educanax_backup_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${YELLOW}💾 Creando backup de la base de datos...${NC}"

# Ejecutar pg_dump dentro del contenedor de PostgreSQL
docker exec educanax-postgres pg_dump -U postgres educanax > $BACKUP_FILE

# Comprimir el backup
gzip $BACKUP_FILE

echo -e "${GREEN}✅ Backup creado exitosamente: ${BACKUP_FILE}.gz${NC}"

# Limpiar backups antiguos (mantener solo los últimos 7 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
echo -e "${GREEN}🧹 Backups antiguos eliminados (se mantienen los últimos 7 días)${NC}"

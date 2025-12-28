# Dockerfile para Educanax (Next.js)
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
# Agregar dependencias necesarias incluyendo OpenSSL para Prisma
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Construir Next.js con DATABASE_URL placeholder
# Esto creará el build optimizado para producción
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/placeholder"
RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
# Instalar OpenSSL para runtime de Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde el builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# Multi-stage production build for LiveBillboards Express + Vite runtime
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies including dev tools needed for compilation
RUN npm ci

# Copy project files
COPY . .

# Build Vite SPA and bundle server.ts -> dist/server.cjs
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy dependency manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.cjs"]

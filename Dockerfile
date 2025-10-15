# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/graphql/schema.graphql ./dist/graphql/schema.graphql

EXPOSE 4000
CMD ["node", "dist/app.js"]   # 👈 compiled entrypoint
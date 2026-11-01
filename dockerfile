
# Stage 1: Build React frontend
FROM node:24-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build


# Stage 2: Build Express backend
FROM node:24-alpine AS server-build

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Stage 3: Production image
FROM node:24-alpine AS production

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=8000

# Backend package files
COPY --from=server-build /app/server/package*.json ./

# Production dependencies
COPY --from=server-build /app/server/node_modules ./node_modules

# Compiled backend
COPY --from=server-build /app/server/dist ./dist

# Built React frontend
COPY --from=client-build /app/server/public ./public

EXPOSE 8000

CMD ["node", "dist/server.js"]

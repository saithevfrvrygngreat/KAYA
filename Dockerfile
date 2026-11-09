# ==========================================================
# STAGE 1: Build Vite + React Frontend
# ==========================================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/Frontend

# Copy dependency specifications
COPY Frontend/package*.json ./

# Install frontend dependencies cleanly
RUN npm ci

# Copy frontend source files
COPY Frontend/ ./

# Compile production React bundle to /app/Frontend/dist
RUN npm run build


# ==========================================================
# STAGE 2: Production Express Backend & Asset Server
# ==========================================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy backend dependency specifications
COPY Backend/package*.json ./Backend/

# Install only production backend dependencies
RUN cd Backend && npm ci --omit=dev

# Copy backend source code
COPY Backend/ ./Backend/

# Copy compiled frontend from builder stage
COPY --from=frontend-build /app/Frontend/dist ./Frontend/dist

# Render assigns and exposes PORT dynamically (defaults to 10000)
EXPOSE 10000

# Working directory for running Express
WORKDIR /app/Backend

# Start production server
CMD ["node", "server.js"]

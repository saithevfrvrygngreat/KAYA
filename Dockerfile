# ==========================================================
# STAGE 1: Build Vite + React Frontend
# ==========================================================
FROM node:20-slim AS frontend-build

WORKDIR /app/Frontend

# Copy frontend dependency specifications
COPY Frontend/package*.json ./

# Install frontend dependencies cleanly
RUN npm ci

# Copy frontend source files
COPY Frontend/ ./

# Compile production React bundle to /app/Frontend/dist
RUN npm run build


# ==========================================================
# STAGE 2: Production Python / Django Backend & Asset Server
# ==========================================================
FROM python:3.12-slim AS production

# Install system dependencies (certificates, sqlite, build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gcc \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=10000

# Copy Python requirements and install
COPY Backend/requirements.txt ./Backend/
RUN pip install --no-cache-dir -r ./Backend/requirements.txt

# Copy Backend source code and initial SQLite database
COPY Backend/ ./Backend/

# Copy compiled frontend from builder stage
COPY --from=frontend-build /app/Frontend/dist ./Frontend/dist

# Ensure entrypoint is executable
RUN chmod +x ./Backend/entrypoint.sh

# Render assigns and exposes PORT dynamically
EXPOSE 10000

# Set working directory to Backend
WORKDIR /app/Backend

# Run entrypoint script
CMD ["./entrypoint.sh"]

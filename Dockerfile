# Little Fuck - single service: the backend serves the built frontend and the game socket.
FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better layer caching; lockfiles make this reproducible)
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd backend && npm ci --ignore-scripts
RUN cd frontend && npm ci --ignore-scripts

# Build the backend (TypeScript) and the frontend (static files served by the backend)
COPY . .
RUN cd backend && npm run build
RUN cd frontend && npm run build-only

WORKDIR /app/backend

ENV NODE_ENV=production
EXPOSE 3000

# Render (and most hosts) inject PORT; the backend already listens on process.env.PORT.
CMD ["node", "dist/index.js"]

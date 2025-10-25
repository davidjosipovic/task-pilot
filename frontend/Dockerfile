# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (includes serve)
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy server script
COPY server.cjs ./

# Expose port (Railway will provide PORT env var)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000), (r) => {if(r.statusCode === 200) process.exit(0); process.exit(1);})"

# Start server
CMD ["node", "server.cjs"]

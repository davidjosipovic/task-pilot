FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy TypeScript config and source
COPY tsconfig.json ./
COPY src ./src

# Expose port
EXPOSE 4000

# Start application with ts-node
CMD ["npx", "ts-node", "src/index.ts"]

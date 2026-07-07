FROM node:20

WORKDIR /app

# Copy workspace package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/ai-chat-widget/package*.json ./packages/ai-chat-widget/

# Install all workspace dependencies
RUN npm install

# Copy source code
COPY . .

# Rebuild native module for Linux
RUN npm rebuild lightningcss

# Build the frontend workspace
RUN npm run build --workspace=frontend

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start", "--workspace=frontend"]
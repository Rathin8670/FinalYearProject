FROM node:20

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/ai-chat-widget/package*.json ./packages/ai-chat-widget/

RUN npm install

COPY . .

RUN npm rebuild lightningcss

RUN npm run build --workspace=frontend

EXPOSE 3000

CMD ["npm","run","start","--workspace=frontend"]
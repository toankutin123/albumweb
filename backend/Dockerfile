FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build 2>/dev/null || true

EXPOSE 5000

CMD ["sh", "-c", "npx sequelize-cli db:migrate && npx sequelize-cli db:seed:undo:all && npx sequelize-cli db:seed:all && node server.js"]

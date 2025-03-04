FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

ENV WATCH_PATH=/config/workspace
ENV STORAGE_PATH=./diffs

CMD ["npm", "start"]
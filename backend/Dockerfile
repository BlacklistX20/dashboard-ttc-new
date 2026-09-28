FROM node:24-alpine

RUN apk add --no-cache tzdata

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]
FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install mysql

COPY . .

EXPOSE 80

CMD [ "node", "app.js" ]

FROM node:8.1.2

ADD . /usr/src/app/server

WORKDIR /usr/src/app/server

RUN npm install

RUN npm install --save replace-in-file

EXPOSE 8000


CMD NODE_ENV=production npm start

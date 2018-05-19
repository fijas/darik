FROM node:8.6-slim

WORKDIR /usr/src

ENV PATH /usr/src/node_modules/.bin:$PATH

ADD package.json /usr/src/package.json
RUN npm install

CMD ["nodemon"]

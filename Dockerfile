FROM node:14

WORKDIR /usr/src/test
COPY package.json /usr/src/test/

RUN npm install

COPY index.test.js /usr/src/test/
COPY ./wait-for-it.sh /usr/src/test/wait-for-it.sh
CMD ["npm", "test"]
FROM mhart/alpine-node 

WORKDIR /usr/src/test
COPY package.json /usr/src/test/
COPY package-lock.json /usr/src/test/

RUN npm install

COPY index.test.js /usr/src/test/

CMD ["npm", "test"]

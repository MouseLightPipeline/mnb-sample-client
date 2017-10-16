FROM node:7.10

WORKDIR /app

RUN npm install -g yarn typescript@2.3.4

COPY . .

RUN yarn install

RUN tsc

CMD ["npm", "run", "start"]

EXPOSE  9673

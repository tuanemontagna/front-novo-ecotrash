FROM node:20 

COPY ./package.json ./
COPY ./next.config.mjs ./
COPY ./src ./src
COPY ./public ./public
COPY ./postcss.config.mjs ./
COPY ./jsconfig.json ./

RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
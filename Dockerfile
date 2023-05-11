FROM node:18
WORKDIR /srv/
COPY package.json ./
RUN npm install
COPY ./ ./
CMD ["npm", "start"]
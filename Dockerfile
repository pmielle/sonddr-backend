FROM node:18
WORKDIR /srv/
COPY package.json ./
RUN npm install
COPY ./ ./
EXPOSE 3000
CMD ["npm", "start"]

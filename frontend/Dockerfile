FROM node:18-alpine

WORKDIR /app
ENV NG_CLI_ANALYTICS=false

COPY package*.json ./
RUN npm install

# The source code is bind-mounted by docker-compose, so it is not copied into the image.
EXPOSE 4200
CMD ["npm", "start"]

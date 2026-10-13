FROM node:18-alpine

RUN npm install -g json-server@0.17.4

# db.json is bind-mounted here by docker-compose so changes persist on the host.
WORKDIR /data

EXPOSE 3000
CMD ["json-server", "--watch", "db.json", "--host", "0.0.0.0", "--port", "3000"]

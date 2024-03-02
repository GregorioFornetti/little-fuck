FROM node:18-alpine
ARG server_path
ARG vite_server_path
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY . .
WORKDIR /home/node/app/backend
RUN npm install
RUN npm run build
WORKDIR /home/node/app/frontend
ENV SERVER_PATH $server_path
ENV VITE_SERVER_PATH $vite_server_path
RUN npm install
RUN npm run build
COPY --chown=node:node . .
EXPOSE 3000
CMD [ "node", "app.js" ]
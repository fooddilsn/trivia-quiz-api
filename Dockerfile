FROM node:16.13-alpine as dependencies
COPY package*.json ./
RUN npm set-script prepare ""
RUN npm ci --only=production

FROM node:16.13-alpine as builder
COPY package*.json ./
RUN npm set-script prepare ""
RUN npm ci
COPY src src
COPY tsconfig*.json ./
COPY nest-cli.json .
RUN npm run build

FROM node:16.13-alpine as app
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --from=builder --chown=node:node dist dist
COPY --from=dependencies --chown=node:node node_modules node_modules
COPY --from=builder --chown=node:node package.json .
USER node
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]

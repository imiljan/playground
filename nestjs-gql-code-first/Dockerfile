FROM node:12.18 AS development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci
COPY . .
EXPOSE 3000

#RUN npm run build
# Development stage is used for development, no need to run build
# Uncoment when building image for pord

FROM node:12.18-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci --only=production
COPY --chown=node:node . .
COPY --from=development --chown=node:node /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

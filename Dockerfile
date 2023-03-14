FROM ${ARCH}node:lts-alpine
LABEL maintainer="Ronan <ronan.le_meillat@ismo-group.co.uk>"
WORKDIR /usr/src/app
COPY package*.json ./
COPY src src/
RUN  npm ci && npm run build
EXPOSE 3000
CMD [ "node", "dist/index.cjs" ]
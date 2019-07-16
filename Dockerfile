FROM node:10-alpine

ENV INSTALL_PATH /app

WORKDIR $INSTALL_PATH

COPY package.json yarn.lock /tmp/
RUN cd /tmp && yarn install --frozen-lockfile --ignore-optional \
  && mkdir -p $INSTALL_PATH \
  && cd $INSTALL_PATH \
  && cp -R /tmp/node_modules $INSTALL_PATH \
  && rm -rf /tmp/*
COPY . .
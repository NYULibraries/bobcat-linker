FROM node:6.10.3

ENV INSTALL_PATH /app

WORKDIR $INSTALL_PATH

COPY . ./
COPY package.json yarn.lock /tmp/
RUN cd /tmp && yarn
RUN mkdir -p $INSTALL_PATH && cd $INSTALL_PATH && cp -R /tmp/node_modules $INSTALL_PATH

WORKDIR $INSTALL_PATH

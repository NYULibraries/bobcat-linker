FROM node:8.10-alpine

ENV INSTALL_PATH /app

WORKDIR $INSTALL_PATH

# install node modules
COPY package.json yarn.lock /tmp/
RUN cd /tmp && yarn --frozen-lockfile
RUN mkdir -p $INSTALL_PATH && cd $INSTALL_PATH && cp -R /tmp/node_modules $INSTALL_PATH

# copy source code
COPY . .

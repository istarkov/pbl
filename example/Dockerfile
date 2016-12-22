# build
# docker build -t node-test .
# run interactive
# docker run -it --rm -p 4000:4000 --name test-node 'node-test'

FROM node:6.9.2-alpine

RUN apk add --update openssl python build-base

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.1.2/dumb-init_1.1.2_amd64
RUN chmod +x /usr/local/bin/dumb-init

EXPOSE 4000

WORKDIR /app

RUN npm install --loglevel error --global yarn pty64

ADD . ./

RUN \
cd server && yarn && cd .. && yarn && \
pty64 -- yarn run lint && \
pty64 -- yarn run build && \
rm -rf ./node_modules && \
yarn cache clean && \
npm remove --global yarn pty64 && \
rm -rf /tmp/* /root/.npm /root/.node-gyp /root/.gnupg

CMD /usr/local/bin/dumb-init -- node ./server/index.js

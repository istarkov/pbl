# build
# docker build -t node-test .
# run interactive
# docker run -it --rm -p3000:3000 --name test-node -v "$PWD":/app -w /app 'node-test' /usr/local/bin/dumb-init -- node index.js
# docker run -it --rm -p 4000:4000 --name test-node 'node-test'

FROM node:6.9.2-alpine

RUN apk add --update openssl python build-base

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.1.2/dumb-init_1.1.2_amd64
RUN chmod +x /usr/local/bin/dumb-init

EXPOSE 4000

WORKDIR /app

ADD package.json ./
ADD yarn.lock ./

RUN npm install --loglevel error --global yarn pty64

RUN yarn

ADD . ./

# Use pty64 to add pseudotty
RUN pty64 -- yarn run lint

# ARG HELLO # example of args usage just run "pbl --build-arg HELLO=WORLD"
RUN pty64 -- yarn run build

CMD /usr/local/bin/dumb-init -- node ./index.js

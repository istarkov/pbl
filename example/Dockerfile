# build
# docker build -t node-test .
# run interactive
# docker run -it --rm -p3000:3000 --name test-node -v "$PWD":/app -w /app 'node-test' /usr/local/bin/dumb-init -- node index.js
# docker run -it --rm -p 3000:3000 -p 4000:4000 --name test-node 'node-test'

FROM node:6.9.2-wheezy

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.1.2/dumb-init_1.1.2_amd64
RUN chmod +x /usr/local/bin/dumb-init

RUN apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -y locales

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
   locale-gen en_US.UTF-8 && \
   DEBIAN_FRONTEND=noninteractive dpkg-reconfigure locales && \
   /usr/sbin/update-locale LANG=en_US.UTF-8
ENV LC_ALL en_US.UTF-8

EXPOSE 4000

WORKDIR /app

ADD package.json ./
ADD yarn.lock ./

RUN npm install --loglevel error --global yarn

RUN yarn

ADD . ./

# Use pty64 to add pseudotty
RUN `yarn bin`/pty64 -- yarn run lint

# ARG HELLO # example of args usage just run "pbl --build-arg HELLO=WORLD"
RUN `yarn bin`/pty64 -- yarn run build

CMD /usr/local/bin/dumb-init -- node ./index.js

# pbls

Server part of pbl deployment tool. You need to install it on the server.

# Install

```bash
npm install --global pbls
```

To work with you need to init pbls with domain name.

```bash
pbls init --domain {your domain}
# example: pbls init --domain localhost
```

# Work

`pbls` is considered to work with `pbl` tool, for now it run command `run` but not intended do that
`pbls` supports args `name`, `dockerFile` and `dir` for now
* `dir` is required and is a path of build folder
* `dockerFile` name of Dockerfile, default `Dockerfile`
* `name` name of running container, will be available at `${name}.${domain}`, if not set equal to
random, and will be provided to user
* any additional arguments will be provided as is to `docker build` command, so you can pass
`--build-arg` and other params

examples:

```bash
pbls run --name hello --dir ../../example --build-arg HELLO=WORLD
# or without name
pbls run --dir ../../example --build-arg HELLO=WORLD
# or in attached mode
pbls run --attached true --dir ../../example --build-arg HELLO=WORLD
```

# Additional

You can execute any process as a web-socket server with terminal,
as an example `docker stats` command. (to make it work you need to run once `pbls init`)

```bash
npm install --global pty64
pty64 --base64 -- docker stats | docker run -a STDIN -a STDOUT -i --rm -e VIRTUAL_HOST="stats.${YOUR_DOMAIN}" --name stats 'stdind' ./index.js --realtime
```

# Clear:

```bash
docker rmi -f $(docker images --filter "label=pbl" -q)
```

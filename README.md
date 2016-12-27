# pbl

`pbl` gives users the ability to make fast and easy deployment of their Docker powered applications and services onto their server.
Any directory that contains a Dockerfile can be deployed with just one command: `pbl`.

Every time a user deploys a project, `pbl` (by default), will immediately
provide a new unique URL.
While the build process runs, a full-featured, view-only terminal with all the build
process output will be available at the provided URL.

If the build process is successful, the app itself will become available at the same URL, otherwise the terminal with the build process output and error(s) will remain available.

## Client install

### Prerequisites

To make pbl work, nodejs needs to be installed on the client machine.

### Install

```bash
npm install -g pbl
pbl init --identity {SSH-IDENTITY-FILE-PATH} --server {USER@YOUR-SERVER-HOST-OR-IP}
# example: pbl init --identity ~/.ssh/mykey.pem --server ubuntu@ui.revue.io
```

PS: For node projects, there is no need to setup `pbl` globally,
and it can be installed into devDependencies of a project.

## Server install

### Prerequisites

Docker + Node LTS + build-essential (make) + python,
you need to own domain name (or just use `/etc/hosts`),
and have a DNS record for third (in some cases fourth) level pointing to your server.

I highly recommend you to use overlay2 for docker storage driver, because of this issue
https://github.com/docker/docker/issues/10613

### Install

```bash
npm install -g pbls
pbls init --domain {YOUR DOMAIN}
# example: pbls init --domain ui.revue.io
# as I want to publish all content under fourth level domain
```

## Usage Example

Clone current project.

Open `example` dir and run `pbl`, project will be published at `{rnd}.{YOUR DOMAIN}` host.

Run `pbl --name hello` then the project will be published at `hello.{YOUR DOMAIN}` host.

To use dockerfile with other name than `Dockerfile` just run as `pbl --dockerFile ./DockerfileOther`

By default `pbl` runs deploys in detached mode, and exits almost immediately after running,
but sometimes if you need more control you can run `pbl` in `attached` mode,
just add `--attached true`

To pass ARGs to Docker build, just append `--build-arg` like
`pbl --name hello --build-arg PARAM=LALA`

## Server cleanup

As most of the time all these containers are no longer needed after a few days, just add the following command into `cron`:

```bash
pbls clean --days {X}
```

This command will stop all containers that were started before `current date` - `{X}` days, and will also clean all exited containers.

For full cleanup run:

```bash
pbls clean --days 0
```

## Contribute

To use locally:

* `npm install`

* add `127.0.0.1  *.localhost` to `/etc/hosts`,

* initialize `pbls` by running it directly as `./packages/pbls/index.js init --domain localhost`

* then `cd` `example` or any Dockerfile folder and run local pbl in dev mode like `../packages/pbl/index.js --mode dev`

## TODO

Add running server output log to some path like `http://{NAME}.{YOUR DOMAIN}/logs`

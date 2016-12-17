# pbl

`pbl` allows you to make fast and easy deployment of your Docker powered applications and services.
Any directory that contains a Dockerfile can be deployed with one command: `pbl`.

Every time you deploy a project, `pbl` (by default) will provide you immediately with a new unique URL.
Until build process will be finished, full-featured view-only terminal with all the build process output
will be available at provided URL.

If build process was finished successfully the app itself will be available at same URL,
otherwise terminal with build process output and error will be available.

## Client install

### Prerequisites

To make it work you need to have nodejs installed on the client machine.

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

### Install

```bash
npm install -g pbls
pbls init --domain {YOUR DOMAIN}
# example: pbls init --domain ui.revue.io
# as I want to publish all content under fourth level domain
```

# Usage Example

Clone current project.

Open `example` dir and run `pbl`, project will be published at `{rnd}.{YOUR DOMAIN}` host.

Run `pbl --name hello` then project will be published at `hello.{YOUR DOMAIN}` host.

By default `pbl` runs deploy in detached mode, and exits almost immediately after run,
but sometimes if you need more control you can run `pbl` in `attached` mode,
just add `--attached true`

To pass ARGs to Docker build, just append them as an example `build-arg`.
`pbl --name hello --build-arg PARAM=LALA`

## Server cleanup

As mostly all this containers does not needed after few days, just add command into `cron`

```bash
pbls clean --days {X}
```

This command will stop all the containers before `current date` - `{X}` days,
and also will clean all exited containers.

For full cleanup run:

```bash
pbls clean --days 0
```

# NOT DONE (yet)

Add running server output log to some path like `http://{NAME}.{YOUR DOMAIN}/logs`

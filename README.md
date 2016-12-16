# pbl

`pbl` allows you to make fast and easy deployment of your Docker powered applications and services. Any directory that contains a Dockerfile can be deployed with one command: `pbl`.

Every time you deploy a project, `pbl` (by default) will provide you immediately with a new unique URL. Until build process will be finished,
full-featured view-only terminal with all the build process output will be available at provided URL.

If build process was finished successfully the app itself will be available at same URL, otherwise terminal with build process output will be available.

## Client install

### Prerequisites

To make it work you need to have nodejs installed on the client machine.

### Install

```
npm install -g pbl
pbl init --identity {SSH-IDENTITY-FILE-PATH} --server {YOUR-SERVER-HOST-OR-IP}
```

PS: For node projects, there is no need to setup `pbl` globally,
and it can be installed into devDependencies of a project.

## Server install

### Prerequisites

Docker + Node LTS + build-essential (make) + python

### Install

```
npm install -g pbls
pbls init --domain {YOUR DOMAIN}
```

# Usage Example

Clone current project.

Open `example` dir and run `pbl`, project will be published at {rnd}.{YOUR DOMAIN} host.

Run `pbl --name hello` then project will be published at hello.{YOUR DOMAIN} host.

By default `pbl` runs deploy in detached mode, and exits almost immediately after run,
but sometimes if you need more control you can run `pbl` in `attached` mode,
just add `--attached true`

To pass ARGs to Docker build, just append them as an example `build-arg`.
`pbl --name hello --build-arg PARAM=LALA`

# SERVER CLEANUP

Not done yiet, BTW

Clear all intermediate images:

`docker rmi $(docker images | grep "^<none>" | awk "{print $3}")`

Clear all containers

`docker rm -f $(docker ps -a -q)`

Then run `pbls init`

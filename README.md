# pbl

`pbl` allows you to make fast and easy deployment of your Docker powered applications and services.

Any directory that contains a Dockerfile can be deployed with one command: `pbl`.

Every time you deploy a project, pbl (by default) will provide you immediately with a new unique URL.

Until BUILD process will be finished,
full-featured view-only terminal with all the build process output will be available at provided URL.

And the app itself after build will be completed.


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

# Server install

### Prerequisites

Docker + Node LTS + build-essential (make) + python

### Install

```
npm install -g pbls
pbls init --domain {YOUR DOMAIN}
```

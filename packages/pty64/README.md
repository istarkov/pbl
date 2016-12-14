# pty64

A simple command line utility based on [pty.js](https://github.com/chjj/pty.js/).

It allows you to fork processes with pseudo terminal file descriptors, for example to run commands
in non interactive envs.
So certain programs will think that it works inside terminal.

It also allows you to transform output of terminal control sequences into base64 format.

## Install

```bash
npm install --global pty64
```

## Usage example

```bash
# run any command with pty
pty64 -- {any command}
# transform output into base64
pty64 --base64 -- {any command}
```

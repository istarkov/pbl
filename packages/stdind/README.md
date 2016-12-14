# stdind

Wraps stdin and allow it to be accessed via a WebSocket.

## Install

```bash
npm install --global stdind
```

## Usage example


```bash
npm install --global pty64
pty64 --base64 -- {long running process with output 2 stdout} | stdind
```

Open localhost:4000 and see terminal output.
Be sure server will be closed at stdout end

To not close server at the end just add `--always` argument

```bash
pty64 --base64 -- {long running process with output 2 stdout} | stdind --always
```

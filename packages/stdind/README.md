# stdind

Wraps base64 encoded output of any command and allow it to be accessed via a WebSocket.

Also starts a web app on 4000 (default) port with full featured terminal window,
and shows all output in browser as in ordinary terminal app.

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
Be sure server will be closed at "long running process" end

To not close server at the process end just add `--always` argument

```bash
pty64 --base64 -- {long running process with output 2 stdout} | stdind --always
```


## Contribute

Clone project, to see example run

```
npm install
npm run build
`npm bin`/pty64 --base64 -- ./examples/longRunning.js | ./index.js
```

#!/usr/bin/env node

/* eslint-disable comma-dangle, no-console */

/**
Build Dockerfile
node ./index.js --build

`npm bin`/pty64 --base64 -- echo hello | node ./index.js

Run server reading stdin or file content in base 64 format
providing websocket access on a WS_PORT at WS_PATH path

```
`npm bin`/pty64 --base64 -- echo hello | tee ./build/out.txt | node ./index.js
```

or with docker

 ```
 `npm bin`/pty64 --base64 -- echo hello | tee out.txt \
 | docker run -a STDIN -a STDOUT -i --rm -p 4000:4000 --name stdind 'stdind'
 ```

or with file

```
node ./index.js --file out.txt
```

or with stdin preventing close

```
cat out.txt | node ./index.js --always
```
**/
const readline = require('readline');
const express = require('express');
const path = require('path');
const { Server } = require('http');
const { Base64 } = require('js-base64');
const WebSocketServer = require('ws').Server;
const { Observable } = require('rxjs');
const fs = require('fs');
const execSync = require('child_process').execSync;

const WS_PORT = 4000;
const WS_PATH = '/ws';
const IMAGE_NAME = 'stdind';

const buildIndex = process.argv.indexOf('--build');

if (buildIndex > -1) {
  const execOptions = {
    encoding: 'utf8',
    cwd: `${__dirname}`,
    stdio: [
      'inherit', // stdin (default)
      'inherit', // stdout (default)
      'inherit'  // stderr
    ]
  };

  const code = execSync(`docker build -t ${IMAGE_NAME} .`, execOptions);
  process.exit(code);
}

const app = express();
const server = Server(app);
const wss = new WebSocketServer({ server, path: process.env.WS_PATH || WS_PATH });
const dataFileIndex = process.argv.indexOf('--file') + 1;
const preventExit = process.argv.indexOf('--always') > -1;

const rl = readline.createInterface({
  input: dataFileIndex > 0
    ? fs.createReadStream(process.argv[dataFileIndex])
    : process.stdin,
});

const stdin$ = Observable.create((o) => {
  rl.on('line', (chunk) => {
    o.next(chunk);
  });

  rl.on('close', () => {
    if (dataFileIndex === 0 && !preventExit) {
      process.exit(0);
    }
    o.complete();
  });
})
.share();

const sockets$ = Observable.create((o) => {
  wss.on('connection', (socket) => {
    socket.on('close', () => {
      o.next({ socket, type: 'REMOVE_SOCKET' });
    });

    o.next({ socket, type: 'ADD_SOCKET' });
  });
})
.share();

// combine all stdion input
const chunks$ = stdin$
  .scan(
    (r, v) => [...r, v],
    []
  );

// Combine new socket with all previous chunks
const $initialResponse = sockets$
  .filter(({ type }) => type === 'ADD_SOCKET')
  .withLatestFrom(
    chunks$,
    ({ socket }, chunks) => ({
      sockets: [socket],
      chunks,
    })
  );

// Combine all sockets
const $sockets = sockets$
  .scan(
    (r, { type, socket }) => (
      type === 'ADD_SOCKET'
        ? [...r, socket]
        : r.filter(s => s !== socket)
    ),
    []
  );

// combine last chunk with all sockets
const $realtimeResponses = stdin$
  .do((chunk) => {
    if (chunk !== null) {
      process.stdout.write(`${Base64.decode(chunk)}`);
    }
  })
  .withLatestFrom(
    $sockets,
    (chunk, sockets) => ({
      sockets,
      chunks: [chunk],
    })
  );

// combine all streams and send results
const sendStream$ = Observable.merge($initialResponse, $realtimeResponses);

sendStream$
  .subscribe(
    ({ sockets, chunks }) => {
      sockets.forEach((socket) => {
        chunks.forEach((chunk) => {
          if (chunk === null) {
            socket.send(chunk, { fin: true });
          } else {
            socket.send(
              JSON.stringify(chunk),
              { fin: false },
              (err) => {
                if (err) {
                  console.error('---error---');
                  console.error(err);
                  console.error('-----------');
                }
              }
            );
          }
        });
      });
    }
  );

app.use(express.static(path.join(__dirname, './build')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

server.listen(process.env.WS_PORT || WS_PORT);

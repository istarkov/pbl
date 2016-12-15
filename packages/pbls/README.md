

Run container in realtime

`npm bin`/pty64 --base64 -- docker stats | `npm bin`/stdind --realtime
`npm bin`/pty64 --base64 -- docker stats | docker run -a STDIN -a STDOUT -i --rm -p 4000:4000 --name stdind 'stdind' ./index.js --realtime

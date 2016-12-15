

Run container in realtime

./index.js run --name hello --dir ../../example --arg e=1 --arg 2
./index.js run --dir ../../example --arg e=1 --arg 2

`npm bin`/pty64 --base64 -- docker stats | `npm bin`/stdind --realtime
`npm bin`/pty64 --base64 -- docker stats | docker run -a STDIN -a STDOUT -i --rm -p 4000:4000 --name stdind 'stdind' ./index.js --realtime


Clear:
```
docker rmi -f $(docker images --filter "label=pbl" -q)
```

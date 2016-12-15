#!/bin/bash

function show_help {
  echo 'HELP'
}

function cleanup {
  echo 'Cleaning up.'
}

# Error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
  cleanup
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  cleanup
  echo 'Exiting without error.' 1>&2;
  exit
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGHUP

# Echo every command being executed
# set -x


# A POSIX variable
OPTIND=1         # Reset in case getopts has been used previously in the shell.

# Initialize our own variables:
NAME=
DOCKERFILE="Dockerfile"
DOMAIN=

while getopts "h?n:f:d:" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    n)  NAME=$OPTARG
        ;;
    d)  DOMAIN=$OPTARG
        ;;
    f)  DOCKERFILE=$OPTARG
        ;;
    esac
done

shift $((OPTIND-1))

[ "$1" = "--" ] && shift

if [ ! "$NAME" ]
then
    show_help
    exit 1
fi

CWD=$PWD

cd "$(dirname "$0")" || exit 1
BIN_FOLDER=$(npm bin)
cd "$CWD" || exit 1

echo $PWD
# echo "BUILD_ARGS=${BUILD_ARGS[*]}, name='$NAME', DOCKERFILE='$DOCKERFILE' Leftovers: $@"

# create log folder if not exists
mkdir -p /tmp/pbls/logs

# clear log if exists, no $NAME checks so possible to delete anything
LOG=/tmp/pbls/logs/"$NAME"
rm "$LOG" || echo ''

# stop container if already runned
IS_NGINX_PROXY_STARTED=$(docker inspect --format="{{ .State.Running }}" nginx-proxy  || printf "err" 2> /dev/null)
IS_NGINX_PROXY_STARTED=$(echo "$IS_NGINX_PROXY_STARTED" | tr -d '\n')

if [ "$IS_NGINX_PROXY_STARTED" = "err" ]; then
  echo "nginx-proxy does not exist. starting..."
  docker run -d -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --name nginx-proxy jwilder/nginx-proxy
else
  if [ "$IS_NGINX_PROXY_STARTED" = "false" ]; then
    echo "nginx-proxy is not running. restarting..."
    docker rm -f nginx-proxy
    docker run -d -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --name nginx-proxy jwilder/nginx-proxy
  else
    echo 'nginx-proxy already runned'
  fi
fi

docker rm -f "$NAME" || echo ''

"$BIN_FOLDER"/pty64 --base64 -- docker build -t "$NAME:pbl" -f "$DOCKERFILE" --label pbl "$@" . \
  | tee "$LOG" \
  | docker run -a STDIN -a STDOUT -i --rm -e VIRTUAL_HOST="${NAME}.${DOMAIN}" --name "$NAME" 'stdind'

RES="${PIPESTATUS[0]}"

if [ "$RES" = "0" ];
then
  echo ""
  echo "Starting container"
  echo "---------------------------------------"
  echo -e "\033[1mhttp://${NAME}.${DOMAIN}\033[0m"
  echo "---------------------------------------"
  echo ""
  docker run -d -e VIRTUAL_HOST="${NAME}.${DOMAIN}" --name "$NAME" "$NAME:pbl"
else
  echo 'ERROR AT BUILD'
  cat "$LOG" | docker run -a STDIN -a STDOUT -i --rm -e VIRTUAL_HOST="${NAME}.${DOMAIN}" --name "$NAME" 'stdind' ./index.js --always > /dev/null &
  exit 0
fi

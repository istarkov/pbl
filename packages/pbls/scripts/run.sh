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
BUILD_ARGS=()
DOMAIN=

while getopts "h?n:f:a:d:" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    n)  NAME=$OPTARG
        ;;
    d)  DOMAIN=$OPTARG
        ;;
    a)  BUILD_ARGS+=($OPTARG)
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
docker rm -f "$NAME" || echo ''

"$BIN_FOLDER"/pty64 --base64 -- docker build -t "$NAME" -f "$DOCKERFILE" . \
  | tee "$LOG" \
  | docker run -a STDIN -a STDOUT -i --rm -p 4000:4000 -e VIRTUAL_HOST="${NAME}.${DOMAIN}" --name stdind 'stdind'

if [ ! ${PIPESTATUS[0]} ];
then
  echo 'Starting container';
else
  echo 'NOT GOOD';
fi

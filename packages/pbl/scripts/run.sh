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
IDENTITY=
SERVER=

while getopts "h?i:n:f:s:" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    n)  NAME=$OPTARG
        ;;
    f)  DOCKERFILE=$OPTARG
        ;;
    i)  IDENTITY=$OPTARG
        ;;
    s)  SERVER=$OPTARG
        ;;
    esac
done

shift $((OPTIND-1))

[ "$1" = "--" ] && shift

# echo $NAME $DOMAIN $DOCKERFILE --- "$@"
[[ -z $IDENTITY ]] && SSH_RSYNC="ssh" || SSH_RSYNC="ssh -i $IDENTITY"

SERVER_DIR=/tmp/"$NAME"

# TODO add filtering using .dockerignore
rsync -e "$SSH_RSYNC" -avz --progress --delete --exclude='.git' --exclude='node_modules' ./ "$SERVER":"$SERVER_DIR"

$SSH_RSYNC -t $SERVER "source ~/.profile;pbls run --name $NAME --dockerFile $DOCKERFILE --dir $SERVER_DIR $*"
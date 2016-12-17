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
DAYS=

while getopts "h?d:" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    d)  DAYS=$OPTARG
        ;;
    esac
done

CLEANUP_DATE=$(date -u --date="$DAYS days ago" +"%Y-%m-%d %T %z UTC")

echo 'Clearing exited containers'

docker rm $(docker ps -a -q -f status=exited) || echo -e "\nNothing to delete"

echo 'Following containers will be deleted.'

docker ps -a --filter "label=pbl" --format "{{.ID}}#{{.CreatedAt}}#{{.Names}}" | awk -v cd="$CLEANUP_DATE" -F  "#" '{if ($2 <= cd ) print $3,$1,$2}'

echo 'Start deleting...'

docker rm -f $(docker ps -a --filter "label=pbl" --format "{{.ID}}#{{.CreatedAt}}#{{.Names}}" | awk -v cd="$CLEANUP_DATE" -F  "#" '{if ($2 <= cd ) print $1}') || echo -e "\nNothing to delete"

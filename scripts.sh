#!/bin/zsh
scripts=$0
cd $(dirname $(realpath $scripts)) || return
usage () {
    pwd
    echo "Scripts:"
    echo "$scripts help"
    echo "    Show this help message."
    echo "$scripts dev"
    echo "    Run develop server."
    echo "$scripts deploy"
    echo "    Deploy to workers."
}

help () {
    usage
}

dev () {
    wr dev
}

deploy () {
    wr deploy
}

case "$1" in
""|-h|-help|--help)
usage
exit
;;
help|dev|deploy)
$@
;;
*)
usage
exit 1
;;
esac

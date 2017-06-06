#!/bin/bash

default_pypi="https://pypi.scivisum.co.uk:3442"
default_load_pypi="https://pypi.scivisum.co.uk:3443"
help() {
    cat <<EOF
Build and deploy svGhostDriver via pip.

Arguments:
-m|--pypi-register-monitor
    URI of monitorPortal PYPI register to upload to.
    Defaults to ${default_pypi}
-l|--pypi-register-load
    URI of loadPortal PYPI register to upload to.
    Defaults to ${default_load_pypi}
--no-upload
    Build the python package, but don't deploy it to pypi.
    Find the package in ./dist
EOF
}

unknown_arg() {
    printf 'Unknown argument: %s\n' "$1" >&2
    help
    exit 1
}

create_project() {
    mkdir svGhostDriver
    cp -r src svGhostDriver/
    touch svGhostDriver/__init__.py
}

remove_project() {
    rm -rf svGhostDriver
}

build() {
    python setup.py sdist
}

deploy() {
    # Build & Upload the tar.gz package
    python setup.py register -r "${pypi_register}"
    python setup.py sdist upload -r "${pypi_register}"
    python setup.py register -r "${pypi_load_register}"
    python setup.py sdist upload -r "${pypi_load_register}"
}

# Parse the arguments
opts=$(getopt -n "$0" -o m:l:h --long pypi-register-monitor:,pypi-register-load:,no-upload,help -- "$@")

eval set -- "$opts"
while true; do
    case $1 in
        -m|--pypi-register-monitor)
            pypi_register=$2
            shift 2
            ;;
        -l|--pypi-register-load)
            pypi_load_register=$2
            shift 2
            ;;
        --no-upload)
            action=build
            shift
            ;;
        -h|--help)
            help
            exit 0
            ;;
        --)
            shift
            break
            ;;
        *)
            unknown_arg "$1"
            ;;
    esac
done

[ "$#" -gt 0 ] && unknown_arg "$1"

action=${action-deploy}
pypi_register=${pypi_register-$default_pypi}
pypi_load_register=${pypi_load_register-$default_load_pypi}

create_project
$action
remove_project

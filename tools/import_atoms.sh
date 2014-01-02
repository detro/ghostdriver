#!/bin/bash
#
# This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.
#
# Copyright (c) 2014, Ivan De Marino <http://ivandemarino.me>
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
#
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Builds all the atoms that will later be imported in GhostDriver
#
# Here we have a mix of:
#
#    * Atoms from the default WebDriver Atoms directory
#    * Atoms that were not exposed by the default build configuration of Selenium
#    * Atoms purposely built for GhostDriver, still based on the default WebDriver Atoms
#

usage() {
    echo ""
    echo "Usage:"
    echo "    import_atoms.sh <PATH_TO_SELENIUM_REPO>"
    echo ""
}

if [[ $# < 1 ]]
then
    usage
    exit
fi

################################################################################

SELENIUM_REPO_PATH=$1
DESTINATION_DIRECTORY="$PWD/../src/third_party/webdriver-atoms/"
LASTUPDATE_FILE="$DESTINATION_DIRECTORY/lastupdate"
ATOMS_BUILD_DIR="$PWD/atoms_build_dir"
TEMP_BUILD_DIR_NAME="phantomjs-driver"
TEMP_ATOMS_BUILD_DIR_SYMLINK="$SELENIUM_REPO_PATH/javascript/$TEMP_BUILD_DIR_NAME"
ATOMS_BUILD_TARGET="build_atoms"


# 1. Inject build file into CrazyFunBuild used by Selenium
ln -s $ATOMS_BUILD_DIR $TEMP_ATOMS_BUILD_DIR_SYMLINK

# 2. Build the JS Fragments
pushd $SELENIUM_REPO_PATH
# Build all the Atoms
./go //javascript/$TEMP_BUILD_DIR_NAME:$ATOMS_BUILD_TARGET

# Before importing, delete the previous atoms
rm $DESTINATION_DIRECTORY/*

# Import only the Atoms JavaScript files
JS_LIST="./build/javascript/atoms/fragments/*.js ./build/javascript/chrome-driver/*.js ./build/javascript/webdriver/atoms/fragments/*.js ./build/javascript/webdriver/atoms/fragments/inject/*.js ./build/javascript/phantomjs-driver/*.js"
for JS in $JS_LIST
do
    if [[ $JS != *_exports.js ]] && [[ $JS != *_ie.js ]] && [[ $JS != *build_atoms.js ]] && [[ $JS != *deps.js ]]
    then
        echo "Importing Atom: $JS"
        cp $JS $DESTINATION_DIRECTORY
    fi
done

# Save the current timestamp to remember when this was generated
date +"%Y-%m-%d %H:%M:%S" > $LASTUPDATE_FILE
echo "" >> $LASTUPDATE_FILE
git log -n 1 --decorate=full >> $LASTUPDATE_FILE

popd

# 3. Eject build file from CrazyFunBuild and clear the "/build" directory
rm "$TEMP_ATOMS_BUILD_DIR_SYMLINK"
rm -rf "$SELENIUM_REPO_PATH/build"

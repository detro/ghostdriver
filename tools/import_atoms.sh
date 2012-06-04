#!/bin/bash

usage() {
    echo ""
    echo "Usage:"
    echo "    import_webdriver_atoms.sh <PATH_TO_SELENIUM_REPO>"
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
JS_LIST="./build/javascript/webdriver/atoms/*.js ./build/javascript/webdriver/atoms/inject/*.js ./build/javascript/phantomjs-driver/*.js"
for JS in $JS_LIST
do
    if [[ $JS != *_exports.js ]] && [[ $JS != *_ie.js ]] && [[ $JS != *_atoms.js ]]
    then
        echo "Importing Atom: $JS"
        cp $JS $DESTINATION_DIRECTORY
    fi
done

# Save the current timestamp to remember when this was generated
date +"%Y-%m-%d %H:%M:%S" > $LASTUPDATE_FILE
echo "" >> $LASTUPDATE_FILE
svn log -l 1 >> $LASTUPDATE_FILE

popd

# 3. Eject build file from CrazyFunBuild and clear the "/build" directory
rm "$TEMP_ATOMS_BUILD_DIR_SYMLINK"
rm -rf "$SELENIUM_REPO_PATH/build"

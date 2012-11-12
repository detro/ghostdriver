#!/bin/bash

usage() {
    echo ""
    echo "Usage:"
    echo "    export_ghostdriver.sh <PATH_TO_PHANTOMJS_REPO>"
    echo ""
}

info() {
    echo -e "\033[1;32m*** ${1}\033[0m"
}

if [[ $# < 1 ]]
then
    usage
    exit
fi

################################################################################

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PHANTOMJS_REPO_PATH=$1
DESTINATION_PATH="${1}/src/ghostdriver"
DESTINATION_QRC_FILE="ghostdriver.qrc"
GHOSTDRIVER_SOURCE_PATH="${SCRIPT_DIR}/../src"

#1. Delete the Destination Directory, if any
if [ -d $DESTINATION_PATH ]; then
    info "Deleting current GhostDriver exported in local PhantomJS source (path: '${DESTINATION_PATH}')"
    rm -rf $DESTINATION_PATH
fi

#2. Create the Destination Directory again
info "Creating directory to export GhostDriver into local PhantomJS source (path: '${DESTINATION_PATH}')"
mkdir -p $DESTINATION_PATH

#3. Copy all the content of the SOURCE_DIR in there
info "Copying GhostDriver over ('${GHOSTDRIVER_SOURCE_PATH}/*' => '${DESTINATION_PATH}')"
cp -r $GHOSTDRIVER_SOURCE_PATH/* $DESTINATION_PATH

#4. Generate the .qrc file
info "Generating Qt Resource File to import GhostDriver into local PhantomJS (path: '${DESTINATION_PATH}/${DESTINATION_QRC_FILE}')"

pushd $DESTINATION_PATH

# Initiate the .qrc destination file
echo "<RCC>" > $DESTINATION_QRC_FILE
echo "    <qresource prefix=\"ghostdriver/\">" >> $DESTINATION_QRC_FILE

for FILE in `find . | sed "s/.\///"`
do
    if [ $FILE != "." ]; then
        echo "        <file>${FILE}</file>" >> $DESTINATION_QRC_FILE
    fi
done

# Finish the .qrc destination file
echo "    </qresource>" >> $DESTINATION_QRC_FILE
echo "</RCC>" >> $DESTINATION_QRC_FILE

popd

info "DONE!"


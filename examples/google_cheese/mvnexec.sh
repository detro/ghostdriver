#!/bin/bash
ARGS=$@
mvn -o exec:java -Dexec.mainClass="ghostdriver.GoogleCheese" -Dexec.args="${ARGS}"

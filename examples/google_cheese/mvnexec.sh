#!/bin/bash
ARGS=$@
mvn exec:java -Dexec.mainClass="ghostdriver.GoogleCheese" -Dexec.args="${ARGS}"

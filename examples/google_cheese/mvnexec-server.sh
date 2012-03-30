#!/bin/bash
ARGS=$@
mvn -o exec:java -Dexec.mainClass="ghostdriver.GoogleCheeseServerOnly" -Dexec.args="${ARGS}"

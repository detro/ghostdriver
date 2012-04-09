#!/bin/bash
ARGS=$@
mvn exec:java -Dexec.mainClass="ghostdriver.GoogleCheeseServerOnly" -Dexec.args="${ARGS}"

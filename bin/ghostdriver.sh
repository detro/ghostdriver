#!/usr/bin/env bash

<<License
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2016, Jason Gowan
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
License

if [ -z ${PHANTOMJS_GHOSTDRIVER_PATH+x} ]; then
  echo ERROR: PHANTOMJS_GHOSTDRIVER_PATH must be set to src/main.js
  exit 1;
fi

phantomjs_ghostdriver_path=$PHANTOMJS_GHOSTDRIVER_PATH
phantomjs_path=${PHANTOMJS_PATH:-phantomjs}
ip='127.0.0.1'
port='8910'

parse_url() {
  arg=$1
  url_regex="([0-9\.]+):([0-9]+)"
  port_regex="([0-9]+)"

  if [[ $arg =~ $url_regex ]]; then
    ip=${BASH_REMATCH[1]}
    port=${BASH_REMATCH[2]}
  elif [[ $arg =~ $port_regex ]]; then
    port=${BASH_REMATCH[1]}
  fi
}

# transform phantomjs options to ghostdriver options
for arg in "$@"; do
  shift
  case "$arg" in
    --webdriver-selenium-grid-hub*) set -- "$@"  "${arg/webdriver-selenium-grid-hub/hub}";;
    --webdriver-loglevel*) set -- "$@"   "${arg/webdriver-loglevel/logLevel}";;
    --webdriver-logfile*) set -- "$@"    "${arg/webdriver-logfile/logFile}";;
    --webdriver*)
      parse_url $arg;;
    --wd*)
      parse_url $arg;;
    -w*)
      parse_url $arg;;
    --version)
      exec $phantomjs_path --version;;
    *)        set -- "$@" "$arg"
  esac
done

set -- "$@" "--ip=$ip";
set -- "$@" "--port=$port";

exec $phantomjs_path $phantomjs_ghostdriver_path $@

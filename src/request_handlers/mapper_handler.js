/*
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2014, Ivan De Marino <http://ivandemarino.me>
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
*/

var ghostdriver = ghostdriver || {};

ghostdriver.MapperHandler = MapperHandler;

function MapperHandler() {
    this._map = {
        'GET': {},
        'POST': {},
        'DELETE': {}
    };
}

(function (mapper) {

    var _log = ghostdriver.logger.create("MapperHandler");

    function _buildPathAndParams(request) {
        var
            command,
            //un new copy of the array
            split = request.url.substr(1).split('/'),
            length = split.length,
            params = {};
        if (length === 1) {
            command = split[0];
        } else if (length > 1) {
            params.sessionId = split[1];
            split[1] = ':sessionId';
            if (length > 3) {
                params.windowHandle = 'current';
                switch(split[2]) {
                    case 'element':
                        if (split[3] !== 'active') {
                            params.id = split[3];
                            split[3] = ':id';
                        }
                        break;
                    case 'log':
                        if (split[3] !== 'types') {
                            params.name = split[3];
                            split[3] = ':type';
                        }
                        break;
                    case 'cookie':
                        params.name = split[3];
                        split[3] = ':name';
                        break;
                    case 'window':
                        params.windowHandle = split[3];
                        split[3] = ':windowHandle';
                        break;
                    default:
                        if (split[3] === 'key') { // local store and session store
                            params.key = split[4];
                            split[4] = ':key';
                        }
                        break;
                }
            }
            if (length > 4) {
                switch(split[4]) {
                    case 'attribute':
                        params.name = split[5];
                        split[5] = ':name';
                        break;
                    case 'css':
                        params.propertyName = split[5];
                        split[5] = ':propertyName';
                        break;
                    case 'equals':
                        params.other = split[5];
                        split[5] = ':other';
                        break;
                }
            }
            command = split.join('/');
        }

        return {
            path: '/' + command,
            params: params
        };
    }

    mapper._set = function(method, path, callback) {
        this._map[method][path] = callback;
        return this;
    };

    mapper.get = function(path, callback) {
        return this._set('GET', path, callback);
    };

    mapper.post = function(path, callback) {
        return this._set('POST', path, callback);
    };

    mapper.del = function(path, callback) {
        return this._set('DELETE', path, callback);
    };

    mapper.match = function(req) {
        if (!req._path) {
            var command = _buildPathAndParams(req);
            req.params  = command.params;
            req._path   = command.path;
        }
        var callback = this._map[req.method][req._path];
        if (callback) {
            _log.debug('match: ' + req.method + ' ' + req._path);
        }
        return callback;
    };

    mapper.dispatch = function (object, req, res) {
        var callback = this.match(req);
        if (callback) {
            callback.call(object, req, res);

            return true;
        }
    };

})(MapperHandler.prototype);
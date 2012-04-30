/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
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

ghostdriver.SessionReqHand = function(session) {
    // private:
    var
    _protoParent = ghostdriver.SessionReqHand.prototype,
    _session = session,
    _locator = new ghostdriver.WebElementLocator(_session),
    _const = {
        URL             : "url",
        ELEMENT         : "element",
        ELEMENT_DIR     : "/element/",
        TITLE           : "title",
        WINDOW          : "window",
        FORWARD         : "forward",
        BACK            : "back"
    },

    _handle = function(req, res) {
        var postObj,
            url,
            locator,
            element;

        _protoParent.handle.call(this, req, res);

        var responseAfterLoadFinished = function (func) {
            _session.getCurrentWindow().onLoadFinished = function () {
                res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, _session.getId()));
                res.statusCode = 200;
                res.closeGracefully();
            };
            _session.getCurrentWindow().evaluate(func);
        };

        // Handle "/url" GET and POST
        if (req.urlParsed.file === _const.URL) {                                         //< ".../url"
            if (req.method === "GET") {
                // Get the URL at which the Page currently is
                url = _session.getCurrentWindow().evaluate(function() { return location.toString(); });
                res.statusCode = 200;
                res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, _session.getId(), url));
                res.close();
            } else if (req.method === "POST") {
                // Load the given URL in the Page
                postObj = JSON.parse(req.post);
                if (typeof(postObj) === "object" && postObj.url) {
                    // Open the given URL and, when done, return "HTTP 200 OK"
                    _session.getCurrentWindow().open(postObj.url, function(status) {
                        if (status === "success") {
                            res.statusCode = 200;
                            res.closeGracefully();
                        } else {
                            throw new ghostdriver.InvalidCommandMethod(req);
                        }
                    });
                } else {
                    throw new ghostdriver.MissingCommandParameters(req);
                }
            }
            return;
        } else if (req.urlParsed.file === _const.TITLE && req.method === "GET") {       //< ".../title"
            // Get the current Page title
            _titleCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.WINDOW) {                              //< ".../window"
            if (req.method === "DELETE") {
                _windowCloseCommand(req, res);
            } else if (req.method === "POST") {
                _windowChangeFocusToCommand(req, res);
            }
            return;
        } else if (req.urlParsed.file === _const.ELEMENT && req.method === "POST") {    //< ".../element"
            _elementCommand(req, res);
            return;
        } else if (req.urlParsed.directory === _const.ELEMENT_DIR) {                    //< ".../element/:elementId" or ".../element/active"
            // TODO
        } else if (req.urlParsed.path.indexOf(_const.ELEMENT_DIR) === 0) {              //< ".../element/:elementId/COMMAND"
            // Get the WebElementRH and, if found, re-route request to it
            element = _locator.getElement(decodeURIComponent(req.urlParsed.chunks[1]));
            if (element !== null) {
                _protoParent.reroute.call(element, req, res, _const.ELEMENT_DIR + req.urlParsed.chunks[1]);
            } else {
                throw new ghostdriver.VariableResourceNotFound(req);
            }
            return;
        } else if (req.urlParsed.file === _const.FORWARD) {
            responseAfterLoadFinished(function () { history.forward() });
            return;
        } else if (req.urlParsed.file === _const.BACK) {
            responseAfterLoadFinished(function () { history.back() });
            return;
        }

        throw new ghostdriver.InvalidCommandMethod(req);
    },

    _windowCloseCommand = function(req, res) {
        _session.closeCurrentWindow();
        res.statusCode = 200;
        res.closeGracefully();
    },

    _windowChangeFocusToCommand = function(req, res) {
        // TODO
    },

    _titleCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(function() { return document.title; });
        res.statusCode = 200;
        res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, _session.getId(), result));
        res.close();
    },

    _elementCommand = function(req, res) {
        // Search for a WebElement on the Page
        var element = _locator.locateElement(JSON.parse(req.post));
        if (element) {
            res.statusCode = 200;
            res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, _session.getId(), element.getJSON()));
            res.close();
            return;
        }

        throw new ghostdriver.VariableResourceNotFound(req);
    };

    // public:
    return {
        handle : _handle,
        setSession : function(s) { _session = s; },
        getSessionId : function() { return _session.getId(); }
    };
};
// prototype inheritance:
ghostdriver.SessionReqHand.prototype = new ghostdriver.RequestHandler();

/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc. and others.
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
        ELEMENTS        : "elements",
        ELEMENT_DIR     : "/element/",
        TITLE           : "title",
        WINDOW          : "window",
        FORWARD         : "forward",
        BACK            : "back",
        REFRESH         : "refresh",
        EXECUTE         : "execute",
        EXECUTE_ASYNC   : "execute_async",
        SCREENSHOT      : "screenshot",
        TIMEOUTS        : "timeouts",
        TIMEOUTS_DIR    : "/timeouts/",
        ASYNC_SCRIPT    : "async_script",
        IMPLICIT_WAIT   : "implicit_wait",
        WINDOW_HANDLE   : "window_handle",
        WINDOW_HANDLES  : "window_handles",
        FRAME           : "frame",
        SOURCE          : "source"
    },
    _errors = require("./errors.js"),

    _handle = function(req, res) {
        var element;

        _protoParent.handle.call(this, req, res);

        // console.log("Request => " + JSON.stringify(req, null, '  '));

        // Handle "/url" GET and POST
        if (req.urlParsed.file === _const.URL) {                                         //< ".../url"
            if (req.method === "GET") {
                _getUrlCommand(req, res);
            } else if (req.method === "POST") {
                _postUrlCommand(req, res);
            }
            return;
        } else if (req.urlParsed.file === _const.TITLE && req.method === "GET") {       //< ".../title"
            // Get the current Page title
            _getTitleCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SCREENSHOT && req.method === "GET") {
            _getScreenshotCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.WINDOW) {                              //< ".../window"
            if (req.method === "DELETE") {
                _deleteWindowCommand(req, res); //< close window
            } else if (req.method === "POST") {
                _postWindowCommand(req, res);   //< change focus to the given window
            }
            return;
        } else if (req.urlParsed.file === _const.ELEMENT && req.method === "POST") {    //< ".../element"
            _postElementCommand(req, res);
            return;
        } else if (req.urlParsed.directory === _const.ELEMENT_DIR) {                    //< ".../element/:elementId" or ".../element/active"
            // TODO
        } else if (req.urlParsed.path.indexOf(_const.ELEMENT_DIR) === 0) {              //< ".../element/:elementId/COMMAND"
            // Get the WebElementRH and, if found, re-route request to it
            element = _locator.getElement(decodeURIComponent(req.urlParsed.chunks[1]));
            if (element !== null) {
                _protoParent.reroute.call(element, req, res, _const.ELEMENT_DIR + req.urlParsed.chunks[1]);
            } else {
                throw _errors.createInvalidReqVariableResourceNotFoundEH(req);
            }
            return;
        } else if (req.urlParsed.file === _const.FORWARD && req.method === "POST") {
            _forwardCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.BACK && req.method === "POST") {
            _backCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.REFRESH && req.method === "POST") {
            _refreshCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.EXECUTE && req.method === "POST") {
            _executeCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.EXECUTE_ASYNC && req.method === "POST") {
            _executeAsyncCommand(req, res);
            return;
        } else if ((req.urlParsed.file === _const.TIMEOUTS || req.urlParsed.directory === _const.TIMEOUTS_DIR) &&
            req.method === "POST") {
            _postTimeout(req, res);
            return;
        } else if (req.urlParsed.file === _const.WINDOW_HANDLE && req.method === "GET") {
            _getWindowHandle(req, res);
            return;
        } else if (req.urlParsed.file === _const.WINDOW_HANDLES && req.method === "GET") {
            _getWindowHandles(req, res);
            return;
        } else if (req.urlParsed.file === _const.FRAME && req.method === "POST") {
            _postFrameCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SOURCE && req.method === "GET") {
            _getSourceCommand(req, res);
            return;
        }

        throw _errors.createInvalidReqInvalidCommandMethodEH(req);
    },

    _createOnSuccessHandler = function(res) {
        return function (status) {
            res.success(_session.getId());
        };
    },

    _respondBasedOnResult = function(req, res, result) {
        // console.log("respondBasedOnResult => "+JSON.stringify(result));

        // Convert string to JSON
        if (typeof(result) === "string") {
            try {
                result = JSON.parse(result);
            } catch (e) {
                // In case the conversion fails, report and "Invalid Command Method" error
                _erros.handleInvalidReqInvalidCommandMethodEH(req, res);
            }
        }

        // In case the JSON doesn't contain the expected fields
        if (result === null ||
            typeof(result) === "undefined" ||
            typeof(result) !== "object" ||
            typeof(result.status) === "undefined" ||
            typeof(result.value) === "undefined") {
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS.UNKNOWN_ERROR,
                "Command failed without producing the expected error report",
                req,
                res,
                _session,
                "SessionReqHand");
        }

        // An error occurred but we got an error report to use
        if (result.status !== 0) {
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS_CODES_NAMES[result.status],
                result.value.message,
                req,
                res,
                _session,
                "SessionReqHand");
        }

        // If we arrive here, everything should be fine, birds are singing, the sky is blue
        res.success(_session.getId(), result.value);
    },

    _refreshCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res);

        _session.getCurrentWindow().evaluateAndWaitForLoad(
            function() { window.location.reload(true); }, //< 'reload(true)' force reload from the server
            successHand,
            successHand); //< We don't care if 'refresh' fails
    },

    _backCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res);

        _session.getCurrentWindow().evaluateAndWaitForLoad(
            require("./webdriver_atoms.js").get("back"),
            successHand,
            successHand); //< We don't care if 'back' fails
    },

    _forwardCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res);

        _session.getCurrentWindow().evaluateAndWaitForLoad(
            require("./webdriver_atoms.js").get("forward"),
            successHand,
            successHand); //< We don't care if 'forward' fails
    },

    _executeCommand = function(req, res) {
        var postObj = JSON.parse(req.post),
            result,
            timer,
            scriptTimeout = _session.getTimeout(_session.timeoutNames().SCRIPT),
            timedOut = false;

        if (typeof(postObj) === "object" && postObj.script && postObj.args) {
            // Execute script, but within a limited timeframe
            timer = setTimeout(function() {
                // The script didn't return within the expected timeframe
                timedOut = true;
                _errors.handleFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.TIMEOUT,
                    "Script didn't return within "+scriptTimeout+"ms",
                    req,
                    res,
                    _session,
                    "SessionReqHand");
            }, scriptTimeout);

            // Launch the actual script
            result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                postObj.script,
                postObj.args,
                true);

            // If we are here, we don't need the timer anymore
            clearTimeout(timer);

            // Respond with result ONLY if this hasn't ALREADY timed-out
            if (!timedOut) {
                _respondBasedOnResult(req, res, result);
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _executeAsyncCommand = function(req, res) {
        var postObj = JSON.parse(req.post);

        if (typeof(postObj) === "object" && postObj.script && postObj.args) {
            _session.getCurrentWindow().setOneShotCallback("onCallback", function() {
                _respondBasedOnResult(req, res, arguments[0]);
            });

            _session.getCurrentWindow().evaluate(
                "function(script, args, timeout) { " +
                    "return (" + require("./webdriver_atoms.js").get("execute_async_script") + ")( " +
                        "script, args, timeout, callPhantom, true); " +
                "}",
                postObj.script,
                postObj.args,
                _session.getTimeout(_session.timeoutNames().ASYNC_SCRIPT));
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getWindowHandle = function(req, res) {
        res.success(_session.getId(), _session.getCurrentWindowHandle());
    },

    _getWindowHandles = function(req, res) {
        res.success(_session.getId(), _session.getWindowHandles());
    },

    _getScreenshotCommand = function(req, res) {
        var rendering = _session.getCurrentWindow().renderBase64PNG();
        res.success(_session.getId(), rendering);
    },

    _getUrlCommand = function(req, res) {
        // Get the URL at which the Page currently is
        var result = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("execute_script"),
            "return location.toString()",
            []);

        _respondBasedOnResult(req, res, result);
    },

    _postUrlCommand = function(req, res) {
        // Load the given URL in the Page
        var postObj = JSON.parse(req.post),
            pageOpenTimeout = _session.getTimeout(_session.timeoutNames().PAGE_LOAD),
            pageOpenTimedout = false,
            timer;

        if (typeof(postObj) === "object" && postObj.url) {
            // Open the given URL and, when done, return "HTTP 200 OK"
            _session.getCurrentWindow().open(postObj.url, function(status) {
                if (!pageOpenTimedout) {
                    // Callback received: don't need the timer anymore
                    clearTimeout(timer);

                    if (status === "success") {
                        res.success();
                    } else {
                        _errors.handleInvalidReqInvalidCommandMethodEH(req, res);
                    }
                }
            });
            timer = setTimeout(function() {
                // Command Failed (Timed-out)
                pageOpenTimedout = true;
                _errors.handleFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.TIMEOUT,
                    "URL '"+postObj.url+"' didn't load within "+pageOpenTimeout+"ms",
                    req,
                    res,
                    _session,
                    "SessionReqHand");
            }, pageOpenTimeout);
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postTimeout = function(req, res) {
        var postObj = JSON.parse(req.post);

        // Normalize the call: the "type" is read from the URL, not a POST parameter
        if (req.urlParsed.file === _const.IMPLICIT_WAIT) {
            postObj["type"] = _session.timeoutNames().IMPLICIT;
        } else if (req.urlParsed.file === _const.ASYNC_SCRIPT) {
            postObj["type"] = _session.timeoutNames().ASYNC_SCRIPT;
        }

        if (typeof(postObj["type"]) !== "undefined" && typeof(postObj["ms"]) !== "undefined") {
            _session.setTimeout(postObj["type"], postObj["ms"]);
            res.success();
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postFrameCommand = function(req, res) {
        var postObj = JSON.parse(req.post);

        if (typeof(postObj) === "object" && typeof(postObj.id) !== "undefined") {
            if (typeof(postObj.id) === "number") {
                // TODO - search frame by "index" in the "window.frames" array
                res.success();
            } else if (typeof(postObj.id) === "string") {
                // TODO - search frame by "id" or "name" field
                res.success();
            } else if (typeof(postObj.id) === "object") {
                // TODO - search frame by "{ELEMENT : id}" object
                res.success();
            } else {
                throw _errors.createInvalidReqInvalidCommandMethodEH(req);
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getSourceCommand = function(req, res) {
        var source = _session.getCurrentWindow().content;
        res.success(_session.getId(), source);
    },

    _deleteWindowCommand = function(req, res) {
        // TODO An optional JSON parameter "name" might be given
        _session.closeCurrentWindow();
        res.success();
    },

    _postWindowCommand = function(req, res) {
        // TODO
        // TODO An optional JSON parameter "name" might be given
    },

    _getTitleCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(function() { return document.title; });
        res.success(_session.getId(), result);
    },

    _postElementCommand = function(req, res) {
        // Search for a WebElement on the Page
        var element,
            searchStartTime = new Date().getTime();

        // Try to find the element
        //  and retry if "startTime + implicitTimeout" is
        //  greater (or equal) than current time
        do {
            element = _locator.locateElement(JSON.parse(req.post));
            if (element) {
                res.success(_session.getId(), element.getJSON());
                return;
            }
        } while(searchStartTime + _session.getTimeout(_session.timeoutNames().IMPLICIT) >= new Date().getTime());

        throw _errors.createInvalidReqVariableResourceNotFoundEH(req);
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

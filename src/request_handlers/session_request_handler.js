/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
Copyright (c) 2012, Alex Anderson <@alxndrsn>
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
    _alertMonitor = {displayed:false, keyBuffer:''},
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
        CURRENT         : "current",
        SIZE            : "size",
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
        SOURCE          : "source",
        COOKIE          : "cookie",
        ACCEPT_ALERT    : "accept_alert",
        DISMISS_ALERT   : "dismiss_alert",
        ALERT_TEXT      : "alert_text"
    },
    _errors = require("./errors.js"),

    _handle = function(req, res) {
        var element;

        _protoParent.handle.call(this, req, res);

        // console.log("Request => " + JSON.stringify(req, null, '  '));

        if (req.urlParsed.file === _const.ELEMENT && req.urlParsed.chunks.length === 1 && req.method === "POST") {    //< ".../element"
            _postElementCommand(req, res);
            return;
        } else if (req.urlParsed.directory === _const.ELEMENT_DIR) {                    //< ".../element/:elementId" or ".../element/active"
            // TODO
        } else if (req.urlParsed.chunks[0] === _const.ELEMENT) {                        //< ".../element/:elementId/COMMAND"
            // Get the WebElementRH and, if found, re-route request to it
            element = _locator.getElement(decodeURIComponent(req.urlParsed.chunks[1]));
            if (element !== null) {
                _protoParent.reroute.call(element, req, res, _const.ELEMENT_DIR + req.urlParsed.chunks[1]);
            } else {
                throw _errors.createInvalidReqVariableResourceNotFoundEH(req);
            }
            return;
        } else if (req.urlParsed.file === _const.URL) {                                        //< ".../url"
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
        } else if (req.urlParsed.chunks[0] === _const.WINDOW) {
            var windowHandle = req.urlParsed.chunks[1],
                command = req.urlParsed.chunks[2];
console.log("WindowHandle: " + windowHandle);
console.log("Command: " + command);
            // TODO instead of checking request is for current, we should
            // check if it's not, and if not change window... and then change back(?)
            // TODO handle NoSuchWindow - If the specified window cannot be found.
            if(windowHandle === _const.CURRENT) {
                if(command === _const.SIZE && req.method === "POST") {
                    _postWindowSizeCommand(req, res);
                    return;
                } else if(command === _const.SIZE && req.method === "GET") {
                    _getWindowSizeCommand(req, res);
                    return;
                }
            }
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
        } else if ((req.urlParsed.file === _const.TIMEOUTS || req.urlParsed.directory === _const.TIMEOUTS_DIR) && req.method === "POST") {
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
        } else if (req.urlParsed.file === _const.COOKIE) {
            if(req.method === "DELETE") {
                _deleteCookieCommand(req, res);
                return;
            }
        } else if (req.urlParsed.file === _const.ACCEPT_ALERT && req.method === "POST") {
            _postAcceptAlertCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.DISMISS_ALERT && req.method === "POST") {
            _postDismissAlertCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.ALERT_TEXT && req.method === "GET") {
            _getAlertTextCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.ALERT_TEXT && req.method === "POST") {
            _postAlertTextCommand(req, res);
            return;
        }

        throw _errors.createInvalidReqInvalidCommandMethodEH(req);
    },

    _createOnSuccessHandler = function(res) {
        return function (status) {
            res.success(_session.getId());
        };
    },

    _postAcceptAlertCommand = function(req, res) {
console.log("_postAcceptAlertCommand :: ENTRY");
        if(_session.acceptAlert()) {
            res.success(_session.getId());
        } else {
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS.NO_ALERT_OPEN_ERROR,
                "what do we say?  there was no alert apparently",
                req,
                res,
                _session,
                "SessionReqHand");
        }
    },

    _postDismissAlertCommand = function(req, res) {
console.log("_postDismissAlertCommand :: ENTRY");
        if(_session.dismissAlert()) {
            res.success(_session.getId());
        } else {
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS.NO_ALERT_OPEN_ERROR,
                "what do we say?  there was no alert apparently",
                req,
                res,
                _session,
                "SessionReqHand");
        }
    },

    _getAlertTextCommand = function(req, res) {
        var text = _session.getAlertText();
console.log("_getAlertTextCommand :: text=" + text);
        if(text) {
            res.success(_session.getId(), text);
        } else {
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS.NO_ALERT_OPEN_ERROR,
                "what do we say?  there was no alert apparently",
                req,
                res,
                _session,
                "SessionReqHand");
        }
    },

    _postAlertTextCommand = function(req, res) {
        if(_session.sendKeysToAlert(req.text)) {
            res.success(_session.getId());
        } else {
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS.NO_ALERT_OPEN_ERROR,
                "what do we say?  there was no alert apparently",
                req,
                res,
                _session,
                "SessionReqHand");
        }
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
                res.respondBasedOnResult(_session, req, result);
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _executeAsyncCommand = function(req, res) {
        var postObj = JSON.parse(req.post);

        if (typeof(postObj) === "object" && postObj.script && postObj.args) {
            _session.getCurrentWindow().setOneShotCallback("onCallback", function() {
                res.respondBasedOnResult(_session, req, arguments[0]);
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

        res.respondBasedOnResult(_session, res, result);
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
                if (!pageOpenTimedout && ""+res!="null") {
                    // Callback received: don't need the timer anymore
                    clearTimeout(timer);

console.log("STATUS: " + status);
                    if (status === "success") {
console.log("res=" + res);
console.log("res==null?" + (res==null));
console.log("res===null?" + (res===null));
if(res) { console.log("evaluates true"); } else { console.log("evaluates false"); }
console.log("res=" + JSON.stringify(res));
console.log("res.success=...");
console.log("..." + res.success);
                        res.success(_session.getId());
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
            res.success(_session.getId());
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postFrameCommand = function(req, res) {
        var postObj = JSON.parse(req.post),
            frameElement = null,
            result;

        if (typeof(postObj) === "object" && typeof(postObj.id) !== "undefined") {
            if(postObj.id === null) {
                // Reset focus on the topmost (main) Frame
                _session.getCurrentWindow().evaluate(
                    require("./webdriver_atoms.js").get("execute_script"),
                    "return top.focus();");
                res.success(_session.getId());
                return; //< we are done here: no need go further
            }

            if (typeof(postObj.id) === "number") {
                // Search frame by "index" within the "window.frames" array
                result = _session.getCurrentWindow().evaluate(
                    require("./webdriver_atoms.js").get("execute_script"),
                    "var el = null; " +
                        "if (typeof(window.frames[arguments[0]]) !== 'undefined') { " +
                            "el = window.frames[arguments[0]].frameElement; " +
                        "} " +
                        "return el; ",
                    [postObj.id]);

                // Check if the Frame was found
                if (result.status === 0 && typeof(result.value) === "object") {
                    frameElement = result.value;
                }
            } else if (typeof(postObj.id) === "string") {
                // Search frame by "name" and, if not found, by "id"
                result = _session.getCurrentWindow().evaluate(
                    require("./webdriver_atoms.js").get("execute_script"),
                    "var el = null; " +
                        "el = document.querySelector(\"[name='\"+arguments[0]+\"']\"); " +
                        "if (el === null) { " +
                            "el = document.querySelector('#'+arguments[0]); " +
                        "} " +
                        "return el; ",
                    [postObj.id]);

                // Check if the Frame was found
                if (result.status === 0 && typeof(result.value) === "object") {
                    frameElement = result.value;
                }
            } else if (typeof(postObj.id) === "object" && typeof(postObj.id["ELEMENT"]) === "string") {
                // Search frame by "{ELEMENT : id}" object
                result = _locator.getElement(decodeURIComponent(postObj.id["ELEMENT"]));

                // Check if the Frame was found
                if (result !== null && typeof(result) === "object") {
                    frameElement = result.getJSON();
                }
            } else {
                throw _errors.createInvalidReqInvalidCommandMethodEH(req);
            }

            // Send a positive response if the element was found...
            if (frameElement !== null) {
                result = _session.getCurrentWindow().evaluate(
                    require("./webdriver_atoms.js").get("execute_script"),
                    "return arguments[0].focus();",
                    [frameElement]);
                res.success(_session.getId());
            } else {
                // ... otherwise, throw the appropriate exception
                _errors.handleFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_FRAME,    //< error name
                    "Frame not found",                          //< error message
                    req,                                        //< request
                    res,
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getSourceCommand = function(req, res) {
        var source = _session.getCurrentWindow().content;
        res.success(_session.getId(), source);
    },

    _deleteCookieCommand = function(req, res) {
	// Delete all cookies visible to the current page.
        _session.getCurrentWindow().evaluate(function() {
            var p = document.cookie.split(";"),
                i, key;

            for(i = p.length -1; i >= 0; --i) {
                key = p[i].split("=");
                document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
        });
        res.success(_session.getId());
    },

    _deleteWindowCommand = function(req, res) {
        // TODO An optional JSON parameter "name" might be given
        _session.closeCurrentWindow();
        res.success(_session.getId());
    },

    _postWindowCommand = function(req, res) {
        // TODO
        // TODO An optional JSON parameter "name" might be given
    },

    _postWindowSizeCommand = function(req, res) {
        // TODO handle errors
        var params = JSON.parse(req.post),
            width = params.width,
            height = params.height;

        if(typeof(params.width) !== "number" || typeof(params.height) !== "number") {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }

        _session.getCurrentWindow().viewportSize = {width:width, height:height}
        res.success(_session.getId());
    },

    _getWindowSizeCommand = function(req, res) {
          res.success(_session.getId(), _session.getCurrentWindow().viewportSize);
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
                res.success(_session.getId(), element);
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

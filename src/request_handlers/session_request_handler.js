/*
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2014, Ivan De Marino <http://ivandemarino.me>
Copyright (c) 2014, Alex Anderson <@alxndrsn>
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
    const
      _const = {
        CURRENT: 'current'
      };

    // private:
    var
    _session = session,
    _protoParent = ghostdriver.SessionReqHand.prototype,
    _locator = new ghostdriver.WebElementLocator(session),
    _errors = _protoParent.errors,
    _log = ghostdriver.logger.create("SessionReqHand"),
    _mapper = new ghostdriver.MapperHandler(),

    _handle = function(req, res) {
        var callback = _mapper.match(req);
        if (callback) {
            // ADD WINDOW TO
            var
                args = [req, res],
                windowHandle = req.params.windowHandle;
            if (windowHandle) {
                var targetWindow = _protoParent.getSessionWindow.call(
                    this,
                    windowHandle === _const.CURRENT ? null : windowHandle,
                    _session,
                    req
                );
                args.push(targetWindow);
            }
            callback.apply(this, args);

            return true;
        }

        // HANDLE ELEMENT ROUTER
        var elementId = req.params.id;
        if (elementId) {
            var element = new ghostdriver.WebElementReqHand(elementId, _session);
            if (element === null) {
                throw _errors.createInvalidReqVariableResourceNotFoundEH(req);
            }

            return element.handle(req, res);
        }

    },

    _createOnSuccessHandler = function(res) {
        return function (status) {
            _log.debug("_SuccessHandler", "status: " + status);
            res.success(_session.getId());
        };
    },

    _postWindowSizeCommand = function(req, res, targetWindow) {
        var params = JSON.parse(req.post),
            newWidth = params.width,
            newHeight = params.height;

        // If width/height are passed in string, force them to numbers
        if (typeof(params.width) === "string") {
            newWidth = parseInt(params.width, 10);
        }
        if (typeof(params.height) === "string") {
            newHeight = parseInt(params.height, 10);
        }

        // If a number was not found, the command is
        if (isNaN(newWidth) || isNaN(newHeight)) {
            throw _errors.createInvalidReqInvalidCommandMethodEH(req);
        }

        targetWindow.viewportSize = {
            width   : newWidth,
            height  : newHeight
        };
        res.success(_session.getId());
    },

    _getWindowSizeCommand = function(req, res, targetWindow) {
        // Returns response in the format "{width: number, height: number}"
        res.success(_session.getId(), targetWindow.viewportSize);
    },

    _postWindowPositionCommand = function(req, res, targetWindow) {
        var params = JSON.parse(req.post),
            newX = params.x,
            newY = params.y;

        // If width/height are passed in string, force them to numbers
        if (typeof(params.x) === "string") {
            newX = parseInt(params.x, 10);
        }
        if (typeof(params.y) === "string") {
            newY = parseInt(params.y, 10);
        }

        // If a number was not found, the command is
        if (isNaN(newX) || isNaN(newY)) {
            throw _errors.createInvalidReqInvalidCommandMethodEH(req);
        }

        // NOTE: Nothing to do! PhantomJS is headless. :)
        res.success(_session.getId());
    },

    _getWindowPositionCommand = function(req, res, targetWindow) {
        // Returns response in the format "{width: number, height: number}"
        res.success(_session.getId(), { x : 0, y : 0 });
    },

    _postWindowMaximizeCommand = function(req, res, targetWindow) {
        // NOTE: PhantomJS is headless, so there is no "screen" to maximize to
        // or "window" resize to that.
        //
        // NOTE: The most common screen resolution used online is currently: 1366x768
        // See http://gs.statcounter.com/#resolution-ww-monthly-201307-201312.
        targetWindow.viewportSize = {
            width   : 1366,
            height  : 768
        };

        res.success(_session.getId());
    },

    _postKeysCommand = function(req, res) {
        var activeEl = _locator.locateActiveElement();
        var elReqHand = new ghostdriver.WebElementReqHand(activeEl.value, _session);
        elReqHand.postValueCommand(req, res);
    },

    _refreshCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        currWindow.execFuncAndWaitForLoad(
            function() { currWindow.reload(); },
            successHand,
            successHand); //< We don't care if 'refresh' fails
    },

    _backCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        if (currWindow.canGoBack) {
            currWindow.execFuncAndWaitForLoad(
                function() { currWindow.goBack(); },
                successHand,
                successHand); //< We don't care if 'back' fails
        } else {
            // We can't go back, and that's ok
            successHand();
        }
    },

    _forwardCommand = function(req, res) {
        var successHand = _createOnSuccessHandler(res),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        if (currWindow.canGoForward) {
            currWindow.execFuncAndWaitForLoad(
                function() { currWindow.goForward(); },
                successHand,
                successHand); //< We don't care if 'forward' fails
        } else {
            // We can't go forward, and that's ok
            successHand();
        }
    },

    _executeCommand = function(req, res) {
        var postObj = JSON.parse(req.post),
            result,
            timer,
            scriptTimeout = _session.getScriptTimeout(),
            timedOut = false;

        if (typeof(postObj) === "object" && postObj.script && postObj.args) {
            // Execute script, but within a limited timeframe
            timer = setTimeout(function() {
                // The script didn't return within the expected timeframe
                timedOut = true;
                _errors.handleFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.TIMEOUT,
                    "Script didn't return within " + scriptTimeout + "ms",
                    req,
                    res,
                    _session,
                    "SessionReqHand");
            }, scriptTimeout);

            // Launch the actual script
            result = _protoParent.getSessionCurrWindow.call(this, _session, req).evaluate(
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

        _log.debug("_executeAsyncCommand", JSON.stringify(postObj));

        if (typeof(postObj) === "object" && postObj.script && postObj.args) {
            _protoParent.getSessionCurrWindow.call(this, _session, req).setOneShotCallback("onCallback", function() {
                _log.debug("_executeAsyncCommand.callbackArguments", JSON.stringify(arguments));

                res.respondBasedOnResult(_session, req, arguments[0]);
            });

            _protoParent.getSessionCurrWindow.call(this, _session, req).evaluate(
                "function(script, args, timeout) { " +
                    "return (" + require("./webdriver_atoms.js").get("execute_async_script") + ")" +
                        "(script, args, timeout, callPhantom, true); " +
                "}",
                postObj.script,
                postObj.args,
                _session.getScriptTimeout());
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getWindowHandle = function (req, res) {
        var handle;

        // Get current window handle
        handle = _session.getCurrentWindowHandle();

        if (handle !== null) {
            res.success(_session.getId(), handle);
        } else {
            throw _errors.createFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_WINDOW,   //< error name
                    "Current window handle invalid (closed?)",  //< error message
                    req,                                        //< request
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
        }
    },

    _getWindowHandles = function(req, res) {
        res.success(_session.getId(), _session.getWindowHandles());
    },

    _getScreenshotCommand = function(req, res) {
        var rendering = _protoParent.getSessionCurrWindow.call(this, _session, req).renderBase64("png");
        res.success(_session.getId(), rendering);
    },

    _getUrlCommand = function(req, res) {
        // Get the URL at which the Page currently is
        var result = _protoParent.getSessionCurrWindow.call(this, _session, req).evaluate(
            require("./webdriver_atoms.js").get("execute_script"),
            "return location.toString()",
            []);

        res.respondBasedOnResult(_session, res, result);
    },

    _postUrlCommand = function(req, res) {
        // Load the given URL in the Page
        var postObj = JSON.parse(req.post),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        _log.debug("_postUrlCommand", "Session '"+ _session.getId() +"' is about to load URL: " + postObj.url);

        if (typeof(postObj) === "object" && postObj.url) {
            // Switch to the main frame first
            currWindow.switchToMainFrame();

            // Load URL and wait for load to finish (or timeout)
            currWindow.execFuncAndWaitForLoad(function() {
                    currWindow.open(postObj.url.trim());
                },
                _createOnSuccessHandler(res),               //< success
                function(errMsg) {                          //< failure/timeout
                    var errCode = errMsg === "timeout"
                        ? _errors.FAILED_CMD_STATUS.TIMEOUT
                        : _errors.FAILED_CMD_STATUS.UNKNOWN_ERROR;

                    // Report error
                    _errors.handleFailedCommandEH(
                        errCode,
                        "URL '" + postObj.url + "' didn't load. Error: '" + errMsg + "'",
                        req,
                        res,
                        _session,
                        "SessionReqHand");
                });
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postTimeoutCommand = function(req, res, postObj) {
        postObj = postObj || JSON.parse(req.post);
        if (typeof(postObj["type"]) === "string" && typeof(postObj["ms"]) === "number") {

            _log.debug("_postTimeout", JSON.stringify(postObj));

            // Set the right timeout on the Session
            switch(postObj["type"]) {
                case _session.timeoutNames.SCRIPT:
                    _session.setScriptTimeout(postObj["ms"]);
                    break;
                case _session.timeoutNames.IMPLICIT:
                    _session.setImplicitTimeout(postObj["ms"]);
                    break;
                case _session.timeoutNames.PAGE_LOAD:
                    _session.setPageLoadTimeout(postObj["ms"]);
                    break;
                default:
                    throw _errors.createInvalidReqMissingCommandParameterEH(req);
            }

            res.success(_session.getId());
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postAsyncScriptTimeoutCommand = function (req, res) {
        var postObj = JSON.parse(req.post);
        postObj.type = _session.timeoutNames.SCRIPT;
        _postTimeoutCommand(req, res, postObj);
    },

    _postImplicitWaitTimeoutCommand = function (req, res) {
        var postObj = JSON.parse(req.post);
        postObj.type = _session.timeoutNames.IMPLICIT;
        _postTimeoutCommand(req, res, postObj);
    },

    _postFrameCommand = function(req, res) {
        var postObj = JSON.parse(req.post),
            frameName,
            framePos,
            switched = false,
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        _log.debug("_postFrameCommand", "Current frames count: " + currWindow.framesCount);

        if (typeof(postObj) === "object" && typeof(postObj.id) !== "undefined") {
            if(postObj.id === null) {
                _log.debug("_postFrameCommand", "Switching to 'null' (main frame)");

                // Reset focus on the topmost (main) Frame
                currWindow.switchToMainFrame();
                switched = true;
            } else if (typeof(postObj.id) === "number") {
                _log.debug("_postFrameCommand", "Switching to frame number: " + postObj.id);

                // Switch frame by "index"
                switched = currWindow.switchToFrame(postObj.id);
            } else if (typeof(postObj.id) === "string") {
                // Switch frame by "name" or by "id"
                _log.debug("_postFrameCommand", "Switching to frame #id: " + postObj.id);

                switched = currWindow.switchToFrame(postObj.id);

                // If we haven't switched, let's try to find the frame "name" using it's "id"
                if (!switched) {
                    // fetch the frame "name" via "id"
                    frameName = currWindow.evaluate(function(frameId) {
                        var el = null;
                        el = document.querySelector('#'+frameId);
                        if (el !== null) {
                            return el.name;
                        }

                        return null;
                    }, postObj.id);

                    _log.debug("_postFrameCommand", "Failed to switch by #id, trying by name: " + frameName);

                    // Switch frame by "name"
                    if (frameName !== null) {
                        switched = currWindow.switchToFrame(frameName);
                    }

                    if (!switched) {
                        // fetch the frame "position" via "id"
                        framePos = currWindow.evaluate(function(frameIdOrName) {
                            var allFrames = document.querySelectorAll("frame,iframe"),
                                theFrame = document.querySelector('#'+frameIdOrName) || document.querySelector('[name='+frameIdOrName+']'),
                                i;

                            for (i = allFrames.length -1; i >= 0; --i) {
                                if (allFrames[i].contentWindow === theFrame.contentWindow) {
                                    return i;
                                }
                            }
                        }, postObj.id);

                        if (framePos >= 0) {
                            _log.debug("_postFrameCommand", "Failed to switch by #id or name, trying by position: "+framePos);
                            switched = currWindow.switchToFrame(framePos);
                        } else {
                            _log.warn("_postFrameCommand", "Unable to locate the Frame!");
                        }
                    }
                }
            } else if (typeof(postObj.id) === "object" && typeof(postObj.id["ELEMENT"]) === "string") {
                _log.debug("_postFrameCommand.element", JSON.stringify(postObj.id));

                // Will use the Element JSON to find the frame name
                frameName = currWindow.evaluate(
                    require("./webdriver_atoms.js").get("execute_script"),
                    "if (!arguments[0].name && !arguments[0].id) { " +
                    "   arguments[0].name = '_random_name_id_' + new Date().getTime(); " +
                    "   arguments[0].id = arguments[0].name; " +
                    "} " +
                    "return arguments[0].name || arguments[0].id;",
                    [postObj.id]);

                _log.debug("_postFrameCommand.frameName", frameName.value);

                // If a frame name (or id) is found for the given ELEMENT, we
                // "re-call" this very function, changing the `post` property
                // on the `req` object. The `post` will contain this time
                // the frame name (or id) that was found.
                if (frameName && frameName.value) {
                    req.post = "{\"id\" : \"" + frameName.value + "\"}";
                    _postFrameCommand.call(this, req, res);
                    return;
                }
            } else {
                throw _errors.createInvalidReqInvalidCommandMethodEH(req);
            }

            // Send a positive response if the switch was successful
            if (switched) {
                res.success(_session.getId());
            } else {
                // ... otherwise, throw the appropriate exception
                throw _errors.createFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_FRAME,    //< error name
                    "Unable to switch to frame",                //< error message
                    req,                                        //< request
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getSourceCommand = function(req, res) {
        var source = _protoParent.getSessionCurrWindow.call(this, _session, req).frameContent;
        res.success(_session.getId(), source);
    },

    _postMouseMoveToCommand = function(req, res) {
        var postObj = JSON.parse(req.post),
            coords = { x: 0, y: 0 },
            elementLocation,
            elementSize,
            elementSpecified = false,
            offsetSpecified = false;

        if (typeof postObj === "object") {
            elementSpecified = postObj.element && postObj.element != null;
            offsetSpecified = typeof postObj.xoffset !== "undefined" && typeof postObj.yoffset !== "undefined";
        }
        // Check that either an Element ID or an X-Y Offset was provided
        if (elementSpecified || offsetSpecified) {
            _log.debug("_postMouseMoveToCommand", "element: " + elementSpecified + ", offset: " + offsetSpecified);

            // If an Element was provided...
            if (elementSpecified) {
                // Get Element's Location and add it to the coordinates
                var requestHandler = new ghostdriver.WebElementReqHand(postObj.element, _session);
                elementLocation = requestHandler.getLocationInView();
                elementSize = requestHandler.getSize();
                // If the Element has a valid location
                if (elementLocation !== null) {
                    coords.x = elementLocation.x;
                    coords.y = elementLocation.y;
                }
            } else {
                coords = _session.inputs.getCurrentCoordinates();
            }

            _log.debug("_postMouseMoveToCommand", "initial coordinates: (" + coords.x + "," + coords.y + ")");

            if (elementSpecified && !offsetSpecified && elementSize !== null) {
                coords.x += Math.floor(elementSize.width / 2);
                coords.y += Math.floor(elementSize.height / 2);
            } else {
                // Add up the offset (if any)
                coords.x += postObj.xoffset || 0;
                coords.y += postObj.yoffset || 0;
            }

            _log.debug("_postMouseMoveToCommand", "coordinates adjusted to: (" + coords.x + "," + coords.y + ")");

            // Send the Mouse Move as native event
            _session.inputs.mouseMove(_session, coords);
            res.success(_session.getId());
        } else {
            // Neither "element" nor "xoffset/yoffset" were provided
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postMouseClickCommand = function(req, res, clickType) {
        var postObj = {},
            mouseButton = "left";
        // normalize click
        clickType = clickType || "click";

        // The protocol allows language bindings to send an empty string (or no data at all)
        if (req.post && req.post.length > 0) {
            postObj = JSON.parse(req.post);
        }

        // Check that either an Element ID or an X-Y Offset was provided
        if (typeof(postObj) === "object") {
            // Determine which button to click
            if (typeof(postObj.button) === "number") {
                // 0 is left, 1 is middle, 2 is right
                mouseButton = (postObj.button === 2) ? "right" : (postObj.button === 1) ? "middle" : "left";
            }
            // Send the Mouse Click as native event
            _session.inputs.mouseButtonClick(_session, clickType, mouseButton);
            res.success(_session.getId());
        } else {
            // Neither "element" nor "xoffset/yoffset" were provided
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postCookieCommand = function(req, res) {
        var postObj = JSON.parse(req.post || "{}"),
            currWindow = _protoParent.getSessionCurrWindow.call(this, _session, req);

        // If the page has not loaded anything yet, setting cookies is forbidden
        if (currWindow.url.indexOf("about:blank") === 0) {
            // Something else went wrong
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS.UNABLE_TO_SET_COOKIE,
                "Unable to set Cookie: no URL has been loaded yet",
                req,
                res,
                _session,
                "SessionReqHand");
            return;
        }

        if (postObj.cookie) {
            // JavaScript deals with Timestamps in "milliseconds since epoch": normalize!
            if (postObj.cookie.expiry) {
                postObj.cookie.expiry *= 1000;
            }

            // If the cookie is expired OR if it was successfully added
            if ((postObj.cookie.expiry && postObj.cookie.expiry <= new Date().getTime()) ||
                currWindow.addCookie(postObj.cookie)) {
                // Notify success
                res.success(_session.getId());
            } else {
                // Something went wrong while trying to set the cookie
                if (currWindow.url.indexOf(postObj.cookie.domain) < 0) {
                    // Domain mismatch
                    _errors.handleFailedCommandEH(
                        _errors.FAILED_CMD_STATUS.INVALID_COOKIE_DOMAIN,
                        "Can only set Cookies for the current domain",
                        req,
                        res,
                        _session,
                        "SessionReqHand");
                } else {
                    // Something else went wrong
                    _errors.handleFailedCommandEH(
                        _errors.FAILED_CMD_STATUS.UNABLE_TO_SET_COOKIE,
                        "Unable to set Cookie",
                        req,
                        res,
                        _session,
                        "SessionReqHand");
                }
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getCookieCommand = function(req, res) {
        // Get all the cookies the session at current URL can see/access
        res.success(
            _session.getId(),
            _protoParent.getSessionCurrWindow.call(this, _session, req).cookies);
    },

    _deleteCookieCommand = function(req, res) {
        var cookieName = req.params.name;
        if (cookieName) {
            // delete only 1 cookie among the one visible to this page
            _protoParent.getSessionCurrWindow.call(this, _session, req).deleteCookie(cookieName);
        } else {
            // delete all the cookies visible to this page
            _protoParent.getSessionCurrWindow.call(this, _session, req).clearCookies();
        }

        res.success(_session.getId());
    },

    _deleteWindowCommand = function(req, res) {
        var params = JSON.parse(req.post || "{}"), //< in case nothing is posted at all
            closed = false;

        // Use the "name" parameter if it was provided
        if (typeof(params) === "object" && params.name) {
            closed = _session.closeWindow(params.name);
        } else {
            closed = _session.closeCurrentWindow();
        }

        // Report a success if we manage to close the window,
        // otherwise throw a Failed Command Error
        if (closed) {
            res.success(_session.getId());
        } else {
            throw _errors.createFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_WINDOW,   //< error name
                    "Unable to close window (closed already?)", //< error message
                    req,                                        //< request
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
        }
    },

    _postWindowCommand = function(req, res) {
        var params = JSON.parse(req.post);

        if (typeof(params) === "object" && typeof(params.name) === "string") {
            // Report a success if we manage to switch the current window,
            // otherwise throw a Failed Command Error
            if (_session.switchToWindow(params.name)) {
                res.success(_session.getId());
            } else {
                throw _errors.createFailedCommandEH(
                    _errors.FAILED_CMD_STATUS.NO_SUCH_WINDOW,   //< error name
                    "Unable to switch to window (closed?)",     //< error message
                    req,                                        //< request
                    _session,                                   //< session
                    "SessionReqHand");                          //< class name
            }
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _getTitleCommand = function(req, res) {
        res.success(_session.getId(), _protoParent.getSessionCurrWindow.call(this, _session, req).title);
    },

    _executePhantomJS = function(req, res) {
        var params = JSON.parse(req.post);
        if (typeof(params) === "object" && params.script && params.args) {
            res.success(_session.getId(), _session.executePhantomJS(_protoParent.getSessionCurrWindow.call(this, _session, req), params.script, params.args));
        } else {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
    },

    _postLog = function (req, res) {
        var params = JSON.parse(req.post);
        if (!params.type || _session.getLogTypes().indexOf(params.type) < 0) {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
        res.success(_session.getId(), _session.getLog(params.type));
    },

    _getLogTypes = function (req, res) {
        res.success(_session.getId(), _session.getLogTypes());
    },

    _getLog = function (req, res) {
        var params = req.params;
        if (!params.type || _session.getLogTypes().indexOf(params.type) < 0) {
            throw _errors.createInvalidReqMissingCommandParameterEH(req);
        }
        res.success(_session.getId(), _session.getLog(params.type));
    },
    _postFindElement = function (req, res) {
        _locator.handleLocateCommand(req, res, _locator.locateElement);
    },
    _postFindElements = function (req, res) {
        _locator.handleLocateCommand(req, res, _locator.locateElements);
    },
    _postFindActiveElement = function (req, res) {
      _locator.handleLocateCommand(req, res, _locator.locateActiveElement);
    },
    _postMouseUpCommand = function (req, res) {
        _postMouseClickCommand(req, res, 'mouseup');
    },
    _postMouseDownCommand = function (req, res) {
        _postMouseClickCommand(req, res, 'mousedown');
    },
    _postMouseDbClickCommand = function (req, res) {
        _postMouseClickCommand(req, res, 'doubleclick');
    };

    // ------------ POST --------------

    _mapper.get(
        '/session/:sessionId/url',
        _getUrlCommand
    )
    .get(
        '/session/:sessionId/screenshot',
        _getScreenshotCommand
    )
    .get(
        '/session/:sessionId/title',
        _getTitleCommand
    )
    .get(
        '/session/:sessionId/window_handle',
        _getWindowHandle
    )
    .get(
        '/session/:sessionId/window_handles',
        _getWindowHandles
    )
    .get(
        '/session/:sessionId/source',
        _getSourceCommand
    )
    .get(
        '/session/:sessionId/window',
        _postWindowCommand
    )
    .get(
        '/session/:sessionId/window/:windowHandle/size',
        _getWindowSizeCommand
    )
    .get(
        '/session/:sessionId/window/:windowHandle/position',
        _getWindowPositionCommand
    )
    .get(
        '/session/:sessionId/cookie',
        _getCookieCommand
    )
    .get(
        '/session/:sessionId/log/types',
        _getLogTypes
    )
    .get(
        '/session/:sessionId/log/:type',
        _getLog
    )
    // ------------ POST --------------

    .post(
        '/session/:sessionId/url',
        _postUrlCommand
    )
    .post(
        '/session/:sessionId/keys',
        _postKeysCommand
    )
    .post(
        '/session/:sessionId/forward',
        _forwardCommand
    )
    .post(
        '/session/:sessionId/back',
        _backCommand
    )
    .post(
        '/session/:sessionId/refresh',
        _refreshCommand
    )
    .post(
        '/session/:sessionId/execute',
        _executeCommand
    )
    .post(
        '/session/:sessionId/execute_async',
        _executeAsyncCommand
    )
    .post(
        '/session/:sessionId/timeouts',
        _postTimeoutCommand
    )
    .post(
        '/session/:sessionId/timeouts/implicit_wait',
        _postImplicitWaitTimeoutCommand
    )
    .post(
        '/session/:sessionId/timeouts/async_script',
        _postAsyncScriptTimeoutCommand
    )
    .post(
        '/session/:sessionId/moveto',
        _postMouseMoveToCommand
    )
    .post(
        '/session/:sessionId/frame',
        _postFrameCommand
    )
    .post(
        '/session/:sessionId/click',
        _postMouseClickCommand
    )
    .post(
        '/session/:sessionId/buttonup',
        _postMouseUpCommand
    )
    .post(
        '/session/:sessionId/buttondown',
        _postMouseDownCommand
    )
    .post(
        '/session/:sessionId/doubleclick',
        _postMouseDbClickCommand
    )
    .post(
        '/session/:sessionId/cookie',
        _postCookieCommand
    )
    .post(
        '/session/:sessionId/log',
        _postLog
    )
    .post(
        '/session/:sessionId/elements',
        _postFindElements
    )
    .post(
        '/session/:sessionId/element',
        _postFindElement
    )
    .post(
        '/session/:sessionId/element/active',
        _postFindActiveElement
    )
    .post(
        '/session/:sessionId/phantom/execute',
        _executePhantomJS
    )
    .post(
        '/session/:sessionId/window',
        _postWindowCommand
    )
    .post(
        '/session/:sessionId/window/:windowHandle/size',
        _postWindowSizeCommand
    )
    .post(
        '/session/:sessionId/window/:windowHandle/position',
        _postWindowPositionCommand
    )
    .post(
        '/session/:sessionId/window/:windowHandle/maximize',
        _postWindowMaximizeCommand
    )


    //

    // ------------ DELETE --------------

    .del(
        '/session/:sessionId/window',
        _deleteWindowCommand
    )
    .del(
        '/session/:sessionId/cookie',
        _deleteCookieCommand
    )
    .del(
        '/session/:sessionId/cookie/:name',
        _deleteCookieCommand
    );


    // public:
    return {
        handle : _handle,
        getSessionId : function() { return _session.getId(); }
    };
};
// prototype inheritance:
ghostdriver.SessionReqHand.prototype = new ghostdriver.RequestHandler();

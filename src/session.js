/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com / detronizator@gmail.com>
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

ghostdriver.Session = function(desiredCapabilities) {
    // private:
    var
    _defaultCapabilities = {    // TODO - Actually try to match the "desiredCapabilities" instead of ignoring them
        "browserName" : "phantomjs",
        "version" : phantom.version.major + '.' + phantom.version.minor + '.' + phantom.version.patch,
        "platform" : ghostdriver.system.os.name + '-' + ghostdriver.system.os.version + '-' + ghostdriver.system.os.architecture,
        "javascriptEnabled" : true,
        "takesScreenshot" : true,
        "handlesAlerts" : false,            //< TODO
        "databaseEnabled" : false,          //< TODO
        "locationContextEnabled" : false,   //< TODO Target is 1.1
        "applicationCacheEnabled" : false,  //< TODO Support for AppCache (?)
        "browserConnectionEnabled" : false, //< TODO
        "cssSelectorsEnabled" : true,
        "webStorageEnabled" : false,        //< TODO support for LocalStorage/SessionStorage
        "rotatable" : false,                //< TODO Target is 1.1
        "acceptSslCerts" : false,           //< TODO
        "nativeEvents" : true,              //< TODO Only some commands are Native Events currently
        "proxy" : {                         //< TODO Support more proxy options - PhantomJS does allow setting from command line
            "proxyType" : "direct"
        }
    },
    _negotiatedCapabilities = {
        "browserName"               : _defaultCapabilities.browserName,
        "version"                   : _defaultCapabilities.version,
        "platform"                  : _defaultCapabilities.platform,
        "javascriptEnabled"         : typeof(desiredCapabilities.javascriptEnabled) === "undefined" ?
            _defaultCapabilities.javascriptEnabled :
            desiredCapabilities.javascriptEnabled,
        "takesScreenshot"           : typeof(desiredCapabilities.takesScreenshot) === "undefined" ?
            _defaultCapabilities.takesScreenshot :
            desiredCapabilities.takesScreenshot,
        "handlesAlerts"             : _defaultCapabilities.handlesAlerts,
        "databaseEnabled"           : _defaultCapabilities.databaseEnabled,
        "locationContextEnabled"    : _defaultCapabilities.locationContextEnabled,
        "applicationCacheEnabled"   : _defaultCapabilities.applicationCacheEnabled,
        "browserConnectionEnabled"  : _defaultCapabilities.browserConnectionEnabled,
        "cssSelectorsEnabled"       : _defaultCapabilities.cssSelectorsEnabled,
        "webStorageEnabled"         : _defaultCapabilities.webStorageEnabled,
        "rotatable"                 : _defaultCapabilities.rotatable,
        "acceptSslCerts"            : _defaultCapabilities.acceptSslCerts,
        "nativeEvents"              : _defaultCapabilities.nativeEvents,
        "proxy"                     : typeof(desiredCapabilities.proxy) === "undefined" ?
            _defaultCapabilities.proxy :
            desiredCapabilities.proxy
    },
    _timeouts = {
        "script"            : 500,          //< 0.5s
        "async script"      : 5000,         //< 5s
        "implicit"          : 0,            //< 0s
        "page load"         : 10000         //< 10s
    },
    _const = {
        TIMEOUT_NAMES : {
            SCRIPT          : "script",
            ASYNC_SCRIPT    : "async script",
            IMPLICIT        : "implicit",
            PAGE_LOAD       : "page load"
        }
    },
    _windows = {},  //< NOTE: windows are "webpage" in Phantom-dialect
    _currentWindowHandle = null,
    _id = require("./third_party/uuid.js").v1(),

    _execFuncAndWaitForLoadDecorator = function(func, onLoadFunc, onErrorFunc) {
        // convert 'arguments' to a real Array
        var args = Array.prototype.splice.call(arguments, 0),
            timer,
            inLoad = false,
            thisPage = this;

        // Separating arguments for the "function call"
        // from the callback handlers.
        args.splice(0, 3);

        // Register event handlers
        // This logic bears some explaining. If we are loading a new page,
        // the loadStarted event will fire, then urlChanged, then loadFinished,
        // assuming no errors. However, when navigating to a fragment on the
        // same page, neither the loadStarted nor the loadFinished events will
        // fire. So if we receive a urlChanged event without a corresponding
        // loadStarted event, we know we are only navigating to a fragment on
        // the same page, and should fire the onLoadFunc callback. Otherwise,
        // we need to wait until the loadFinished event before firing the
        // callback.
        this.setOneShotCallback("onLoadStarted", function () {
            // console.log("onLoadStarted");
            inLoad = true;
        });
        this.setOneShotCallback("onUrlChanged", function () {
            // console.log("onUrlChanged");
            if (!inLoad) {
                clearTimeout(timer);
                onLoadFunc();
            }
        });
        this.setOneShotCallback("onLoadFinished", function () {
            // console.log("onLoadFinished");
            clearTimeout(timer);
            inLoad = false;
            onLoadFunc();
        });
        this.setOneShotCallback("onError", function(message, stack) {
            // console.log("onError: "+message+"\n");
            // stack.forEach(function(item) {
            //     var message = item.file + ":" + item.line;
            //     if (item["function"])
            //         message += " in " + item["function"];
            //     console.log("  " + message);
            // });

            thisPage.stop(); //< stop the page from loading
            clearTimeout(timer);
            inLoad = false;
            onErrorFunc();
        });

        // Starting timer
        timer = setTimeout(function() {
            thisPage.stop(); //< stop the page from loading
            inLoad = false;
            onErrorFunc();
        }, _getTimeout(_const.TIMEOUT_NAMES.PAGE_LOAD));

        // We are ready to Eval
        func.apply(this, args);
    },

    _evaluateAndWaitForLoadDecorator = function(evalFunc, onLoadFunc, onErrorFunc) {
        // convert 'arguments' to a real Array
        var args = Array.prototype.splice.call(arguments, 0),
            timer,
            inLoad = false,
            thisPage = this;

        // Separating arguments for the 'evaluate' call
        // from the callback handlers.
        // NOTE: I'm also passing 'evalFunc' as first parameter
        // for the 'evaluate' call, and '0' as timeout.
        args.splice(0, 3, evalFunc, 0);

        // Register event handlers
        // This logic bears some explaining. If we are loading a new page,
        // the loadStarted event will fire, then urlChanged, then loadFinished,
        // assuming no errors. However, when navigating to a fragment on the
        // same page, neither the loadStarted nor the loadFinished events will
        // fire. So if we receive a urlChanged event without a corresponding
        // loadStarted event, we know we are only navigating to a fragment on
        // the same page, and should fire the onLoadFunc callback. Otherwise,
        // we need to wait until the loadFinished event before firing the
        // callback.
        this.setOneShotCallback("onLoadStarted", function () {
            // console.log("onLoadStarted");
            inLoad = true;
        });
        this.setOneShotCallback("onUrlChanged", function () {
            // console.log("onUrlChanged");
            if (!inLoad) {
                clearTimeout(timer);
                onLoadFunc();
            }
        });
        this.setOneShotCallback("onLoadFinished", function() {
            // console.log("onLoadFinished");
            clearTimeout(timer);
            inLoad = false;
            onLoadFunc();
        });
        this.setOneShotCallback("onError", function(message, stack) {
            // console.log("onError: "+message+"\n");
            // stack.forEach(function(item) {
            //     var message = item.file + ":" + item.line;
            //     if (item["function"])
            //         message += " in " + item["function"];
            //     console.log("  " + message);
            // });

            thisPage.stop(); //< stop the page from loading
            clearTimeout(timer);
            inLoad = false;
            onErrorFunc();
        });

        // Starting timer
        timer = setTimeout(function() {
            thisPage.stop(); //< stop the page from loading
            inLoad = false;
            onErrorFunc();
        }, _getTimeout(_const.TIMEOUT_NAMES.PAGE_LOAD));

        // We are ready to Eval
        this.evaluateAsync.apply(this, args);
    },

    _setOneShotCallbackDecorator = function(callbackName, handlerFunc) {
        var thisPage = this;

        thisPage[callbackName] = function() {
            thisPage[callbackName] = null;           //< once done, get rid of the handling
            handlerFunc.apply(thisPage, arguments);  //< call the actual handler
        };
    },

    // Add any new page to the "_windows" container of this session
    _addNewPage = function(newPage) {
        _decorateNewWindow(newPage);                //< decorate the new page
        _windows[newPage.windowHandle] = newPage;   //< store the page/window
    },

    // Delete any closing page from the "_windows" container of this session
    _deleteClosingPage = function(closingPage) {
        // Need to be defensive, as the "closing" can be cause by Client Commands
        if (_windows.hasOwnProperty(closingPage.windowHandle)) {
            delete _windows[closingPage.windowHandle];
        }
    },

    _decorateNewWindow = function(page) {
        // Decorating:
        // 0. Pages lifetime will be managed by Driver, not the pages
        page.ownsPages = false;
        // 1. Random Window Handle
        page.windowHandle = "WH-" + new Date().getTime() + '-' + Math.random();
        // 2. Utility methods
        page.evaluateAndWaitForLoad = _evaluateAndWaitForLoadDecorator;
        page.execFuncAndWaitForLoad = _execFuncAndWaitForLoadDecorator;
        page.setOneShotCallback = _setOneShotCallbackDecorator;
        // 3. Store every newly created page
        page.onPageCreated = _addNewPage;
        // 4. Remove every closing page
        page.onClosing = _deleteClosingPage;

        // page.onConsoleMessage = function(msg) { console.log(msg); };

        return page;
    },

    _getWindow = function(handleOrName) {
        var page = null,
            k;

        if (_isValidWindowHandle(handleOrName)) {
            // Search by "handle"
            page = _windows[handleOrName];
        } else {
            // Search by "name"
            for (k in _windows) {
                if (_windows[k].windowName === handleOrName) {
                    page = _windows[k];
                    break;
                }
            }
        }

        return page;
    },

    _getCurrentWindow = function() {
        var page = null;
        if (_currentWindowHandle === null) {
            // First call to get the current window: need to create one
            page = _decorateNewWindow(require("webpage").create());
            _currentWindowHandle = page.windowHandle;
            _windows[_currentWindowHandle] = page;
        } else if (_windows.hasOwnProperty(_currentWindowHandle)) {
            page = _windows[_currentWindowHandle];
        }

        // TODO Handle "null" cases throwing a "no such window" error

        return page;
    },

    _switchToWindow = function(handleOrName) {
        var page = _getWindow(handleOrName);

        if (page !== null) {
            // Switch current window and return "true"
            _currentWindowHandle = page.windowHandle;
            return true;
        }

        // Couldn't find the window, so return "false"
        return false;
    },

    _closeCurrentWindow = function() {
        if (_currentWindowHandle !== null) {
            return _closeWindow(_currentWindowHandle);
        }
        return false;
    },

    _closeWindow = function(handleOrName) {
        var page = _getWindow(handleOrName),
            handle;

        if (page !== null) {
            handle = page.windowHandle;
            _windows[handle].close();
            delete _windows[handle];
            return true;
        }
        return false;
    },

    _getWindowsCount = function() {
        return Object.keys(_windows).length;
    },

    _getCurrentWindowHandle = function() {
        if (!_isValidWindowHandle(_currentWindowHandle)) {
            return null;
        }
        return _currentWindowHandle;
    },

    _isValidWindowHandle = function(handle) {
        return _windows.hasOwnProperty(handle);
    },

    _getWindowHandles = function() {
        return Object.keys(_windows);
    },

    _setTimeout = function(type, ms) {
        _timeouts[type] = ms;
    },

    _getTimeout = function(type) {
        return _timeouts[type];
    },

    _timeoutNames = function() {
        return _const.TIMEOUT_NAMES;
    },

    _aboutToDelete = function() {
        var k;

        // Close current window first
        _closeCurrentWindow();

        // Releasing page resources and deleting the objects
        for (k in _windows) {
            _closeWindow(k);
        }
    };

    // console.log("Session '" + _id + "' - Capabilities: " + JSON.stringify(_negotiatedCapabilities, null, "  "));
    // console.log("Desired: "+JSON.stringify(desiredCapabilities, null, "  "));

    // public:
    return {
        getCapabilities : function() { return _negotiatedCapabilities; },
        getId : function() { return _id; },
        switchToWindow : _switchToWindow,
        getCurrentWindow : _getCurrentWindow,
        closeCurrentWindow : _closeCurrentWindow,
        getWindow : _getWindow,
        closeWindow : _closeWindow,
        getWindowsCount : _getWindowsCount,
        getCurrentWindowHandle : _getCurrentWindowHandle,
        getWindowHandles: _getWindowHandles,
        isValidWindowHandle: _isValidWindowHandle,
        aboutToDelete : _aboutToDelete,
        setTimeout : _setTimeout,
        getTimeout : _getTimeout,
        timeoutNames : _timeoutNames
    };
};


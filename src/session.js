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

ghostdriver.Session = function(desiredCapabilities) {
    // private:
    var
    _defaultCapabilities = {    // TODO - Actually try to match the "desiredCapabilities" instead of ignoring them
        "browserName" : "phantomjs",
        "version" : phantom.version.major + '.' + phantom.version.minor + '.' + phantom.version.patch,
        "platform" : ghostdriver.system.os.name + '-' + ghostdriver.system.os.version + '-' + ghostdriver.system.os.architecture,
        "javascriptEnabled" : true,
        "takesScreenshot" : true,
        "handlesAlerts" : true,
        "databaseEnabled" : true,
        "locationContextEnabled" : false,
        "applicationCacheEnabled" : true,
        "browserConnectionEnabled" : false,
        "cssSelectorsEnabled" : true,
        "webStorageEnabled" : true,
        "rotatable" : true,
        "acceptSslCerts" : false,
        "nativeEvents" : true,
        "proxy" : {
            "proxyType" : "direct"
        }
    },
    _timeouts = {
        "script"            : 500,          //< 0.5s
        "async script"      : 5000,         //< 5s
        "implicit"          : 0,            //< 0s
        "page load"         : 10000         //< 10s
    },
    _const = {
        DEFAULT_CURRENT_WINDOW_HANDLE : "1",
        TIMEOUT_NAMES : {
            SCRIPT          : "script",
            ASYNC_SCRIPT    : "async script",
            IMPLICIT        : "implicit",
            PAGE_LOAD       : "page load"
        }
    },
    _windows = {},  //< windows are "webpage" in Phantom-dialect
    _currentWindowHandle = null,
    _id = (++ghostdriver.Session.instanceCounter) + '', //< must be a string, even if I use progressive integers as unique ID

    _evaluateAndWaitForLoadDecorator = function(evalFunc, onLoadFunc, onErrorFunc) {
        var args = Array.prototype.splice.call(arguments, 0), //< convert 'arguments' to a real Array
            timer;

        // Separating arguments for the 'evaluate' call from the callback handlers
        // NOTE: I'm also passing 'evalFunc' as first parameter for the 'evaluate' call, and '0' as timeout
        args.splice(0, 3, evalFunc, 0);

        // Register event handlers
        this.setOneShotCallback("onLoadStarted", function() {
            // console.log("onLoadStarted");
            clearTimeout(timer);                            //< Load Started: we'll wait for "onLoadFinished" now
        });
        this.setOneShotCallback("onLoadFinished", function() {
            // console.log("onLoadFinished");
            onLoadFunc();
        });
        this.setOneShotCallback("onError", function() {     //< TODO Currently broken in PhantomJS, fixed by using "evaluateAsync"
            // console.log("onError");
            clearTimeout(timer);
            onErrorFunc();
        });
        // Starting timer
        timer = setTimeout(onErrorFunc, _getTimeout(_const.TIMEOUT_NAMES.PAGE_LOAD));

        // We are ready to Eval
        this.evaluateAsync.apply(this, args);

    },

    _setOneShotCallbackDecorator = function(callbackName, handlerFunc) {
        var thePage = this;

        this[callbackName] = function() {
            handlerFunc.apply(thePage, arguments);  //< call the actual handler
            thePage[callbackName] = null;           //< once done, get rid of the handling
        };
    };

    _createNewWindow = function(page, newWindowHandle) {
        // Decorating...
        page.windowHandle = newWindowHandle;
        page.evaluateAndWaitForLoad = _evaluateAndWaitForLoadDecorator;
        page.setOneShotCallback = _setOneShotCallbackDecorator;

        return page;
    },

    _getCurrentWindow = function() {
        if (_currentWindowHandle === null) {
            // First call to get the current window: need to create one
            _currentWindowHandle = _const.DEFAULT_CURRENT_WINDOW_HANDLE;
            _windows[_currentWindowHandle] = _createNewWindow(require("webpage").create(), _currentWindowHandle);
        }
        return _windows[_currentWindowHandle];
    },

    _closeCurrentWindow = function() {
        if (_currentWindowHandle !== null) {
            _closeWindow(_currentWindowHandle);
            _currentWindowHandle = null;
        }
    },

    _getWindow = function(windowHandle) {
        return (typeof(_windows[windowHandle]) !== "undefined") ? _windows[windowHandle] : null;
    },

    _getWindowsCount = function() {
        return Object.keys(_windows).length;
    },

    _getCurrentWindowHandle = function() {
        return _currentWindowHandle;
    },

    _getWindowHandles = function() {
        return Object.keys(_windows);
    },

    _closeWindow = function(windowHandle) {
        _windows[windowHandle].release();
        delete _windows[windowHandle];
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

    // public:
    return {
        getCapabilities : function() { return _defaultCapabilities; },
        getId : function() { return _id; },
        getCurrentWindow : _getCurrentWindow,
        closeCurrentWindow : _closeCurrentWindow,
        getWindow : _getWindow,
        getWindowsCount : _getWindowsCount,
        closeWindow : _closeWindow,
        aboutToDelete : _aboutToDelete,
        setTimeout : _setTimeout,
        getTimeout : _getTimeout,
        timeoutNames : _timeoutNames,
        getCurrentWindowHandle : _getCurrentWindowHandle,
        getWindowHandles : _getWindowHandles
    };
};

// public static:
ghostdriver.Session.instanceCounter = 0;

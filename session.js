var ghostdriver = ghostdriver || {};

ghostdriver.Session = function(desiredCapabilities) {
    // TODO - Actually try to match the "desiredCapabilities" instead of ignoring them

    // private:
    var
    _defaultCapabilities = {
        "browserName" : "phantomjs",
        "version" : phantom.version.major + '.' + phantom.version.minor + '.' + phantom.version.patch,
        "platform" : phantom.defaultPageSettings.userAgent,
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
    _const = {
        DEFAULT_CURRENT_WINDOW_HANDLE : "1"
    },
    _windows = {},  //< windows are "webpage" in Phantom-dialect
    _currentWindowHandle = null,
    _id = (++ghostdriver.Session.instanceCounter) + '', //< must be a string, even if I use progressive integers as unique ID

    // Decoration for new "webpage" objects
    __evaluateWithParams = function(func) {
        var args = [].slice.call(arguments, 1),
            str = 'function() { return (' + func.toString() + ')(',
            i, ilen, arg;

        for (i = 0, ilen = args.length; i < ilen; ++i) {
            arg = args[i];
            if (/object|string/.test(typeof arg)) {
                str += 'JSON.parse(' + JSON.stringify(JSON.stringify(arg)) + '),';
            } else {
                str += arg + ',';
            }
        }
        str = str.replace(/,$/, '); }');

        return this.evaluate(str);
    },

    _createNewWindow = function(page, newWindowHandle) {
        // Decorating...
        page.evaluateWithParams = __evaluateWithParams;
        page.windowHandle = newWindowHandle;

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

    _closeWindow = function(windowHandle) {
        _windows[windowHandle].release();
        delete _windows[windowHandle];
    },

    _aboutToDelete = function() {
        var k;

        // Close current window first
        _closeCurrentWindow();

        // Releasing page resources and deleting the objects
        for (handle in _windows) {
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
        aboutToDelete : _aboutToDelete
    };
};

// public static:
ghostdriver.Session.instanceCounter = 0;
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
    _page = require("webpage").create(),
    _id = (++ghostdriver.Session.instanceCounter) + ''; //< must be a string, even if I use progressive integers as unique ID

    // Decorating the "webpage" object
    _page.evaluateWithParams = function(func) {
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
    };

    // public:
    return {
        getCapabilities : function() { return _defaultCapabilities; },
        getId : function() { return _id; },
        getPage : function() { return _page; }
    };
};

// public static:
ghostdriver.Session.instanceCounter = 0;
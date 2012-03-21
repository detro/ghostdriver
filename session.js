var phantomdriver = phantomdriver || {};

phantomdriver.Session = function(desiredCapabilities) {
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
    _id = ++phantomdriver.Session.instanceCounter;

    // public:
    return {
        getCapabilities : function() { return _defaultCapabilities; },
        getId : function() { return _id; },
        getPage : function() { return _page; }
    };
};

phantomdriver.Session.instanceCounter = 0;
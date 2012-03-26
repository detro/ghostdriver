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
        WINDOW          : "window"
    },

    _handle = function(req, res) {
        var postObj,
            url,
            locator,
            element;

        _protoParent.handle.call(this, req, res);

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
            element = _locator.getElement(req.urlParsed.chunks[1]);
            if (element !== null) {
                _protoParent.reroute.call(element, req, res, _const.ELEMENT_DIR + element.getId());
            } else {
                throw new ghostdriver.VariableResourceNotFound(req);
            }
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

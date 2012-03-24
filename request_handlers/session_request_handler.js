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
        ELEMENT_DIR     : "/element/"
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
                url = _session.getPage().evaluate(function() { return location.toString(); });
                res.statusCode = 200;
                res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, _session.getId(), url));
                res.close();
            } else if (req.method === "POST") {
                // Load the given URL in the Page
                postObj = JSON.parse(req.post);
                if (typeof(postObj) === "object" && postObj.url) {
                    // Open the given URL and, when done, return "HTTP 200 OK"
                    _session.getPage().open(postObj.url, function(status) {
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
        } else if (req.urlParsed.file === _const.ELEMENT && req.method === "POST") {     //< ".../element"
            // Search for an Element on the Page
            element = _locator.locateElement(JSON.parse(req.post));
            if (element) {
                res.statusCode = 200;
                res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, _session.getId(), element.getJSON()));
                res.close();
            }
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
        }

        throw new ghostdriver.InvalidCommandMethod(req);
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

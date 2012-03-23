var ghostdriver = ghostdriver || {};

ghostdriver.SessionReqHand = function(session) {
    // private:
    var
    _protoParent = ghostdriver.SessionReqHand.prototype,
    _session = session,

    _handle = function(req, res) {
        var postObj,
            url;

        _protoParent.handle.call(this, req, res);

        if (req.urlParsed.file === "url") {
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
        }

        throw new ghostdriver.InvalidCommandMethod(req);
    };

    // public:
    return {
        handle : _handle,
        setSession : function(s) { _session = s; }
    };
};
// prototype inheritance:
ghostdriver.SessionReqHand.prototype = new ghostdriver.RequestHandler();

var phantomdriver = phantomdriver || {};

phantomdriver.StatusReqHand = function() {
    // private:
    var
    _protoParent = phantomdriver.StatusReqHand.prototype,
    _statusObj = {
        "build" : {
            "version" : "0.1a",
            "revision" : "none",
            "time" : "20120320"
        },
        "os" : {
            "arch" : "x86",
            "name" : "osx",
            "version" : "10.7.2"
        }
    },

    _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        if (req.method === "GET" && req.urlParsed.file === "status") {
            res.statusCode = 200;
            res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, null, _statusObj));
            res.close();
            return;
        }

        throw new phantomdriver.InvalidCommandMethod(req);
    }

    // public:
    return {
        handle : _handle
    };
};
// prototype inheritance:
phantomdriver.StatusReqHand.prototype = new phantomdriver.RequestHandler();

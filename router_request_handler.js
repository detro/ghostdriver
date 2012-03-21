var phantomdriver = phantomdriver || {};

phantomdriver.RouterReqHand = function() {
    // private:
    var
    _protoParent = phantomdriver.RouterReqHand.prototype;
    var _statusRH = new phantomdriver.StatusReqHand();
    var _sessionManRH = new phantomdriver.SessionManagerReqHand();
    var
    _handle = function(req, res) {
        // Invoke parent implementation
        _protoParent.handle.call(this, req, res);

        try {
            if (req.urlParsed.file === "status") {  // '/status'
                _statusRH.handle(req, res);
            } else if (req.urlParsed.file === "session" || req.urlParsed.file === "sessions") { // '/session' or '/sessions'
                _sessionManRH.handle(req, res);
            } else if (req.urlParsed.path === "/session/") {
                throw new phantomdriver.UnknownCommand(req);
            } else {
                throw new phantomdriver.UnknownCommand(req);
            }
        } catch (e) {
            // Don't know where to Route this!
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.write(e.name + " - " + e.message);
            res.close();
            console.error("ERROR: " + e);
        }
    };

    // public:
    return {
        handle : _handle
    };
};

phantomdriver.RouterReqHand.prototype = new phantomdriver.RequestHandler();

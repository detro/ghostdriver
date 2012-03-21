var phantomdriver = phantomdriver || {};

/**
 * This Class does first level routing: based on the REST Path, sends Request and Response to the right Request Handler.
 */
phantomdriver.RouterReqHand = function() {
    // private:
    var
    _protoParent = phantomdriver.RouterReqHand.prototype,
    _statusRH = new phantomdriver.StatusReqHand(),
    _sessionManRH = new phantomdriver.SessionManagerReqHand(),
    _handle = function(req, res) {
        // Invoke parent implementation
        _protoParent.handle.call(this, req, res);

        try {
            if (req.urlParsed.file === "status") {                  // GET '/status'
                _statusRH.handle(req, res);
            } else if (req.urlParsed.file === "session"             // POST '/session'
                || req.urlParsed.file === "sessions"                // GET '/sessions'
                || req.urlParsed.directory === "/session/") {       // GET or DELETE '/session/:id'
                _sessionManRH.handle(req, res);
            } else {
                throw new phantomdriver.UnknownCommand(req);
            }
        } catch (e) {
            // Don't know where to Route this!
            res.statusCode = 404; //< "404 Not Found"
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
// prototype inheritance:
phantomdriver.RouterReqHand.prototype = new phantomdriver.RequestHandler();

var ghostdriver = ghostdriver || {};

/**
 * This Class does first level routing: based on the REST Path, sends Request and Response to the right Request Handler.
 */
ghostdriver.RouterReqHand = function() {
    // private:
    var
    _protoParent = ghostdriver.RouterReqHand.prototype,
    _statusRH = new ghostdriver.StatusReqHand(),
    _sessionManRH = new ghostdriver.SessionManagerReqHand(),
    _const = {
        STATUS          : "status",
        SESSION         : "session",
        SESSIONS        : "sessions",
        SESSION_DIR     : "/session/"
    },

    _handle = function(req, res) {
        var session,
            sessionId,
            sessionRH;

        // Invoke parent implementation
        _protoParent.handle.call(this, req, res);

        try {
            if (req.urlParsed.file === _const.STATUS) {                             // GET '/status'
                _statusRH.handle(req, res);
            } else if (req.urlParsed.file === _const.SESSION                        // POST '/session'
                || req.urlParsed.file === _const.SESSIONS                           // GET '/sessions'
                || req.urlParsed.directory === _const.SESSION_DIR) {                // GET or DELETE '/session/:id'
                _sessionManRH.handle(req, res);
            } else if (req.urlParsed.path.indexOf(_const.SESSION_DIR) === 0) {      // GET, POST or DELETE '/session/:id/...'
                // Retrieve session
                sessionId = req.urlParsed.pathChunks[1];
                session = _sessionManRH.getSession(sessionId);

                if (session !== null) {
                    sessionRH = new ghostdriver.SessionReqHand(session);

                    // Rebase the "url" to start from AFTER the "/session/:id" part (store the Original URL in 'req.urlOriginal')
                    req.urlOriginal = req.url;
                    req.url = req.urlParsed.path.substr((_const.SESSION_DIR + sessionId).length);
                    // Re-decorate the Request object
                    _protoParent.decorateRequest.call(this, req);

                    sessionRH.handle(req, res);
                } else {
                    throw new ghostdriver.VariableResourceNotFound(req);
                }
            } else {
                throw new ghostdriver.UnknownCommand(req);
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
ghostdriver.RouterReqHand.prototype = new ghostdriver.RequestHandler();

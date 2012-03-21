var ghostdriver = ghostdriver || {};

ghostdriver.SessionManagerReqHand = function() {
    // private:
    var
    _protoParent = ghostdriver.SessionManagerReqHand.prototype,
    _sessions = {}, //< will store key/value pairs like 'SESSION_ID : SESSION_OBJECT'

    _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        if (req.urlParsed.file === "session" && req.method === "POST") {
            _createAndRedirectToNewSession(req, res); return;
        } else if (req.urlParsed.file === "sessions" && req.method === "GET") {
            _listActiveSessions(req, res); return;
        } else if (req.urlParsed.directory === "/session/") {
            if (req.method === "GET") {
                _getSessionCapabilities(req, res); return;
            } else if (req.method === "DELETE") {
                _deleteSession(req, res); return;
            }
        }

        throw new ghostdriver.InvalidCommandMethod(req);
    },

    _createAndRedirectToNewSession = function(req, res) {
        var desiredCapabilities,
            newSession;

        if (typeof(req.post) === "object") {
            desiredCapabilities = req.post;
        } else {
            desiredCapabilities = JSON.parse(req.post);
        }
        // Create and store a new Session
        newSession = new ghostdriver.Session(desiredCapabilities);
        _sessions[newSession.getId()] = newSession;

        // Redirect to the newly created Session
        res.statusCode = 303; //< "303 See Other"
        res.setHeader("Location", "/session/"+newSession.getId());
        res.write("");
        res.close();
    },

    _listActiveSessions = function(req, res) {
        var activeSessions = [],
            sessionId;

        res.statusCode = 200;

        // Create array of format '[{ "id" : SESSION_ID, "capabilities" : SESSION_CAPABILITIES_OBJECT }]'
        for (sessionId in _sessions) {
            activeSessions.push({
                "id" : sessionId,
                "capabilities" : _sessions[sessionId].getCapabilities()
            });
        }

        res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, null, activeSessions));
        res.close();
    },

    _deleteSession = function(req, res) {
        var sId = req.urlParsed.file;

        if (sId === "")
            throw new ghostdriver.MissingCommandParameters(req);

        if (typeof(_sessions[sId]) !== "undefined") {
            // Release resources associated with the page
            _sessions[sId].getPage().release();
            // Delete the session
            delete _sessions[sId];

            res.statusCode = 200;
            res.write("");
            res.close();
        } else {
            throw new VariableResourceNotFound(req);
        }
    },

    _getSessionCapabilities = function(req, res) {
        var sId = req.urlParsed.file;

        if (sId === "")
            throw new ghostdriver.MissingCommandParameters(req);

        if (typeof(_sessions[sId]) !== "undefined") {
            res.statusCode = 200;
            res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, sId, _sessions[sId].getCapabilities()));
            res.close();
        } else {
            throw new ghostdriver.VariableResourceNotFound(req);
        }
    };

    // public:
    return {
        handle : _handle
    };
};
// prototype inheritance:
ghostdriver.SessionManagerReqHand.prototype = new ghostdriver.RequestHandler();

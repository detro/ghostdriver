var ghostdriver = ghostdriver || {};

ghostdriver.SessionManagerReqHand = function() {
    // private:
    var
    _protoParent = ghostdriver.SessionManagerReqHand.prototype,
    _sessions = {}, //< will store key/value pairs like 'SESSION_ID : SESSION_OBJECT'
    _sessionRHs = {},

    _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        if (req.urlParsed.file === "session" && req.method === "POST") {
            _createAndRedirectToNewSessionCommand(req, res);
            return;
        } else if (req.urlParsed.file === "sessions" && req.method === "GET") {
            _listActiveSessionsCommand(req, res);
            return;
        } else if (req.urlParsed.directory === "/session/") {
            if (req.method === "GET") {
                _getSessionCapabilitiesCommand(req, res);
            } else if (req.method === "DELETE") {
                _deleteSessionCommand(req, res);
            }
            return;
        }

        throw new ghostdriver.InvalidCommandMethod(req);
    },

    _createAndRedirectToNewSessionCommand = function(req, res) {
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
        res.closeGracefully();
    },

    _listActiveSessionsCommand = function(req, res) {
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

    _deleteSession = function(sessionId) {
        if (typeof(_sessions[sessionId]) !== "undefined") {
            // Prepare the session to be deleted
            _sessions[sessionId].aboutToDelete();
            // Delete the session and the handler
            delete _sessions[sessionId];
            delete _sessionRHs[sessionId];
        }
    },

    _deleteSessionCommand = function(req, res) {
        var sId = req.urlParsed.file;

        if (sId === "")
            throw new ghostdriver.MissingCommandParameters(req);

        if (typeof(_sessions[sId]) !== "undefined") {
            _deleteSession(sId);
            res.statusCode = 200;
            res.closeGracefully();
        } else {
            throw new VariableResourceNotFound(req);
        }
    },

    _getSessionCapabilitiesCommand = function(req, res) {
        var sId = req.urlParsed.file,
            session;

        if (sId === "")
            throw new ghostdriver.MissingCommandParameters(req);

        session = _getSession(sId);
        if (session !== null) {
            res.statusCode = 200;
            res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, sId, _sessions[sId].getCapabilities()));
            res.close();
        } else {
            throw new ghostdriver.VariableResourceNotFound(req);
        }
    },

    _getSession = function(sessionId) {
        if (typeof(_sessions[sessionId]) !== "undefined") {
            return _sessions[sessionId];
        }
        return null;
    },

    _getSessionReqHand = function(sessionId) {
        if (_getSession(sessionId) !== null) {
            // The session exists: what about the relative Session Request Handler?
            if (typeof(_sessionRHs[sessionId]) === "undefined") {
                _sessionRHs[sessionId] = new ghostdriver.SessionReqHand(_getSession(sessionId));
            }
            return _sessionRHs[sessionId];
        }
        return null;
    },

    _cleanupWindowlessSessions = function() {
        var sId;

        // Do this cleanup only if there are sessions
        if (Object.keys(_sessions).length > 0) {
            console.log("Asynchronous Sessions cleanup phase starting NOW");
            for (sId in _sessions) {
                if (_sessions[sId].getWindowsCount() === 0) {
                    console.log("About to delete Session '"+sId+"', because windowless...");
                    _deleteSession(sId);
                    console.log("... deleted!");
                }
            }
        }
    };

    // Regularly cleanup un-used sessions
    setInterval(_cleanupWindowlessSessions, 60000); //< every 60s

    // public:
    return {
        handle : _handle,
        getSession : _getSession,
        getSessionReqHand : _getSessionReqHand
    };
};
// prototype inheritance:
ghostdriver.SessionManagerReqHand.prototype = new ghostdriver.RequestHandler();

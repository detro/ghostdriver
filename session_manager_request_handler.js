var phantomdriver = phantomdriver || {};

phantomdriver.SessionManagerReqHand = function() {
    // private:
    var
    _protoParent = phantomdriver.SessionManagerReqHand.prototype,
    _sessions = [],

    _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        if (req.urlParsed.file === "session") {
            _createAndRedirectToNewSession(req, res);
        } else if (req.urlParsed.file === "sessions") {
            _listActiveSessions(req, res);
        }
    },

    _createAndRedirectToNewSession = function(req, res) {
        var desiredCapabilities,
            newSession;

        if (req.method === "POST") {
            if (typeof(req.post) === "object") {
                desiredCapabilities = req.post;
            } else {
                desiredCapabilities = JSON.parse(req.post);
            }
            newSession = new phantomdriver.Session(desiredCapabilities);

            _sessions.push(newSession);
            res.statusCode = 303; //< "303 See Other"
            res.setHeader("Location", "/session/"+newSession.getId());
            res.write("");
            res.close();

            return;
        }

        throw new phantomdriver.InvalidCommandMethod();
    },

    _listActiveSessions = function(req, res) {
        var activeSessions = [],
            i, ilen;

        if (req.method === "GET") {
            res.statusCode = 200;

            for (i = 0, ilen = _sessions.length; i < ilen; ++i) {
                activeSessions[i] = {
                    "id" : _sessions[i].getId(),
                    "capabilities" : _sessions[i].getCapabilities()
                }
            }

            res.writeJSON(_protoParent.buildSuccessResponseBody.call(this, null, activeSessions));
            res.close();
            return;
        }

        throw new phantomdriver.InvalidCommandMethod();
    };

    // public:
    return {
        handle : _handle
    };
};

phantomdriver.SessionManagerReqHand.prototype = new phantomdriver.RequestHandler();

var ghostdriver = ghostdriver || {};

ghostdriver.SessionReqHand = function(session) {
    // private:
    var
    _protoParent = ghostdriver.SessionReqHand.prototype,
    _session = session,

    _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        // TODO - Continue from here...

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

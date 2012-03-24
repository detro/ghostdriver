var ghostdriver = ghostdriver || {};

ghostdriver.WebElementReqHand = function(id, session) {
    // private:
    var
    _id = id + '',      //< ensure this is always a string
    _session = session,
    _protoParent = ghostdriver.WebElementReqHand.prototype,
    _const = {
        VALUE               : "value"
    }

    _handle = function(req, res) {
        var postObj,
            i, ilen;

        _protoParent.handle.call(this, req, res);

        // TODO lots to do...

        if (req.urlParsed.file === _const.VALUE && req.method === "POST") {
            postObj = JSON.parse(req.post);
            // Ensure all required parameters are available
            if (typeof(postObj) === "object" && typeof(postObj.value) === "object") {
                for (i = 0, ilen = postObj.value.length; i < ilen; ++i) {
                    console.log("Send keys '"+postObj.value[i]+"' to element '"+_id+"'");
                    // TODO Continue here...
                }
            } else {
                throw new ghostdriver.MissingCommandParameters(req);
            }
        }

        // TODO lots to do...

        throw new ghostdriver.InvalidCommandMethod(req);
    },

    _getJSON = function() {
        return {
            "ELEMENT" : _id
        };
    };

    // public:
    return {
        handle : _handle,
        getId : function() { return _id; },
        getJSON : _getJSON,
        getSession : function() { return _session; }
    };
};
// prototype inheritance:
ghostdriver.WebElementReqHand.prototype = new ghostdriver.RequestHandler();
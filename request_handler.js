var phantomdriver = phantomdriver || {};

phantomdriver.RequestHandler = function() {
    // private:
    var
    _handle = function(request, response) {
        // Decorate the Request object
        request.urlParsed = parseUri(request.url);

        // Decorate the Response object
        response.setHeader("Cache", "no-cache");
        response.setHeader("Content-Type", "application/json;charset=UTF-8");
        response.writeJSON = function(obj) { this.write(JSON.stringify(obj)); };
    },

    _buildResponseBody = function(sessionId, statusCode, value) {
        return {
            "sessionId" : sessionId || null,
            "statusCode" : statusCode || phantomdriver.ResponseStatusCodes.SUCCESS,
            "value" : value || {}
        };
    },

    _buildSuccessResponseBody = function(sessionId, value) {
        return _buildResponseBody(sessionId, phantomdriver.ResponseStatusCodes.SUCCESS, value);
    };

    // public:
    return {
        handle : _handle,
        buildResponseBody : _buildResponseBody,
        buildSuccessResponseBody : _buildSuccessResponseBody
    };
};

// List of all the possible Response Status Codes
phantomdriver.ResponseStatusCodes = {};
phantomdriver.ResponseStatusCodes.SUCCESS                        = 0;
phantomdriver.ResponseStatusCodes.NO_SUCH_ELEMENT                = 7;
phantomdriver.ResponseStatusCodes.NO_SUCH_FRAME                  = 8;
phantomdriver.ResponseStatusCodes.UNKNOWN_COMMAND                = 9;
phantomdriver.ResponseStatusCodes.STALE_ELEMENT_REFERENCE        = 10;
phantomdriver.ResponseStatusCodes.ELEMENT_NOT_VISIBLE            = 11;
phantomdriver.ResponseStatusCodes.INVALID_ELEMENT_STATE          = 12;
phantomdriver.ResponseStatusCodes.UNKNOWN_ERROR                  = 13;
phantomdriver.ResponseStatusCodes.ELEMENT_IS_NOT_SELECTABLE      = 15;
phantomdriver.ResponseStatusCodes.JAVA_SCRIPT_ERROR              = 17;
phantomdriver.ResponseStatusCodes.XPATH_LOOKUP_ERROR             = 19;
phantomdriver.ResponseStatusCodes.TIMEOUT                        = 21;
phantomdriver.ResponseStatusCodes.NO_SUCH_WINDOW                 = 23;
phantomdriver.ResponseStatusCodes.INVALID_COOKIE_DOMAIN          = 24;
phantomdriver.ResponseStatusCodes.UNABLE_TO_SET_COOKIE           = 25;
phantomdriver.ResponseStatusCodes.UNEXPECTED_ALERT_OPEN          = 26;
phantomdriver.ResponseStatusCodes.NO_ALERT_OPEN_ERROR            = 27;
phantomdriver.ResponseStatusCodes.SCRIPT_TIMEOUT                 = 28;
phantomdriver.ResponseStatusCodes.INVALID_ELEMENT_COORDINATES    = 29;
phantomdriver.ResponseStatusCodes.IME_NOT_AVAILABLE              = 30;
phantomdriver.ResponseStatusCodes.IME_ENGINE_ACTIVATION_FAILED   = 31;
phantomdriver.ResponseStatusCodes.INVALID_SELECTOR               = 32;
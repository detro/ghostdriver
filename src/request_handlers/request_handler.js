/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
Copyright (c) 2012, Alex Anderson <@alxndrsn>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var ghostdriver = ghostdriver || {};

ghostdriver.RequestHandler = function() {
    // private:
    var
    _errors = require("./errors.js"),
    _handle = function(request, response) {
        _decorateRequest(request);
        _decorateResponse(response);
    },

    _reroute = function(request, response, prefixToRemove) {
        // Store the original URL before re-routing in 'request.urlOriginal':
        // This is done only for requests never re-routed.
        // We don't want to override the original URL during a second re-routing.
        if (typeof(request.urlOriginal) === "undefined") {
            request.urlOriginal = request.url;
        }

        // Rebase the "url" to start from AFTER the given prefix to remove
        request.url = request.urlParsed.source.substr((prefixToRemove).length);
        // Re-decorate the Request object
        _decorateRequest(request);

        // Handle the re-routed request
        this.handle(request, response);
    },

    _decorateRequest = function(request) {
        request.urlParsed = require("./third_party/parseuri.js").parse(request.url);
    },

    _writeJSONDecorator = function(obj) {
        this.write(JSON.stringify(obj));
    },

    _successDecorator = function(sessionId, value) {
        this.statusCode = 200;
        if (arguments.length > 0) {
            // write something, only if there is something to write
            this.writeJSONAndClose(_buildSuccessResponseBody(sessionId, value));
        } else {
            this.closeGracefully();
        }
    },

    _writeAndCloseDecorator = function(body) {
        this.setHeader("Content-Length", body.length);
        this.write(body);
        this.close();
    },

    _writeJSONAndCloseDecorator = function(obj) {
        var objStr = JSON.stringify(obj);
        this.setHeader("Content-Length", objStr.length);
        this.write(objStr);
        this.close();
    },

    _respondBasedOnResultDecorator = function(session, req, result) {
        //console.log("respondBasedOnResult => "+JSON.stringify(result));

        // Convert string to JSON
        if (typeof(result) === "string") {
            try {
                result = JSON.parse(result);
            } catch (e) {
                // In case the conversion fails, report and "Invalid Command Method" error
                _errors.handleInvalidReqInvalidCommandMethodEH(req, this);
            }
        }

        // In case the JSON doesn't contain the expected fields
        if (result === null ||
            typeof(result) === "undefined" ||
            typeof(result) !== "object" ||
            typeof(result.status) === "undefined" ||
            typeof(result.value) === "undefined") {
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS.UNKNOWN_ERROR,
                "Command failed without producing the expected error report",
                req,
                this,
                session,
                "ReqHand");
            return;
        }

        // An error occurred but we got an error report to use
        if (result.status !== 0) {
            _errors.handleFailedCommandEH(
                _errors.FAILED_CMD_STATUS_CODES_NAMES[result.status],
                result.value.message,
                req,
                this,
                session,
                "ReqHand");
            return;
        }

        // If we arrive here, everything should be fine, birds are singing, the sky is blue
        this.success(session.getId(), result.value);
    },

    _decorateResponse = function(response) {
        response.setHeader("Cache", "no-cache");
        response.setHeader("Content-Type", "application/json;charset=UTF-8");
        response.writeAndClose = _writeAndCloseDecorator;
        response.writeJSON = _writeJSONDecorator;
        response.writeJSONAndClose = _writeJSONAndCloseDecorator;
        response.success = _successDecorator;
        response.respondBasedOnResult = _respondBasedOnResultDecorator;
    },

    _buildResponseBody = function(sessionId, value, statusCode) {
        // Need to check for undefined to prevent errors when trying to return boolean false
        if(typeof(value) === "undefined") value = {};
        return {
            "sessionId" : sessionId || null,
            "status" : statusCode || 0, //< '0' is Success
            "value" : value
        };
    },

    _buildSuccessResponseBody = function(sessionId, value) {
        return _buildResponseBody(sessionId, value, 0); //< '0' is Success
    };

    // public:
    return {
        handle : _handle,
        reroute : _reroute,
        buildResponseBody : _buildResponseBody,
        buildSuccessResponseBody : _buildSuccessResponseBody,
        decorateRequest : _decorateRequest,
        decorateResponse : _decorateResponse
    };
};

// List of all the possible Response Status Codes
ghostdriver.ResponseStatusCodes = {};
ghostdriver.ResponseStatusCodes.SUCCESS                        = 0;
ghostdriver.ResponseStatusCodes.NO_SUCH_ELEMENT                = 7;
ghostdriver.ResponseStatusCodes.NO_SUCH_FRAME                  = 8;
ghostdriver.ResponseStatusCodes.UNKNOWN_COMMAND                = 9;
ghostdriver.ResponseStatusCodes.STALE_ELEMENT_REFERENCE        = 10;
ghostdriver.ResponseStatusCodes.ELEMENT_NOT_VISIBLE            = 11;
ghostdriver.ResponseStatusCodes.INVALID_ELEMENT_STATE          = 12;
ghostdriver.ResponseStatusCodes.UNKNOWN_ERROR                  = 13;
ghostdriver.ResponseStatusCodes.ELEMENT_IS_NOT_SELECTABLE      = 15;
ghostdriver.ResponseStatusCodes.JAVA_SCRIPT_ERROR              = 17;
ghostdriver.ResponseStatusCodes.XPATH_LOOKUP_ERROR             = 19;
ghostdriver.ResponseStatusCodes.TIMEOUT                        = 21;
ghostdriver.ResponseStatusCodes.NO_SUCH_WINDOW                 = 23;
ghostdriver.ResponseStatusCodes.INVALID_COOKIE_DOMAIN          = 24;
ghostdriver.ResponseStatusCodes.UNABLE_TO_SET_COOKIE           = 25;
ghostdriver.ResponseStatusCodes.UNEXPECTED_ALERT_OPEN          = 26;
ghostdriver.ResponseStatusCodes.NO_ALERT_OPEN_ERROR            = 27;
ghostdriver.ResponseStatusCodes.SCRIPT_TIMEOUT                 = 28;
ghostdriver.ResponseStatusCodes.INVALID_ELEMENT_COORDINATES    = 29;
ghostdriver.ResponseStatusCodes.IME_NOT_AVAILABLE              = 30;
ghostdriver.ResponseStatusCodes.IME_ENGINE_ACTIVATION_FAILED   = 31;
ghostdriver.ResponseStatusCodes.INVALID_SELECTOR               = 32;

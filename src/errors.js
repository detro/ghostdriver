/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
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

//------------------------------------------------------- Invalid Request Errors
//----- http://code.google.com/p/selenium/wiki/JsonWireProtocol#Invalid_Requests
exports.INVALID_REQ = {
    "UNKNOWN_COMMAND"               : "Unknown Command",
    "UNIMPLEMENTED_COMMAND"         : "Unimplemented Command",
    "VARIABLE_RESOURCE_NOT_FOUND"   : "Variable Resource Not Found",
    "INVALID_COMMAND_METHOD"        : "Invalid Command Method",
    "MISSING_COMMAND_PARAMETER"     : "Missing Command Parameter"
};

var _invalidReqHandle = function(res) {
    // Set the right Status Code
    switch(this.name) {
        case exports.INVALID_REQ.UNIMPLEMENTED_COMMAND:
            res.statusCode = 501;   //< 501 Not Implemented
            break;
        case exports.INVALID_REQ.INVALID_COMMAND_METHOD:
            res.statusCode = 405;   //< 405 Method Not Allowed
            break;
        case exports.INVALID_REQ.MISSING_COMMAND_PARAMETER:
            res.statusCode = 400;   //< 400 Bad Request
            break;
        default:
            res.statusCode = 404;   //< 404 Not Found
            break;
    }

    res.setHeader("Content-Type", "text/plain");
    res.write(this.name + " - " + this.message);
    res.close();
};

exports.createInvalidReqEH = function(errorName, req) {
    var e = new Error();

    e.name = errorName;
    e.message = "Request => " + JSON.stringify(req);
    e.handle = _invalidReqHandle;

    return e;
};
exports.createInvalidReqUnknownCommandEH = function(req) {
    return exports.createInvalidReqEH (
        exports.INVALID_REQ.UNKNOWN_COMMAND,
        req);
};
exports.createInvalidReqUnimplementedCommandEH = function(req) {
    return exports.createInvalidReqEH (
        exports.INVALID_REQ.UNIMPLEMENTED_COMMAND,
        req);
};
exports.createInvalidReqVariableResourceNotFoundEH = function(req) {
    return exports.createInvalidReqEH (
        exports.INVALID_REQ.VARIABLE_RESOURCE_NOT_FOUND,
        req);
};
exports.createInvalidReqInvalidCommandMethodEH = function(req) {
    return exports.createInvalidReqEH (
        exports.INVALID_REQ.INVALID_COMMAND_METHOD,
        req);
};
exports.createInvalidReqMissingCommandParameterEH = function(req) {
    return exports.createInvalidReqEH (
        exports.INVALID_REQ.MISSING_COMMAND_PARAMETER,
        req);
};

//-------------------------------------------------------- Failed Command Errors
//------ http://code.google.com/p/selenium/wiki/JsonWireProtocol#Failed_Commands
exports.createFailedCommandEH = function(errorName, errorMsg, req, session) {

};



// var ghostdriver = ghostdriver || {};

// // Invalid Command Method
// ghostdriver.InvalidCommandMethod = function(req) {
//     this.name = "InvalidCommandMethod";
//     if (typeof(req) === "object") {
//         this.message = "Request = "+JSON.stringify(req);
//     } else {
//         this.message = req || "";
//     }
// };
// ghostdriver.InvalidCommandMethod.prototype = Error.prototype;

// // Unknown Command
// ghostdriver.UnknownCommand = function(req) {
//     this.name = "UnknownCommand";
//     if (typeof(req) === "object") {
//         this.message = "Request = "+JSON.stringify(req);
//     } else {
//         this.message = req || "";
//     }
// };
// ghostdriver.UnknownCommand.prototype = Error.prototype;

// // Variable Resource Not Found
// ghostdriver.VariableResourceNotFound = function(req) {
//     this.name = "VariableResourceNotFound";
//     if (typeof(req) === "object") {
//         this.message = "Request = "+JSON.stringify(req);
//     } else {
//         this.message = req || "";
//     }
// };
// ghostdriver.VariableResourceNotFound.prototype = Error.prototype;

// // Missing Command Parameters
// ghostdriver.MissingCommandParameters = function(req) {
//     this.name = "MissingCommandParameters";
//     if (typeof(req) === "object") {
//         this.message = "Request = "+JSON.stringify(req);
//     } else {
//         this.message = req || "";
//     }
// };
// ghostdriver.MissingCommandParameters.prototype = Error.prototype;

// // No Such Element
// ghostdriver.NoSuchElement = function(msg) {
//     this.name = "NoSuchElement";
//     this.message = (typeof(msg) === "object") ? JSON.stringify(msg) : msg || "";
// };
// ghostdriver.NoSuchElement.prototype = Error.prototype;

// // XPath Lookup Error
// ghostdriver.XPathLookupError = function(msg) {
//     this.name = "XPathLookupError";
//     this.message = (typeof(msg) === "object") ? JSON.stringify(msg) : msg || "";
// };
// ghostdriver.XPathLookupError.prototype = Error.prototype;

// // Stale Element Reference
// ghostdriver.StaleElementReference = function(msg) {
//     this.name = "StaleElementReference";
//     this.message = (typeof(msg) === "object") ? JSON.stringify(msg) : msg || "";
// };
// ghostdriver.StaleElementReference.prototype = Error.prototype;

// // Element Not Visible
// ghostdriver.ElementNotVisible = function(msg) {
//     this.name = "ElementNotVisible";
//     this.message = (typeof(msg) === "object") ? JSON.stringify(msg) : msg || "";
// };
// ghostdriver.ElementNotVisible.prototype = Error.prototype;

// // No Such Window
// ghostdriver.NoSuchWindow = function(msg) {
//     this.name = "NoSuchWindow";
//     this.message = (typeof(msg) === "object") ? JSON.stringify(msg) : msg || "";
// };
// ghostdriver.NoSuchWindow.prototype = Error.prototype;

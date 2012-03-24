var ghostdriver = ghostdriver || {};

// Invalid Command Method
ghostdriver.InvalidCommandMethod = function(req) {
    this.name = "InvalidCommandMethod";
    if (typeof(req) === "object") {
        this.message = "Request = "+JSON.stringify(req);
    } else {
        this.message = req || "";
    }
};
ghostdriver.InvalidCommandMethod.prototype = Error.prototype;

// Unknown Command
ghostdriver.UnknownCommand = function(req) {
    this.name = "UnknownCommand";
    if (typeof(req) === "object") {
        this.message = "Request = "+JSON.stringify(req);
    } else {
        this.message = req || "";
    }
};
ghostdriver.UnknownCommand.prototype = Error.prototype;

// Variable Resource Not Found
ghostdriver.VariableResourceNotFound = function(req) {
    this.name = "VariableResourceNotFound";
    if (typeof(req) === "object") {
        this.message = "Request = "+JSON.stringify(req);
    } else {
        this.message = req || "";
    }
};
ghostdriver.VariableResourceNotFound.prototype = Error.prototype;

// Missing Command Parameters
ghostdriver.MissingCommandParameters = function(req) {
    this.name = "MissingCommandParameters";
    if (typeof(req) === "object") {
        this.message = "Request = "+JSON.stringify(req);
    } else {
        this.message = req || "";
    }
};
ghostdriver.MissingCommandParameters.prototype = Error.prototype;

// No Such Element
ghostdriver.NoSuchElement = function(msg) {
    this.name = "NoSuchElement";
    this.message = (typeof(msg) === "object") ? JSON.stringify(msg) : msg || "";
};
ghostdriver.NoSuchElement.prototype = Error.prototype;

// XPath Lookup Error
ghostdriver.XPathLookupError = function(msg) {
    this.name = "XPathLookupError";
    this.message = (typeof(msg) === "object") ? JSON.stringify(msg) : msg || "";
};
ghostdriver.XPathLookupError.prototype = Error.prototype;
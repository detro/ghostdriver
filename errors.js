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
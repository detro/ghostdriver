var phantomdriver = phantomdriver || {};

// Invalid Command Method
phantomdriver.InvalidCommandMethod = function(req) {
    this.name = "InvalidCommandMethod";
    if (typeof(req) === "object") {
        this.message = "Request = "+JSON.stringify(req);
    } else {
        this.message = req || "";
    }
};
phantomdriver.InvalidCommandMethod.prototype = Error.prototype;

// Unknown Command
phantomdriver.UnknownCommand = function(req) {
    this.name = "UnknownCommand";
    if (typeof(req) === "object") {
        this.message = "Request = "+JSON.stringify(req);
    } else {
        this.message = req || "";
    }
};
phantomdriver.UnknownCommand.prototype = Error.prototype;

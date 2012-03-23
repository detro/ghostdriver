// Load dependencies
// NOTE: We need to provide PhantomJS with the "require" module ASAP. This is a pretty s**t way to load dependencies
var ghostdriver = ghostdriver || {},
    system = require('system'),
    server = require('webserver').create(),
    router;
phantom.injectJs("utils/parseuri.js");
phantom.injectJs("errors.js");
phantom.injectJs("session.js");
phantom.injectJs("request_handlers/request_handler.js");
phantom.injectJs("request_handlers/status_request_handler.js");
phantom.injectJs("request_handlers/session_manager_request_handler.js");
phantom.injectJs("request_handlers/session_request_handler.js");
phantom.injectJs("request_handlers/router_request_handler.js");

// Enable "strict mode" for the 'parseUri' library
parseUri.options.strictMode = true;

// HTTP Request Router
router = new ghostdriver.RouterReqHand();

// Start the server
if (server.listen(system.args[1] || 8080, router.handle)) {
    console.log('Ghost Driver running on port ' + server.port);
} else {
    console.error("ERROR: Could not start Ghost Driver");
    phantom.exit();
}

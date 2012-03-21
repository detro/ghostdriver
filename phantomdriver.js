// Load dependencies
// NOTE: We need to provide PhantomJS with the "require" module ASAP. This is a pretty s**t way to load dependencies
var phantomdriver = phantomdriver || {},
    system = require('system'),
    server = require('webserver').create(),
    router;
phantom.injectJs("utils/parseuri.js");
phantom.injectJs("errors.js");
phantom.injectJs("session.js");
phantom.injectJs("request_handler.js");
phantom.injectJs("status_request_handler.js");
phantom.injectJs("session_manager_request_handler.js");
phantom.injectJs("router_request_handler.js");

// Enable "strict mode" for the 'parseUri' library
parseUri.options.strictMode = true;

// HTTP Request Router
router = new phantomdriver.RouterReqHand();

// Start the server
if (server.listen(system.args[1] || 8080, router.handle)) {
    console.log('PhantomDriver running on port ' + server.port);
} else {
    console.error("ERROR: Could not start PhantomDriver");
    phantom.exit();
}

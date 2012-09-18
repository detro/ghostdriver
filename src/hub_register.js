/* generate node configuration for this node */
var nodeconf = function(port, hub){
  var ref$, hubHost, hubPort;
  ref$ = hub.match(/([\w\d\.]+):(\d+)/), hubHost = ref$[1], hubPort = ref$[2];
  hubPort = +hubPort;
  return {
    capabilities: [{
      browserName: "phantomjs",
      maxInstances: 5,
      seleniumProtocol: "WebDriver"
    }],
    configuration: {
      hub: hub,
      hubHost: hubHost,
      hubPort: hubPort,
      port: port,
      proxy: "org.openqa.grid.selenium.proxy.DefaultRemoteProxy",
      maxSession: 5,
      register: true,
      registerCycle: 5000,
      role: "wd",
      url: "http://127.0.0.1:" + port,
      remoteHost: "http://127.0.0.1:" + port
    }
  };
};

module.exports = {
  register: function(port, hub){
    var page = require('webpage').create();
    port = +port;
    if (!hub.match(/\/$/)) {
      hub += '/';
    }

    /* Register with selenium grid server */
    page.open(hub + 'grid/register', {
      operation: 'post',
      data: JSON.stringify(nodeconf(port, hub)),
      headers: {
        'Content-Type': 'application/json'
      }
    }, function(status){
      if (status !== 'success') {
        return console.log("Unable to register with grid " + hub + ": " + status);
      } else {
        return console.log(("registered with grid hub: " + hub) + page.content);
      }
    });
  }
};

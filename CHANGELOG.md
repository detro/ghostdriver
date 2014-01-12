# CHANGELOG

## v1.1.1 (2014-01-12) ([issues](https://github.com/detro/ghostdriver/issues?labels=1.1.1&state=closed))

### JavaScript Driver (Core)
* ENHANCEMENT #170: Implement Session Isolation

## v1.1.0 (2014-01-01) ([issues](https://github.com/detro/ghostdriver/issues?labels=1.1.0&state=closed))

### JavaScript Driver (Core)
* ENHANCEMENT: `/maximize` window will set the window size to 1336x768,
currently most common resolution online (see [statcounter](http://gs.statcounter.com/#resolution-ww-monthly-201307-201312))
* ENHANCEMENT #275: Implemented Browser and Network (HAR) Logging types
* FIXED #284: Attempt to wait for Page to Load if input causes form submit
* FIXED #291: Throw exception when attempting to set invalid timeout value
* FIXED #259: Fix issue regarding mouse clicks
* ENHANCEMENT #290: Enabled support for "Keep Alive" HTTP connections
* ENHANCEMENT #262: Allow access to PhantomJS API from WebDriver (Driver part)
* ENHANCEMENT #293: Import Selenium 2.39.0 WebDriver Atoms

### Java Binding
* MINOR #251: Minor compilation issues for Binding
* ENHANCEMENT #262: Allow access to PhantomJS API from WebDriver (Java Binding part)

## v1.0.4 (2013-07-25) ([issues](https://github.com/detro/ghostdriver/issues?labels=1.0.4&state=closed))

### JavaScript Driver (Core)
* ENHANCEMENT: Completely refactored the way events that initiate PAGE_LOAD events are handled
* FIX #18: Now GhostDriver works when enabling `--remote-debugger-port=PORT` in PhantomJS
* FIX #180: Avoid crashes when JS execution invokes `window.close()`
* ENHANCEMENT #202: Ignore page load failures initiated by Click action (like other Drivers)
* ENHANCEMENT #208: Added the ability to shutdown logging (i.e. Log Level `OFF` or `NONE`)
* ENHANCEMENT #210: Ensuring we don't switch windows via empty string
* FIX #213: `mouseButtonDown` was broken
* FIX #215: Improve URL parsing to ensure we don't take `/status` as a URL instead of part of the protocol
* FIX #216: Fixed issue where sometimes a failed click would cause a `Parse error`
* ENHANCEMENT #228: Allow the setting of `page.customheaders` via Capabilities
* FIX #240: Stopping all ongoing HTTP requests before starting to "wait for page load" was not a good idea
* ENHANCEMENT #242: Trim URL before trying to load it
* FIX #247: Implement changes to "HTTP POST /session" as per new WireProtocol specs

### Java Binding
* ENHANCEMENT/FIX #179: Suppor for `.withLog(logfile)` option when using `PhantomJSDriverService`
* ENHANCEMENT #228: Support in the Java Bindings to set `page.customheaders` via Capabilities
* FIX 246: Avoid Cast Exception in Binding when passing `phantomjs.cli.args` through Selenium Server or Grid

### PhantomJS (code in PhantomJS master repo)
* FIX #204: PhantomJS `webserver` module should not assume UPPERCASE or lowercase for HTTP headers, as per [RFC 2616](http://www.ietf.org/rfc/rfc2616.txt) - [see also](https://github.com/ariya/phantomjs/issues/11421)

### Test
* Many more Java test to prove or disprove issues that have been submitted

## v1.0.3 (2013-03-18) ([issues](https://github.com/detro/ghostdriver/issues?labels=1.0.3&state=closed))

### JavaScript Driver (Core)
* FIX: Rewritten code that deals with "wait for Page Load" on Clicks (based on new `page.loading` property - see below) - This closed multiple issues
* FIX: `sendKeys('\n')` should deliver an `Enter` keycode, not `Return`
* FIX: New Sessions have at least 1 Window on creation: this stops the `_cleanWindowlessSessions` code to delete brand new session that haven't yet been used
* FIX: Handle Frame-Switching when frame has no name
* FIX: Handle Frame-Switching when frame has no name and no #id
* FIX: Ensure File exists before attempting Upload
* ENHANCEMENT: Upgraded WebDriver Atoms to **Selenium 2.31.0**

### Java Binding
* FIX: Issues with "save_screenshot" method
* FIX: Java Binding should handle Proxy configuration provided as a Map in the Capabilities (like Ruby or NodeJS bindings do)
* FIX: `PhantomJSDriver.Builder.withLogFile()` is now implemented correctly and not ignored
* ENHANCEMENT: Ability to pass CLI Arguments to PhantomJS process via Capability `phantomjs.cli.args`

### PhantomJS (code in PhantomJS master repo)
* ENHANCEMENT: Added properties `page.loading` and `page.loadingProgress` to help track Page Loading


## v1.0.2 (2012-12-20) ([issues](https://github.com/detro/ghostdriver/issues?labels=1.0.2&state=closed))

### JavaScript Driver (Core)
* FIX: Wait for potential "Page Load" when "Element.click()" is used on MORE Elements


## v1.0.1 (2012-12-15) ([issues](https://github.com/detro/ghostdriver/issues?labels=1.0.1&state=closed))

### JavaScript Driver (Core)
* ENHANCEMENT: Allow to set `page.settings` via Capabilities
* FIX: At least 1 "current window handle" should be available on a new WebDriver instance
* FIX: SwitchTo().Window() using the Window Handle
* FIX: Invalid response when checking element equality
* ENHANCEMENT: Wait for potential "Page Load" when "Element.click()" is used
* ENHANCEMENT: Command `/shutdown` arrives via HTTP HEAD in some language bindings
* ENHANCEMENT: Timeouts must be set to INFINITE by default

### PhantomJS (code in PhantomJS master repo)
* FIX: Command line argument --webdriver-selenium-grid-hub is not taken into account

### Java Binding
* BUG: PhantomJSDriverService replaced by DriverService in PhantomJSDriver constructor


## v1.0.0 (2012-11-25)
### JavaScript Driver (Core)
* Implemented all the WireProtocol commands planned for 1.0.0 ([see spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Am63grtxc7bDdGNqX1ZPX2VoZlE2ZHZhd09lNDkzbkE))

### Java Binding
* Java Binding `jar` files created in `/binding/java/jars`
* Bindings committed as _third party library_ into the Selenium project ([commit](https://code.google.com/p/selenium/source/detail?r=18187))

### Tests
* Java tests cover _just about_ what's needed
* Python test are just a stub


# CHANGELOG

## v1.0.3 (2013-03-18) ([issues](https://github.com/detro/ghostdriver/issues?labels=1.0.3&state=closed))

### JavaScript Driver (Core)
* FIX: Rewritten code that deals with "wait for Page Load" on Clicks (based on new `page.loading` property - see below) - This closed multiple issues
* FIX: `sendKeys('\n')` should deliver an `Enter` keycode, not `Return`
* FIX: New Sessions have at least 1 Window on creation: this stops the `_cleanWindowlessSessions` code to delete brand new session that haven't yet been used
* FIX: Handle Frame-Switching when frame has no name
* FIX: Handle Frame-Switching when frame has no name and no #id
* FIX: Ensure File exists before attempting Upload
* ENHANCEMENT: Upgraded WebDriver Atoms to **Selenium 2.31.0**

### Binding
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

### Binding
* BUG: PhantomJSDriverService replaced by DriverService in PhantomJSDriver constructor


## v1.0.0 (2012-11-25)
### JavaScript Driver (Core)
* Implemented all the WireProtocol commands planned for 1.0.0 ([see spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Am63grtxc7bDdGNqX1ZPX2VoZlE2ZHZhd09lNDkzbkE))

### Binding
* Java Binding `jar` files created in `/binding/java/jars`
* Bindings committed as _third party library_ into the Selenium project ([commit](https://code.google.com/p/selenium/source/detail?r=18187))

### Tests
* Java tests cover _just about_ what's needed
* Python test are just a stub


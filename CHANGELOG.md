# CHANGELOG

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

---

## v1.0.0 (2012-11-25)
### JavaScript Driver (Core)
* Implemented all the WireProtocol commands planned for 1.0.0 ([see spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Am63grtxc7bDdGNqX1ZPX2VoZlE2ZHZhd09lNDkzbkE))

### Binding
* Java Binding `jar` files created in `/binding/java/jars`
* Bindings committed as _third party library_ into the Selenium project ([commit](https://code.google.com/p/selenium/source/detail?r=18187))

### Tests
* Java tests cover _just about_ what's needed
* Python test are just a stub

---

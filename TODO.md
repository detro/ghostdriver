# Important

* Implement all the commands :)
    * "/session/:sessionid/element" and "/session/:sessionid/elements" need to be handled into 1 (++gracefulness)
* Typing simulation: I want to use something like [jquery autotype](https://github.com/mmonteleone/jquery.autotype/blob/master/jquery.autotype.js)
* Support for Proxying
* Support for Screenshots
* Proper Capabilities negotiation
* Subclass "RemoteWebDriver" to make setup via simple API
* Add support for Frames and IFrames in PhantomJS
    * And than add it to the driver
* I need to inject something like jQuery in the target webpages (or use the WebDriver JS code already available on the Selenium Repository)

# Low Priority
* Refactor all the Erros in "error.js" to allow an optional, custom Error Handling.
    * This will help to comply with [Wire Protocol Error Handling](http://code.google.com/p/selenium/wiki/JsonWireProtocol#Error_Handling)
    * See "error.js/InvalidCommandMethod"
* Add another kind of "Error", like "CommandFailed", that have a different error handling and report
    * See [Wire Protocol Failed Commands Error Handling](http://code.google.com/p/selenium/wiki/JsonWireProtocol#Failed_Commands)
* More complex examples

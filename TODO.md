# Top Priority

* Decorate req/res objects OR extend SessionReqHand to better manage "after open is done" scenarios
* Implement all the commands :)
    * "/session/:sessionid/element" and "/session/:sessionid/elements" need to be handled into 1 (++gracefulness)


# Mid Priority

* Support for Proxying
* Support for Screenshots
* Proper Capabilities negotiation


# Low Priority

* Subclass "RemoteWebDriver" to make setup via simple API
* Refactor all the Erros in "error.js" to allow an optional, custom Error Handling.
    * This will help to comply with [Wire Protocol Error Handling](http://code.google.com/p/selenium/wiki/JsonWireProtocol#Error_Handling)
    * See "error.js/InvalidCommandMethod"
* Add another kind of "Error", like "CommandFailed", that have a different error handling and report
    * See [Wire Protocol Failed Commands Error Handling](http://code.google.com/p/selenium/wiki/JsonWireProtocol#Failed_Commands)
* More complex examples


# Things to add to PhantomJS

* Ability to read informations like Operating System, Architecture and so forth
* Ability to handle "alert(), confirm() and prompt()"
* PhantomJS "res.write()" doesn't set the 'Content-Length' header automatically :(
* Add support for Frames and IFrames in PhantomJS
    * And than add it to the driver

# Important

* "/session/:sessionid/element" and "/session/:sessionid/elements" need to be handled into 1 (++gracefulness)
*

# Low Priority
* Refactor all the Erros in "error.js" to allow an optional, custom Error Handling.
** This will help to comply with [Wire Protocol Error Handling](http://code.google.com/p/selenium/wiki/JsonWireProtocol#Error_Handling)
** See "error.js/InvalidCommandMethod"
* Add another kind of "Error", like "CommandFailed", that have a different error handling and report
** See [Wire Protocol Failed Commands Error Handling](http://code.google.com/p/selenium/wiki/JsonWireProtocol#Failed_Commands)

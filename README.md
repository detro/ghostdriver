# Ghost Driver

Ghost Driver is a pure JavaScript implementation of the [WebDriver Wire Protocol](http://code.google.com/p/selenium/wiki/JsonWireProtocol) for [PhantomJS](http://phantomjs.org/).
This aims at providing a Remote WebDriver that uses PhantomJS as back-end.

**It's still highly experimental: don't use (yet) in production!**

## How to use it

There is plenty to do before this is usable, but if you can't wait to try PhantomJS's speed when it acts as a RemoteWebDriver Server, do the following:

1. Start GhostDriver on a terminal:

    $> phantomjs ghostdriver/main.js
    Ghost Driver running on port 8080

2. Build and Launch the first Java-based example from:

    $> ghostdriver/examples/google_cheese/

3. Enjoy

## Reasoning: pros and cons

### Pros of using an Headless browser for your Selenium testing
* Speed
* Speed makes development faster
* Speed makes THE developer happier
* Speed makes leaves more time for beer, video-games, cycling or whatever you fancy
* ...

### Cons of using an Headless browser for your Selenium testing
* PhantomJS is not a "Real" Browser, just very very close to it
* ...

## Contributions

You can contribute testing it and reporting bugs and issues, or submitting Pull Requests.
_Any help is more than welcome!!!_

## License
**TODO**
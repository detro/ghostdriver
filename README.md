** * * * * * * * * * * * * **

**PLEASE NOTE**

**0 - IT'S NOT DONE! The only commands implemented are the one used by the `examples/google_cheese/` directory**

**1 - It's still experimental**

**2 - Not ready for Production**

**3 - Only 13 of the >90 WireProtocol Commands implemented**

**4 - I released it to get people interested in contributing. Not to provide a solution: it's not ready yet!**

** * * * * * * * * * * * * **

# Ghost Driver

Ghost Driver is a pure JavaScript implementation of the [WebDriver Wire Protocol](http://code.google.com/p/selenium/wiki/JsonWireProtocol) for [PhantomJS](http://phantomjs.org/).
This aims at providing a Remote WebDriver that uses PhantomJS as back-end.

## Requirements

* PhantomJS version `>= 1.6`
* Maven 3 (optional - makes it easy to build & run the examples)

## How to use it

There is plenty to do before this is usable, but if you can't wait to try PhantomJS's speed when it acts as a RemoteWebDriver Server, do the following:

1. Start GhostDriver on a terminal:

    ```bash
    $> phantomjs ghostdriver/main.js
    Ghost Driver running on port 8080
    ```

2. Build and Launch the first Java-based example ([Maven](http://maven.apache.org/) required):

    ```bash
    $> cd ghostdriver/examples/google_cheese/
    $> ./mvnexec.sh
    ...
    [INFO] Building ghostdriver 1.0
    [INFO] ------------------------------------------------------------------------
    [INFO]
    [INFO] >>> exec-maven-plugin:1.2.1:java (default-cli) @ google_cheese >>>
    [INFO]
    [INFO] <<< exec-maven-plugin:1.2.1:java (default-cli) @ google_cheese <<<
    [INFO]
    [INFO] --- exec-maven-plugin:1.2.1:java (default-cli) @ google_cheese ---
    *** USING GHOSTDRIVER ***
    Loading 'http://www.google.com'...
    Loaded. Current URL is: 'http://www.google.co.uk/'
    Finding an Element via [name='q']...
    Found.
    Sending keys 'Cheese!...'
    Sent.
    Submitting Element...
    Submitted.
    Page title is: Cheese! - Google Search
    Time elapsed (ms): 1531
    [INFO] ------------------------------------------------------------------------
    [INFO] BUILD SUCCESS
    ...
    ```

3. Enjoy

For a quick speed comparison with other WebDriver implementations, try passing the parameter `firefox` or `chrome` to the `./mvnexec.sh` script.

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

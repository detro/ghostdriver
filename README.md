** * * * * * * * * * * * * **

**PLEASE NOTE**

**0 - IT'S NOT DONE! The only commands implemented are the one used by the `examples/google_cheese/` directory**

**1 - It's still experimental**

**2 - Not ready for Production**

**3 - Only 13 of the >90 WireProtocol Commands implemented**

**4 - I released it to get people interested in contributing. Not to provide a solution: it's not ready yet!**

** * * * * * * * * * * * * **

# Ghost Driver

Ghost Driver is a pure JavaScript implementation of the [WebDriver Wire Protocol](http://code.google.com/p/selenium/wiki/JsonWireProtocol)
for [PhantomJS](http://phantomjs.org/).
This aims at providing a Remote WebDriver that uses PhantomJS as back-end.

## Presentation and Slides

In April 2012 I presented GhostDriver at the [Selenium Conference](http://www.seleniumconf.org/speakers/#IDM):
[slides](http://detro.github.com/ghostdriver/slides/index.html)
and
[video](http://blog.ivandemarino.me/2012/05/01/Me-the-Selenium-Conference-2012).

## Requirements

* PhantomJS version `>= 1.6`

## How to use it

There is plenty to do before this is usable, but if you can't wait to try PhantomJS's speed when it acts as a RemoteWebDriver Server, do the following:

1. Start GhostDriver on a terminal:

    ```bash
    $> phantomjs ghostdriver/src/main.js
    Ghost Driver running on port 8080
    ```

2. Build and Launch the first Java-based example (to build we use [Gradle](http://www.gradle.org/), already included):

    ```bash
    $> cd ghostdriver/examples/google_cheese/
    $> ./gradlew execServer -Pargs="1 8080"
    ```

For a quick speed comparison with other WebDriver implementations, try passing the parameter `firefox` or `chrome` to the `./mvnexec.sh` script.

## Reasoning: pros and cons

### Pros of using an Headless browser for your Selenium testing
* Speed: makes development faster
* Speed: makes THE developer happier
* Speed: makes leaves more time for beer, video-games, cycling or whatever you fancy
* ...

### Cons of using an Headless browser for your Selenium testing
* PhantomJS is not a "Real" Browser, but _"just"_ very very close to on

## Contributions

You can contribute testing it and reporting bugs and issues, or submitting Pull Requests.
_Any help is more than welcome!!!_

## License
GhostDriver is distributed under [BSD License](http://www.opensource.org/licenses/BSD-2-Clause).

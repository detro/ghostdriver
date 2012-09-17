# Ghost Driver

Ghost Driver is a pure JavaScript implementation of the
[WebDriver Wire Protocol](http://code.google.com/p/selenium/wiki/JsonWireProtocol)
for [PhantomJS](http://phantomjs.org/).
It's going to be a Remote WebDriver that uses PhantomJS as back-end.

## Status

* Under development / almost ready for 1.0
* **~80%** of the WireProtocol currently implemented
* You can monitor development progress [at this Google Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Am63grtxc7bDdGNqX1ZPX2VoZlE2ZHZhd09lNDkzbkE)
* Core released to get people interested and get contributions
* Don't raise BUGS: send PULL REQUESTS pleaase!
* Version 1.0 will implement all the commands EXCEPT the ones related with Mobile WebDrivers (see spreadsheet above)

## Presentation and Slides

In April 2012 I (Ivan De Marino) presented GhostDriver at the
[Selenium Conference](http://www.seleniumconf.org/speakers/#IDM):
[slides](http://cdn.ivandemarino.me/slides/speed_up_selenium_with_phantomjs/index.html)
and
[video](http://blog.ivandemarino.me/2012/05/01/Me-the-Selenium-Conference-2012).

## Requirements

* PhantomJS [ghostdriver-dev branch](https://github.com/detro/phantomjs/tree/ghostdriver-dev),
taken from my (Ivan De Marino) port: [github.com/detro/phantomjs](https://github.com/detro/phantomjs).

## How to use it

Check out the [ghostdriver-dev branch](https://github.com/detro/phantomjs/tree/ghostdriver-dev)
of PhantomJS, and build it (I assume you know Git).

There is **plenty to do before this is usable**, but if you can't wait to try
PhantomJS's speed when it acts as a RemoteWebDriver Server, do the following:

1. Start GhostDriver on a terminal:

    ```bash
    $> phantomjs ghostdriver/src/main.js
    Ghost Driver running on port 8080
    ```

2. Build and Launch the test suite (written in Java, built with [Gradle](http://www.gradle.org/)):

    ```bash
    $> cd ghostdriver/test
    $> ./gradlew test
    ```

3. Register ghost driver with a selenium grid hub

    ````bash
    # launch the grid server, which listens on 4444
    $> java -jar /path/to/selenium-server-standalone-2.25.0.jar -role hub
    # register with hub
    $> phantomjs ghostdriver/src/main.js 8080 http://127.0.0.1:4444
    ```

    Now you can use your normal webdriver client with http://127.0.0.1:4444 and just request browserName: phantomjs!

    Note that simply point your webdriver client to the port GhostDriver listens to also works.

## Reasoning: pros and cons

### Pros of using an Headless browser for your Selenium testing
* Speed: makes development faster
* Speed: makes THE developer happier
* Speed: makes leaves more time for beer, video-games, cycling or whatever you fancy
* ...

### Cons of using an Headless browser for your Selenium testing
* PhantomJS is not a "Real" Browser, but _"just"_ very very close to one

## Contributions

You can contribute testing it and reporting bugs and issues, or submitting Pull Requests.
Any **help is welcome**, but bear in mind the following base principles:

* Squash your commits by theme: I prefer a clean, readable log
* Maintain consistency with the code-style you are surrounded by
* If you are going to make a big, substantial change, let's discuss it first

## License
GhostDriver is distributed under [BSD License](http://www.opensource.org/licenses/BSD-2-Clause).

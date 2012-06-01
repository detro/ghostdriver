# Ghost Driver

Ghost Driver is a pure JavaScript implementation of the
[WebDriver Wire Protocol](http://code.google.com/p/selenium/wiki/JsonWireProtocol)
for [PhantomJS](http://phantomjs.org/).
It's going to be a Remote WebDriver that uses PhantomJS as back-end.

## Status

* Under development
* Far from complete
* Only **~20%** of the WireProtocol currently implemented
* You can monitor development progress [at this Google Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Am63grtxc7bDdGNqX1ZPX2VoZlE2ZHZhd09lNDkzbkE)
* Core released to get people interested and get contributions
* Don't raise BUGS: send PULL REQUESTS pleaase!

## Presentation and Slides

In April 2012 Ivan De Marino presented GhostDriver at the [Selenium Conference](http://www.seleniumconf.org/speakers/#IDM):
[slides](http://detro.github.com/ghostdriver/slides/index.html)
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

1. Indicate the location of the needed executables (`phantomjs`…) by editing the `examples/google_cheese/config/paths.properties.default` file.

2. Build and launch the first Java-based example (to build we use [Gradle](http://www.gradle.org/), already included):

    ```bash
    $> cd examples/google_cheese/
    $> ./gradlew googleExample -Pargs="ghost"
    ```

For a quick speed comparison with other WebDriver implementations, try passing the parameter `firefox` or `chrome` as `-Pargs`.

## Reasoning: pros and cons

### Pros of using an Headless browser for your Selenium testing
* Speed: makes development faster
* Speed: makes THE developer happier
* Speed: leaves more time for beer, video-games, cycling or whatever you fancy
* ...

### Cons of using an Headless browser for your Selenium testing
* PhantomJS is not a "Real" Browser, but "just" very very close to it

## Contributions

You can contribute by testing it and reporting bugs and issues, or by submitting Pull Requests.
_Any help is more than welcome!!!_

## License
GhostDriver is distributed under [BSD License](http://www.opensource.org/licenses/BSD-2-Clause).

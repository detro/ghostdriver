# Ghost Driver

Ghost Driver is a pure JavaScript implementation of the
[WebDriver Wire Protocol](http://code.google.com/p/selenium/wiki/JsonWireProtocol)
for [PhantomJS](http://phantomjs.org/).
It's going to be a Remote WebDriver that uses PhantomJS as back-end.

## Status

* Under development / almost ready for 1.0
* **Code Hardening in progress**: before raising bugs, check if's a "not yet implemented" feature first
* **~90%** of the WireProtocol currently implemented
* Version 1.0 will implement all the commands EXCEPT the ones related with Mobile WebDrivers (see spreadsheet below)
* **DEPENDS ON MY BRANCH OF PHANTOMJS**, as mentioned below in the **Requirements** section

You can monitor development progress at [this Google Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Am63grtxc7bDdGNqX1ZPX2VoZlE2ZHZhd09lNDkzbkE).

## Requirements

At the moment you need to compile [a specific version of PhantomJS](https://github.com/detro/phantomjs/tree/ghostdriver-dev)
to run GhostDriver. This is because GhostDriver needed new features
in PhantomJS to fulfill all the functionalities of the WebDriver _"protocol"_.

### Checkout and Compile Ivan De Marino's PhantomJS `ghostdriver-dev` branch:

1. Prepare your machine for building PhantomJS as documented [here](http://phantomjs.org/build.html)
2. `git remote add detro https://github.com/detro/phantomjs.git`
3. `git checkout -b detro-ghostdriver-dev remotes/detro/ghostdriver-dev`
4. Compile as you would compile PhantomJS

## How to use it

### Run the tests

Here I show how to clone this repo and kick start the (Java) tests. You need
[Java SDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
to run them (I tested it with Java 7, but should work with Java 6 too).

1. `git clone https://github.com/detro/ghostdriver.git`
2. Configure `phantomjs_exec_path` inside `ghostdriver/test/config.ini` to point at the build of PhantomJS you just did
3. Configure `phantomjs_driver_path` inside `ghostdriver/test/config.ini` to the absolute path of your clone of `ghostdriver/src/main.js`
4. `cd ghostdriver/test; ./gradlew test`

### Run GhostDriver yourself and launch tests against that instance

1. `phantomjs ghostdriver/src/main.js PORT`
2. Configure `driver` inside `ghostdriver/test/config.ini` to point at the URL `http://localhost:PORT`
3. `cd ghostdriver/test; ./gradlew test`

### Register GhostDriver with a Selenium Grid hub

1. Launch the grid server, which listens on 4444 by default: `java -jar /path/to/selenium-server-standalone-2.25.0.jar -role hub`
2. Register with the hub: `phantomjs ghostdriver/src/main.js 8080 http://127.0.0.1:4444`
3. Now you can use your normal webdriver client with `http://127.0.0.1:4444` and just request `browserName: phantomjs`

## Presentation and Slides (old)

In April 2012 I (Ivan De Marino) presented GhostDriver at the
[Selenium Conference](http://www.seleniumconf.org/speakers/#IDM):
[slides](http://cdn.ivandemarino.me/slides/speed_up_selenium_with_phantomjs/index.html)
and
[video](http://blog.ivandemarino.me/2012/05/01/Me-the-Selenium-Conference-2012).

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

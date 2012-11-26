# Ghost Driver

Ghost Driver is a pure JavaScript implementation of the
[WebDriver Wire Protocol](http://code.google.com/p/selenium/wiki/JsonWireProtocol)
for [PhantomJS](http://phantomjs.org/).
It's a Remote WebDriver that uses PhantomJS as back-end.

GhostDriver is designed to be integral part of PhantomJS itself, but it's developed in isolation and progress is tracked
by this Repository.

Current version is `"1.0.0"` ([changelog](https://github.com/detro/ghostdriver/blob/master/CHANGELOG.md)).

The project was created and is lead by [Ivan De Marino](https://github.com/detro).

## Requirements

At the moment you need to compile [a specific version of PhantomJS](https://github.com/detro/phantomjs/tree/ghostdriver-dev)
to run GhostDriver.
This is because GhostDriver needed new features in PhantomJS to fulfill all the functionalities
of the WebDriver _"protocol"_.
This is only temporary: **next version of PhantomJS stable release will include GhostDriver built in**.

### Checkout and Compile Ivan De Marino's PhantomJS `ghostdriver-dev` branch:

1. Prepare your machine for building PhantomJS as documented [here](http://phantomjs.org/build.html), then...
2. Add `detro` remote to local PhantomJS repo: `git remote add detro https://github.com/detro/phantomjs.git`
3. Checkout the `ghostdriver-dev` branch: `git checkout -b detro-ghostdriver-dev remotes/detro/ghostdriver-dev`
4. Build: `./build.sh`
5. Go make some coffee (this might take a while...)
6. `phantomjs --webdriver=8080` to **launch PhantomJS in Remote WebDriver mode**

## How to use it

Launching PhantomJS in Remote WebDriver mode it's simple:
```bash
$ phantomjs --webdriver=PORT
```
Once started, you can use any `RemoteWebDriver` implementation to send commands to it. I advice to take a look to the
`/test` directory for examples.

### Run the tests

Here I show how to clone this repo and kick start the (Java) tests. You need
[Java SDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
to run them (I tested it with Java 7, but should work with Java 6 too).

1. `git clone https://github.com/detro/ghostdriver.git`
2. Configure `phantomjs_exec_path` inside `ghostdriver/test/config.ini` to point at the build of PhantomJS you just did
3. `cd ghostdriver/test; ./gradlew test`

### Run GhostDriver yourself and launch tests against that instance

1. `phantomjs --webdriver=PORT`
2. Configure `driver` inside `ghostdriver/test/config.ini` to point at the URL `http://localhost:PORT`
3. `cd ghostdriver/test; ./gradlew test`

### Register GhostDriver with a Selenium Grid hub

1. Launch the grid server, which listens on 4444 by default: `java -jar /path/to/selenium-server-standalone-2.25.0.jar -role hub`
2. Register with the hub: `phantomjs --webdriver=8080 --webdriver-selenium-grid-hub=http://127.0.0.1:4444`
3. Now you can use your normal webdriver client with `http://127.0.0.1:4444` and just request `browserName: phantomjs`

## Project Directory Structure

Here follows the output of the `tree` command, trimmed of files and "build directories":

```bash
.
├── binding
│   └── java
│       ├── jars            <--- JARs containing Binding, related Source and related JavaDoc
│       └── src             <--- Java Binding Source
|
├── src                     <--- GhostDriver JavaScript core source
│   ├── request_handlers    <--- JavaScript "classes/functions" that handle HTTP Requests
│   └── third_party         <--- Third party/utility code
│       └── webdriver-atoms <--- WebDriver Atoms, automatically imported from the Selenium project
|
├── test
│   ├── java
│   │   └── src             <--- Java Tests
│   └── python              <--- Python Tests
|
└── tools                   <--- Tools (import/export)
```

## Presentation and Slides (old)

In April 2012 I (Ivan De Marino) presented GhostDriver at the
[Selenium Conference](http://www.seleniumconf.org/speakers/#IDM):
[slides](http://cdn.ivandemarino.me/slides/speed_up_selenium_with_phantomjs/index.html)
and
[video](http://blog.ivandemarino.me/2012/05/01/Me-the-Selenium-Conference-2012).

## Contributions and/or Bug Report

You can contribute by testing GhostDriver, reporting bugs and issues, or submitting Pull Requests.
Any **help is welcome**, but bear in mind the following base principles:

* Issue reporting requires a reproducible example, otherwise will most probably be **closed withouth worning**
* Squash your commits by theme: I prefer a clean, readable log
* Maintain consistency with the code-style you are surrounded by
* If you are going to make a big, substantial change, let's discuss it first
* I **HATE** CoffeeScript: assume I'm going to laugh off any "contribution" that contains such _aberrating crap_!
* Open Source is NOT a democracy (and I mean it!)

## License
GhostDriver is distributed under [BSD License](http://www.opensource.org/licenses/BSD-2-Clause).

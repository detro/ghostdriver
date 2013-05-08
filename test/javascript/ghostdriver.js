var
  webdriver   = require('./xwebdriver'),
  WebElement  = webdriver.WebElement,
  By          = webdriver.By,
  Key         = webdriver.Key,
  controlFlow = webdriver.promise.controlFlow(),
  should      = require('should'),
  http        = require('http'),
  remote      = 'http://localhost:8910',
  site        = 'http://localhost:3000/',
  browserName = 'phantomjs',
  pointer     = {},
  driver;



describe('Ghostdriver', function () {

  describe('#start', function () {

    it("should query the server's current status.", function (done) {
      webdriver.http.util.getStatus(remote).then(function(status) {
        // no se la razon por que mocha no puede interpretar esto bien
        var data = JSON.stringify(status);
        status   = JSON.parse(data);
        status.should.have.property('build');
        status.build.should.have.property('version');
        status.should.have.property('os');
        status.os.should.have.property('name');
        status.os.should.have.property('version');
        status.os.should.have.property('arch');
        done();
      });
    });

    it('should start the session', function (done) {
      controlFlow.execute(function () {
        driver = new webdriver.Builder().
           usingServer(remote).
           withCapabilities({'browserName': browserName}).
           build();
      }).then(function () {
        done();
      });
    });

    it ('should returns a list of the currently active sessions.',
      function (done) {
        webdriver.http.util.getSessions(remote).then(function(sessions) {
          var data = JSON.stringify(sessions);
          sessions   = JSON.parse(data);
          sessions.should.be.an.instanceOf(Array);
          sessions.length.should.equal(1);
          sessions.forEach(function (session) {
              session.id.length.should.equal(36);
              var capabilities = session.capabilities;
              capabilities.should.be.an.instanceOf(Object);
              capabilities.should.have.property('browserName');
              capabilities.should.have.property('platform');
              capabilities.should.have.property('javascriptEnabled');
              capabilities.should.have.property('takesScreenshot');
              capabilities.should.have.property('handlesAlerts');
              capabilities.should.have.property('databaseEnabled');
              capabilities.should.have.property('javascriptEnabled');
              capabilities.should.have.property('javascriptEnabled');
          });
          done();
        });
    });
  });

  describe('#timeouts', function () {
    it('should set the amount of time the driver should' +
        'wait when searching for elements', function(done) {
      driver.manage().timeouts().implicitlyWait(10).then(function () {
        done();
      });
    });

    it('should sets the amount of time to wait for an asynchronous script' +
        'to finish execution before throwing an error', function(done) {
      driver.manage().timeouts().setScriptTimeout(20).then(function () {
        done();
      });
    });

    it('should sets the amount of time to wait for a page load to complete' +
        'before throwing an error', function(done) {
      driver.manage().timeouts().setPageLoadTimeout(1000).then(function () {
        done();
      });
    });
  });

  describe('#page', function () {
    it('should navigate to a new URL', function(done) {
      driver.get(site).then(function() {
        done();
      });
    });

    it('should retrieve the URL of the current page', function (done) {
      driver.getCurrentUrl().then(function (url) {
        url.should.equal(site);
        done();
      });
    });

    it('should get the current page title', function(done) {
      driver.getTitle().then(function(title) {
        title.should.equal('Ghostdriver');
        done();
      });
    });

    it('should get the current page source', function(done) {
      driver.getPageSource().then(function(source) {
        source.should.include('</html>');
        done();
      });
    });

    it('should take a screenshot of the current page', function(done) {
      driver.takeScreenshot().then(function (source) {
        var base64Data = source.replace(/^data:image\/png;base64,/,"");
        var fs = require('fs');
        fs.writeFile('./page.png', base64Data, 'base64', function (err) {
          done();
        });
      });
    });
  });

  describe('#script', function () {
    it('should Inject a snippet of JavaScript into the page for execution' +
        'in the context of the currently selected frame', function(done) {
      var script = 'document.body.blur();' +
                   'return document.activeElement;';
      driver.executeScript(script).
        then(function(element) {
          return driver.executeScript(
            'return arguments[0].tagName.toLowerCase()',
            element);
        }).
        then(function (tagName) {
          tagName.should.equal('body');
          done();
        });
    });

    it('should Inject a snippet of JavaScript into the page for execution ' +
        'asynchronous in the context of the currently selected frame',
        function(done) {
        driver.executeAsyncScript('arguments[0](document.title)').
          then(function (title) {
            title.should.equal('Ghostdriver');
            done();
          });
    });
  });

  describe('#navigate', function () {
    it('should navigate to a new URL', function(done) {
      driver.navigate().to(site).then(function() {
        done();
      });
    });

    it('should refresh the current page', function(done) {
      driver.navigate().refresh().then(function () {
        done();
      });
    });

    it('should navigate to a new URL', function(done) {
      driver.navigate().to(site + 'frame').then(function() {
        done();
      });
    });

    it('should navigate backwards in the browser history, if possible.',
      function (done) {
      driver.navigate().back().
        then(function () {
          return driver.getCurrentUrl();
        }).then(function(url) {
          url.should.equal(site);
          return driver.navigate().back();
        }).then(function () {
          return driver.getCurrentUrl();
        }).then(function (url) {
          url.should.equal(site);
          done();
        });
    });

    it('should navigate forwards in the browser history, if possible',
      function (done) {
      driver.navigate().forward().
        then(function () {
          return driver.getCurrentUrl();
        }).then(function(url) {
          url.should.equal(site + 'frame');
          return driver.navigate().forward();
        }).then(function () {
          return driver.getCurrentUrl();
        }).then(function (url) {
          url.should.equal(site + 'frame');
          return driver.navigate().back();
        }).then(function () {
          return driver.getCurrentUrl();
        }).then(function (url) {
          url.should.equal(site);
          done();
        });
    });
  });

  describe('#cookie', function () {
    it('should retrieve all cookies visible to the current page',
      function (done) {
        driver.manage().getCookies().then(function(cookies) {
          cookies.length.should.equal(0);
          done();
        });
    });

    it('should set a cookie.', function (done) {
      var manage = driver.manage();
      manage.addCookie('test1', 'cookie').
        then(function() {
          return manage.addCookie('test2', 'cookie');
        }).
        then(function () {
          return manage.getCookies();
        }).
        then(function (cookies) {
          cookies.length.should.equal(2);
          done();
        });
    });

    it('should delete the cookie with the given name', function (done) {
      var manage = driver.manage();
      manage.deleteCookie('test1').then(function () {
        return manage.getCookies();
      }).then(function (cookies) {
        cookies.length.should.equal(1);
        done();
      });
    });

    it('should delete all cookies visible to the current page.', function (done) {
      var manage = driver.manage();
      manage.deleteAllCookies().then(function () {
        return manage.getCookies();
      }).then(function (cookies) {
        cookies.length.should.equal(0);
        done();
      });
    });
  });

  describe('#localStorage', function () {

    it('should clear the storage.', function (done) {
      driver.localStorage().clear().then(function () {
        driver.localStorage().getSize().then(function (length) {
          length.should.equal(0);
          done();
        });
      });
    });

    it('should get all keys of the storage', function (done) {
      driver.localStorage().getKeys().then(function (keys) {
        keys.length.should.equal(0);
        done();
      });
    });

    it('should get the number of items in the storage', function (done) {
      driver.localStorage().getSize().then(function (length) {
        length.should.equal(0);
        done();
      });
    });

    it('should set the storage item for the given key', function (done) {
      driver.localStorage().setItem('test', 'local').
        then(function () {
          return driver.localStorage().getSize();
        }).then(function (length) {
          length.should.equal(1);
          done();
        });
    });

    it('should get the storage item for the given key', function (done) {
      driver.localStorage().getItem('test').
        then(function (value) {
          value.should.equal('local');
          done();
        });
    });

    it('should remove the storage item for the given key', function (done) {
      driver.localStorage().removeItem('test').
        then(function () {
          return driver.localStorage().getSize();
        }).then(function (length) {
          length.should.equal(0);
          done();
        });
    });
  });

  describe('#sessionStorage', function () {

    it('should clear the storage.', function (done) {
      driver.sessionStorage().clear().then(function () {
        driver.sessionStorage().getSize().then(function (length) {
          length.should.equal(0);
          done();
        });
      });
    });

    it('should get all keys of the storage', function (done) {
      driver.sessionStorage().getKeys().then(function (keys) {
        keys.length.should.equal(0);
        done();
      });
    });

    it('should get the number of items in the storage', function (done) {
      driver.sessionStorage().getSize().then(function (length) {
        length.should.equal(0);
        done();
      });
    });

    it('should set the storage item for the given key', function (done) {
      driver.sessionStorage().setItem('test', 'session').
        then(function () {
          return driver.sessionStorage().getSize();
        }).then(function (length) {
          length.should.equal(1);
          done();
        });
    });

    it('should get the storage item for the given key', function (done) {
      driver.sessionStorage().getItem('test').
        then(function (value) {
          value.should.equal('session');
          done();
        });
    });

    it('should remove the storage item for the given key', function (done) {
      driver.sessionStorage().removeItem('test').
        then(function () {
          return driver.sessionStorage().getSize();
        }).then(function (length) {
          length.should.equal(0);
          done();
        });
    });
  });

  describe('#actions', function () {
    it('should send a sequence of key strokes to an element', function(done) {
      var _size, _location, _element;
      driver.findElement(By.name('q')).
        then(function(element) {
          _element = element;
          return element.getLocation();
        }).then(function (location) {
          _location = location;
          return _element.getSize();
        }).then(function (size) {
          _size = size;
          return _element.clear();
        }).then(function () {
          return _element.getAttribute('value');
        }).then(function (value) {
          value.should.be.empty;
          return driver.actions()
                       .mouseMove(_element)
                       .sendKeys('Hello Ghostdriver!')
                       .perform();
        }).then(function () {
          return _element.getAttribute('value');
        }).then(function (value) {
          value.toString().should.equal('Hello Ghostdriver!');
          // restore to 0,0
          var x = _location.x  + Math.ceil(_size.width / 2);
          var y = _location.y +  Math.ceil(_size.height / 2);
          return driver.actions().mouseMove({x: -x, y: -y}).perform();
        }).then(function () {
          done();
        });
    });

    it('should the mouse from its current ' +
       'position (or 0,0) by the given offset', function (done) {
      var result = {};
      driver.findElement(By.id('send')).then(function (element) {
        result.element = element;
        return element.getLocation();
      }).then(function (location) {
        location.x += 5;
        location.y += 5;
        result.location = location;
        return driver.actions().mouseMove(location).click().perform();
      }).then(function() {
        return driver.getCurrentUrl();
      }).then(function (url) {
        url.should.equal(site + 'submit');
        return driver.navigate().back();
      }).then(function () {
        var location = result.location;
        location.x = - location.x;
        location.y = - location.y;
        // restore to 0,0
        return driver.actions().mouseMove(location).perform();
      }).then(function () {
        done();
      });
    });

    it('should move the mouse by an offset of the specificed element',
      function (done) {
        var res = {};
        driver.findElement(By.id('send')).then(function (element) {
          res.element = element;
          return element.getLocation();
        }).then(function (location) {
          pointer = location;
          pointer.x += 5;
          pointer.y += 5;
          return driver.actions().mouseMove(res.element, {x: 5, y: 5}).perform();
        }).then(function () {
          done();
        });
    });

    it('should click any mouse button' +
       '(at the coordinates set by the last moveto command).', function (done) {
      driver.actions().click().perform().then(function () {
        return driver.getCurrentUrl();
      }).then(function (url) {
        url.should.equal(site + 'submit');
        return driver.navigate().back();
      }).then(function () {
        done();
      });
    });

    it('should double-clicks at the current' +
       'mouse coordinates (set by moveto).', function (done) {
        driver.actions().doubleClick().perform().then(function () {
          return driver.getCurrentUrl();
        }).then(function (url) {
          url.should.equal(site + 'submit');
          return driver.navigate().back();
        }).then(function () {
          // restore to 0,0
          return driver.actions()
                       .mouseMove({x: -pointer.x, y: -pointer.y})
                       .perform();
        }).then(function () {
            done();
        });
    });

    it('should performs a context-click at middle of the given element',
      function (done) {
        var result;
        driver.findElement(By.id('show_in_right_click')).
          then(function (element) {
            result = element;
            return element.isDisplayed();
          }).then(function (displayed) {
            displayed.should.be.false;
            return driver.findElement(By.id('send'));
          }).then(function(element) {
            driver.actions().click(element, webdriver.Button.RIGHT).perform();
          }).then(function () {
            return result.isDisplayed();
          }).then(function (displayed) {
            displayed.should.be.true;
            return driver.getCurrentUrl();
          }).then(function (url) {
            url.should.equal(site);
            done();
          });
    });

    it('should click and hold the left mouse button ' +
       '(at the coordinates set by the last moveto command).', function (done) {
      driver.findElement(By.id('send')).
        then(function (element) {
          return driver.actions().mouseDown(element).perform();
        }).then(function () {
          return driver.getCurrentUrl();
        }).then(function (url) {
          url.should.equal(site);
          done();
        });
    });

    it('should releases the mouse button' +
        'previously held (where the mouse is currently at).', function (done) {

      driver.findElement(By.id('send')).
        then(function (element) {
          return driver.actions().mouseUp(element).perform();
        }).then(function () {
          return driver.getCurrentUrl();
        }).then(function (url) {
          url.should.equal(site + 'submit');
          return driver.navigate().back();
        }).then(function () {
          return driver.getCurrentUrl();
        }).then(function (url) {
          url.should.equal(site);
          done();
        });
    });

    it('should A convenience method that performs click-and-hold at the ' +
       'location of the source element, moves to the location of the target '+
       'element, then releases the mouse.', function (done) {
      var el1;
      driver.findElement(By.id('radio_unchecked')).
        then(function(element) {
          el1 = element;
          return driver.findElement(By.id('send'));
        }).then(function(el2) {
          return driver.actions().dragAndDrop(el1, el2).perform();
        }).then(function () {
          done();
        });
    });
  });

  describe('#element', function () {
    it('should search for an element on the page by tag name.', function (done) {
      driver.findElement(By.tagName('h1')).then(function (element) {
        (element instanceof webdriver.WebElement).should.be.true;
        done();
      });
    });

    it('should search for an element on the page by css.', function (done) {
      driver.findElement(By.css('.container > h1')).then(function (element) {
        (element instanceof webdriver.WebElement).should.be.true;
        done();
      });
    });

    it('should search for an element on the page by id.', function (done) {
      driver.findElement(By.id('form')).then(function (element) {
        (element instanceof webdriver.WebElement).should.be.true;
        done();
      });
    });

    it('should search for an element on the page class name', function (done) {
      driver.findElement(By.className('element')).then(function (element) {
        (element instanceof webdriver.WebElement).should.be.true;
        done();
      });
    });

    it('should search for an element on the page by xpath', function (done) {
      driver.findElement(By.xpath('//div/h1')).then(function (element) {
        (element instanceof webdriver.WebElement).should.be.true;
        done();
      });
    });

    it('should search for an element on the page by link text',
      function (done) {
        driver.findElement(By.linkText('Open alert')).
          then(function (element) {
          (element instanceof webdriver.WebElement).should.be.true;
          done();
        });
    });

    it('should search for an element on the page by partial link text',
      function (done) {
        driver.findElement(By.partialLinkText('alert')).
          then(function (element) {
          (element instanceof webdriver.WebElement).should.be.true;
          done();
        });
    });

    it('should search for an element on the page by name.', function (done) {
      driver.findElement(By.name('q')).
        then(function (element) {
        (element instanceof webdriver.WebElement).should.be.true;
        done();
      });
    });

    it('should throw exception by not element in the page', function (done) {
      driver.findElement(By.tagName('alert')).
        then(null, function (error) {
          error.code.should.equal(webdriver.error.ErrorCode.NO_SUCH_ELEMENT);
          done();
      });
    });

    it('should throw exception by invalid xpath', function (done) {
      driver.findElement(By.xpath('.$d&alert')).
        then(null, function (error) {
          error.code.should.equal(
            webdriver.error.ErrorCode.INVALID_SELECTOR_ERROR
          );
          done();
      });
    });

    it('should throw exception by invalid css selector', function (done) {
      driver.findElement(By.css('$dalert')).
        then(null, function (error) {
          error.code.should.equal(
            webdriver.error.ErrorCode.INVALID_SELECTOR_ERROR
          );
          done();
      });
    });

    it('should throw exception by invalid class name', function (done) {
      driver.findElement(By.className('10')).
        then(null, function (error) {
          error.code.should.equal(
            webdriver.error.ErrorCode.INVALID_SELECTOR_ERROR
          );
          done();
      });
    });

    it('should retrieve the value attribute of an element', function (done) {
      var element = driver.findElement(By.name('q'));
      element.clear();
      element.sendKeys('this is an test');
      element.getAttribute('value').then(function(value) {
        value.should.equal('this is an test');
        done();
      });
    });

    it('should retrieve the value of the invalid attribute of an element',
      function (done) {
        var element = driver.findElement(By.id('html'));
        element.getAttribute('invalid').then(function (value) {
          should.not.exist(value);
          done();
        });
    });

    it('should determine if an element is currently enabled', function (done) {
      var element = driver.findElement(By.name('p'));
      element.isEnabled().then(function(enabled) {
        enabled.should.be.true;
      });
      element = driver.findElement(By.id('html'));
      element.isEnabled().then(function(enabled) {
        enabled.should.be.true;
      });
      element = driver.findElement(By.id('disabled'));
      element.isEnabled().then(function(enabled) {
        enabled.should.be.false;
        done();
      });
    });

    it("should determine if an OPTION element, or an INPUT\n" +
        'element of type checkbox or radiobutton is currently selected',
      function (done) {
        var element = driver.findElement(By.id('radio_checked'));
        element.isSelected().then(function (selected) {
          selected.should.be.true;
        });

        element = driver.findElement(By.id('checkbox_checked'));
        element.isSelected().then(function (selected) {
          selected.should.be.true;
        });

        element = driver.findElement(By.css('#select > option[value="on"]'));
        element.isSelected().then(function (selected) {
          selected.should.be.true;
        });

        element = driver.findElement(By.id('radio_unchecked'));
        element.isSelected().then(function (selected) {
          selected.should.be.false;
        });

        element = driver.findElement(By.id('checkbox_unchecked'));
        element.isSelected().then(function (selected) {
          selected.should.be.false;
        });

        element = driver.findElement(By.css('#select > option[value="off"]'));
        element.isSelected().then(function (selected) {
          selected.should.be.false;
          done();
        });
    });

    it('should throw exception by element not selectable', function (done) {
      var element = driver.findElement(By.id('html'));
      element.isSelected().then(null, function (error) {
        error.code.should.equal(
          webdriver.error.ErrorCode.ELEMENT_NOT_SELECTABLE
        );
        done();
      });
    });

    it('should determine if an element is currently displayed',
      function (done) {
        var element = driver.findElement(By.id('html'));
        element.isDisplayed().then(function (displayed) {
          displayed.should.be.true;
        });

        element = driver.findElement(By.id('disabled'));
        element.isDisplayed().then(function (displayed) {
          displayed.should.be.false;
          done();
        });
    });

    it('should returns the visible text for the element', function (done) {
      var element = driver.findElement(By.id('html'));
      element.getText().then(function (text) {
        text.should.equal('This my innerHTML');
        done();
      });
    });

    it("should query the value of an element's computed CSS property",
      function (done) {
        var element = driver.findElement(By.id('disabled'));
        element.getCssValue('display').then(function (display) {
          display.should.equal('none');
          done();
        });
    });

    it("should determine an element's size in pixels", function (done) {
      var element = driver.findElement(By.id('html'));
      element.getSize('display').then(function (size) {
        size.width.should.equal(200);
        size.height.should.equal(50);
        done();
      });
    });

    it("should determine an element's location on the page", function (done) {
      var element = driver.findElement(By.id('html'));
      element.getLocation().then(function (location) {
        location.x.should.equal(0);
        location.y.should.equal(15);
        done();
      });
    });

    it("should Determine an element's location on the screen once it " +
        "has been scrolled into view", function (done) {
      var element = driver.findElement(By.id('html'));
      element.getLocationOnceScrolledIntoView().then(function (location) {
        location.x.should.equal(0);
        location.y.should.equal(15);
        done();
      });
    });

    it("should query for an element's tag name", function (done) {
      var element = driver.findElement(By.id('html'));
      element.getTagName().then(function (tagName) {
        tagName.should.equal('div');
        done();
      });
    });

    it('should get the element on the page that currently has focus',
      function (done) {
        var element = driver.findElement(By.tagName('body'));
        element.click().
          then(function () {
            return driver.switchTo().activeElement();
          }).
          then(function (element) {
            return element.getTagName();
          }).
          then(function (tagName) {
            tagName.should.equal('body');
            done();
          });
    });

    it("should search for an element on the page,\n" +
       'starting from the identified element', function (done) {
      driver.findElement(By.className('container')).
        then(function (parent) {
          return parent.findElement(By.className('element'));
        }).
        then(function(child) {
          (child instanceof webdriver.WebElement).should.be.true;
          return child.getTagName();
        }).
        then(function (tagName) {
          tagName.should.equal('div');
          done();
        });
    });

    it("should search for multiple elements on the page, \n" +
       'starting from the identified element', function (done) {
      driver.findElement(By.className('container')).
        then(function (parent) {
          return parent.findElements(By.className('element'));
        }).
        then(function(childs) {
          childs.length.should.equal(3);
          done();
        });
    });

    it("should clear a TEXTAREA or text INPUT element's value.",
      function (done) {
        var element = driver.findElement(By.name('q'));
        element.clear().
          then(function () {
            return element.getAttribute('value');
          }).
          then(function (value) {
            value.should.be.empty;
            return driver.switchTo().activeElement();
          }).
          then(function (input) {
            return input.getAttribute('name');
          }).
          then(function (name) {
            name.should.equal('q');
            done();
          });
    });

    it('should submit a FORM element. The submit command may also be applied ' +
       'to any element that is a descendant of a FORM element',
       function (done) {
        var element = driver.findElement(By.id('send'));
        element.submit().
          then(function () {
            return driver.getCurrentUrl();
          }).
          then(function(url) {
            url.should.equal(site + 'submit');
            return driver.navigate().back();
          }).
          then(function () {
            return driver.getCurrentUrl();
          }).
          then(function (url) {
            url.should.equal(site);
            done();
          });
    });

    it('should click on an element.', function (done) {
        var element = driver.findElement(By.id('send'));
        element.click().
          then(function () {
            return driver.getCurrentUrl();
          }).
          then(function(url) {
            url.should.equal(site + 'submit');
            return driver.navigate().back();
          }).
          then(function () {
            return driver.getCurrentUrl();
          }).
          then(function (url) {
            url.should.equal(site);
            done();
          });
    });

    it('should send a sequence of key strokes to an element', function (done) {
      var element = driver.findElement(By.name('q'));
      element.sendKeys('Hello Ghostdriver!').
        then(function () {
          return element.getAttribute('value');
        }).
        then(function (value) {
          value.should.equal('Hello Ghostdriver!');
          done();
        });
    });

    it('should Test if two element IDs refer to the same DOM element.',
      function (done) {
        var element1 = driver.findElement(By.name('q')),
            element2 = driver.findElement(By.id('send'));
        WebElement.equals(element1, element1).
          then(function (equals) {
            equals.should.be.true;
            return WebElement.equals(element1, element2);
          }).then(function (equals) {
            equals.should.be.false;
            done();
          })
    });

    // this command has not implemetation
    // only for test of the driver
    it('should describe the identified element.', function (done) {
      var element = driver.findElement(By.id('send'));
      element.describe_().then(function(describe) {
        return WebElement.equals(element, describe)
      }).then(function (equals) {
        equals.should.be.true;
        done();
      });
    });

    it('should simultate un keysortcut.', function (done) {
      var element = driver.findElement(By.tagName('body'));
      element.sendKeys([Key.SHIFT, 'f']).
        then(function () {
          return driver.getCurrentUrl();
        }).
        then(function (url) {
          url.should.equal(site + 'frame');
          return driver.navigate().back();
        }).
        then(function (url) {
          return driver.getCurrentUrl();
        }).
        then(function (url) {
          url.should.equal(site);
          done();
        });
    });
  });

  describe('#elements', function () {
    it('should search for multiple elements on the page, ' +
       'starting from the document root by css.', function (done) {
      driver.findElements(By.css('.container > *')).then(function(elements) {
        elements.length.should.equal(7);
        done();
      });
    });

    it('should search for multiple elements on the page, ' +
       'starting from the document root by class name.', function (done) {
      driver.findElements(By.className('element')).then(function(elements) {
        elements.length.should.equal(3);
        done();
      });
    });

    it('should search for multiple elements on the page, ' +
       'starting from the document root by tag name.', function (done) {
      driver.findElements(By.tagName('div')).then(function(elements) {
        elements.length.should.equal(7);
        done();
      });
    });

    it('should search for multiple elements on the page, ' +
       'starting from the document root by xpath.', function (done) {
      driver.findElements(By.xpath('//div')).then(function(elements) {
        elements.length.should.equal(7);
        done();
      });
    });


    it('should search for multiple elements on the page, ' +
       'starting from the document root by name.', function (done) {
      driver.findElements(By.name('p')).then(function(elements) {
        elements.length.should.equal(2);
        done();
      });
    });

    it('should return empty array by not elements in the page',
      function (done) {
        driver.findElements(By.tagName('alert')).then(function(elements) {
          elements.length.should.equal(0);
          done();
        });
    });

    it('should throw exception by invalid xpath', function (done) {
      driver.findElements(By.xpath('.$d&alert')).then(null, function(error) {
        error.code.should.equal(
          webdriver.error.ErrorCode.INVALID_SELECTOR_ERROR
        );
        done();
      });
    });

    it('should throw exception by invalid css selector', function (done) {
      driver.findElements(By.css('.$dalert')).then(null, function(error) {
        error.code.should.equal(
          webdriver.error.ErrorCode.INVALID_SELECTOR_ERROR
        );
        done();
      });
    });

    it('should throw exception by invalid class name', function (done) {
      driver.findElements(By.className('10')).then(null, function(error) {
        error.code.should.equal(
          webdriver.error.ErrorCode.INVALID_SELECTOR_ERROR
        );
        done();
      });
    });
  });

  describe('#frame', function () {
    it('should open frame page.', function (done) {
      driver.get(site + 'frame').
        then(function () {
          return driver.getCurrentUrl();
        }).
        then(function (url) {
          url.should.equal(site + 'frame');
          done();
        });
    });

    it('should change focus to another frame on the page by index.',
      function (done) {
        driver.switchTo().frame(0).
          then(function () {
            return driver.findElement(By.id('left')).getTagName();
          }).
          then(function (tagName) {
            tagName.should.equal('div');
            done();
          });
    });

    it('should change to the main frame', function (done) {
      driver.switchTo().frame(null).
        then(function () {
          return driver.findElement(By.name('left')).getTagName();
        }).
        then(function (tagName) {
          tagName.should.equal('frame');
          done();
        });
    });

    it('should change focus to another frame on the page by name.',
      function (done) {
        driver.switchTo().frame('right').
          then(function () {
            return driver.findElement(By.id('right')).getTagName();
          }).
          then(function (tagName) {
            tagName.should.equal('div');
            return driver.switchTo().frame(null);
          }).then(function () {
            done();
          });
    });

    it('should change focus to iframe on the frame', function (done) {
      driver.switchTo().frame('left').
        then(function () {
          return driver.switchTo().frame(0);
        }).
        then(function () {
          return driver.findElement(By.id('iframe')).getTagName();
        }).then(function (tagName) {
          tagName.should.equal('div');
          return driver.navigate().back();
        }).then(function () {
          return driver.getCurrentUrl();
        }).then(function (url) {
          url.should.equal(site);
          done();
        });
    });
  });

  describe('#window', function () {
    it('should retrieve the current window handle', function(done) {
      driver.getWindowHandle().then(function(handle) {
        handle.length.should.equal(36);
        done();
      });
    });

    it('should get the size of the specified window', function (done) {
      driver.manage().window().getSize().then(function (size) {
        size.width.should.equal(400);
        size.height.should.equal(300);
        done();
      });
    });

    it('should change the size of the specified window', function (done) {
      var window = driver.manage().window();
      window.setSize(1024, 768).
        then(function () {
          return window.getSize();
        }).
        then(function (size) {
          size.width.should.equal(1024);
          size.height.should.equal(768);
          done();
        });
    });

    it('should get the position of the specified window', function (done) {
      driver.manage().window().getPosition().then(function (position) {
        position.x.should.equal(0);
        position.y.should.equal(0);
        done();
      });
    });


    it('should change the position of the specified window', function (done) {
      var window = driver.manage().window();
      window.setPosition(10, 20).
        then(function () {
          return window.getPosition();
        }).
        then(function (position) {
          position.x.should.equal(10);
          position.y.should.equal(20);
          done();
        });
    });

    it('should maximize the specified window if not already maximized',
      function (done) {
        var window = driver.manage().window();
        window.maximize().then(function () {
          return window.getSize();
        }).
        then(function(size) {
          var exec = require('child_process').exec,
              xrandr = exec('xrandr', function (error, stdout, stderr) {
                if (error === null) {
                  var regex = /current (\d+) x (\d+)/,
                      match  = regex.exec(stdout),
                      width  = parseInt(match[1], 10),
                      height = parseInt(match[2], 10);
                  size.width.should.equal(width);
                  size.height.should.equal(height);
                  done();
                }
              });

        });
    });

    it("should change focus to another window.\n" +
       "The window to change focus to may be specified by its server\n" +
       "assigned window handle, or by the value of its name attribute.",
      function (done) {
        var current;
        driver.getWindowHandle().
          then(function (handle) {
            current = handle;
            return driver.findElement(By.id('popup')).click();
          }).
          then(function () {
            return driver.getAllWindowHandles();
          }).
          then(function (handles) {
            handles.length.should.equal(2);
            return controlFlow.execute(function () {
              handles.forEach(function (handle) {
                if (handle !== current) {
                  driver.switchTo().window(handle).
                    then(function () {
                      return driver.getWindowHandle();
                    }).
                    then(function (value) {
                      value.should.equal(handle);
                      return driver.findElement(By.id('child_popup')).getText();
                    }).
                    then(function (text) {
                      text.should.equal('I am popup');
                      return driver.close();
                    }).
                    then(function () {
                      return driver.findElement(By.id('child_popup'));
                    }).
                    then(null, function (error) {
                      error.code.should.equal(
                        webdriver.error.ErrorCode.NO_SUCH_WINDOW
                      );
                    });
                }
              });
            });
          }).
          then(function () {
            return driver.getAllWindowHandles();
            done();
          }).
          then(function (handles) {
            handles.length.should.equal(1);
            return driver.switchTo().window(current);
          }).
          then(function() {
            done();
          });
    });

    it('should send post data to popup, and close with link', function (done) {
      var element = driver.findElement(By.name('q')),
          data    = 'This is an text for send post data',
          currentHandle;
      driver.getWindowHandle().
        then(function (handle) {
          currentHandle = handle;
          return element.clear();
        }).
        then(function () {
          return element.sendKeys(data);
        }).
        then(function () {
          return driver.findElement(By.id('popup_post')).click();
        }).
        then(function () {
          return driver.switchTo().window('new_window');
        }).
        then(function () {
          return driver.findElement(By.id('post_data')).getText();
        }).
        then(function (value) {
          value.should.equal(data);
          return driver.findElement(By.id('close')).click();
        }).
        then(function () {
          return driver.findElement(By.id('child_popup'));
        }).
        then(null, function (error) {
          error.code.should.equal(
            webdriver.error.ErrorCode.NO_SUCH_WINDOW
          );
          return driver.switchTo().window(currentHandle);
        }).
        then(function() {
          done();
        });
    });

    it('should close the current window', function (done) {
      driver.close().then(function () {
        done();
      })
    });

    it('should throw exception by closed window on navigate to a new URL',
      function (done) {
        driver.get(site).then(null, function (error) {
          error.code.should.equal(
            webdriver.error.ErrorCode.NO_SUCH_WINDOW
          );
          done();
        });
    });

    it('should throw exception by closed window on ' +
        'retrieve the URL of the current page', function (done) {
      driver.getCurrentUrl().then(null, function (error) {
        error.code.should.equal(
          webdriver.error.ErrorCode.NO_SUCH_WINDOW
        );
        done();
      });
    });

    it('should throw exception by closed window on ' +
        'get the current page title', function (done) {
      driver.getTitle().then(null, function (error) {
        error.code.should.equal(
          webdriver.error.ErrorCode.NO_SUCH_WINDOW
        );
        done();
      });
    });
  });

  describe('#stop', function () {
    it('should close the session', function(done) {
      driver.quit().then(function() {
        done();
      });
    });
  });
});
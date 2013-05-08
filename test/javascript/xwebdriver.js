var webdriver = require('selenium-webdriver'),
    base      = require('selenium-webdriver/_base'),
    checkResponse = base.require('bot.response').checkResponse,
    Command   = webdriver.Command,
    CommandName = webdriver.CommandName,
    http        = webdriver.http,
    HttpClient  = webdriver.http.HttpClient,
    Executor    = http.Executor,
    promise     = webdriver.promise;


CommandName.DESCRIBE_ELEMENT = 'describeElement';

/**
 * Maps command names to resource locator.
 * @private {!Object.<{method:string, path:string}>}
 * @const
 */
Executor.COMMAND_MAP_ = (function() {
  return new Builder().
      put(CommandName.GET_SERVER_STATUS, get('/status')).
      put(CommandName.NEW_SESSION, post('/session')).
      put(CommandName.GET_SESSIONS, get('/sessions')).
      put(CommandName.DESCRIBE_SESSION, get('/session/:sessionId')).
      put(CommandName.QUIT, del('/session/:sessionId')).
      put(CommandName.CLOSE, del('/session/:sessionId/window')).
      put(CommandName.GET_CURRENT_WINDOW_HANDLE,
          get('/session/:sessionId/window_handle')).
      put(CommandName.GET_WINDOW_HANDLES,
          get('/session/:sessionId/window_handles')).
      put(CommandName.GET_CURRENT_URL,
          get('/session/:sessionId/url')).
      put(CommandName.GET, post('/session/:sessionId/url')).
      put(CommandName.GO_BACK, post('/session/:sessionId/back')).
      put(CommandName.GO_FORWARD,
          post('/session/:sessionId/forward')).
      put(CommandName.REFRESH,
          post('/session/:sessionId/refresh')).
      put(CommandName.ADD_COOKIE,
          post('/session/:sessionId/cookie')).
      put(CommandName.GET_ALL_COOKIES,
          get('/session/:sessionId/cookie')).
      put(CommandName.DELETE_ALL_COOKIES,
          del('/session/:sessionId/cookie')).
      put(CommandName.DELETE_COOKIE,
          del('/session/:sessionId/cookie/:name')).
      put(CommandName.FIND_ELEMENT,
          post('/session/:sessionId/element')).
      put(CommandName.FIND_ELEMENTS,
          post('/session/:sessionId/elements')).
      put(CommandName.GET_ACTIVE_ELEMENT,
          post('/session/:sessionId/element/active')).
      put(CommandName.FIND_CHILD_ELEMENT,
          post('/session/:sessionId/element/:id/element')).
      put(CommandName.FIND_CHILD_ELEMENTS,
          post('/session/:sessionId/element/:id/elements')).
      put(CommandName.CLEAR_ELEMENT,
          post('/session/:sessionId/element/:id/clear')).
      put(CommandName.CLICK_ELEMENT,
          post('/session/:sessionId/element/:id/click')).
      put(CommandName.SEND_KEYS_TO_ELEMENT,
          post('/session/:sessionId/element/:id/value')).
      put(CommandName.SUBMIT_ELEMENT,
          post('/session/:sessionId/element/:id/submit')).
      put(CommandName.DESCRIBE_ELEMENT,
          get('/session/:sessionId/element/:id')).
      put(CommandName.GET_ELEMENT_TEXT,
          get('/session/:sessionId/element/:id/text')).
      put(CommandName.GET_ELEMENT_TAG_NAME,
          get('/session/:sessionId/element/:id/name')).
      put(CommandName.IS_ELEMENT_SELECTED,
          get('/session/:sessionId/element/:id/selected')).
      put(CommandName.IS_ELEMENT_ENABLED,
          get('/session/:sessionId/element/:id/enabled')).
      put(CommandName.IS_ELEMENT_DISPLAYED,
          get('/session/:sessionId/element/:id/displayed')).
      put(CommandName.GET_ELEMENT_LOCATION,
          get('/session/:sessionId/element/:id/location')).
      put(CommandName.GET_ELEMENT_LOCATION_IN_VIEW,
          get('/session/:sessionId/element/:id/location_in_view')).
      put(CommandName.GET_ELEMENT_SIZE,
          get('/session/:sessionId/element/:id/size')).
      put(CommandName.GET_ELEMENT_ATTRIBUTE,
          get('/session/:sessionId/element/:id/attribute/:name')).
      put(CommandName.GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
          get('/session/:sessionId/element/:id/css/:propertyName')).
      put(CommandName.ELEMENT_EQUALS,
          get('/session/:sessionId/element/:id/equals/:other')).
      put(CommandName.SWITCH_TO_WINDOW,
          post('/session/:sessionId/window')).
      put(CommandName.MAXIMIZE_WINDOW,
          post('/session/:sessionId/window/:windowHandle/maximize')).
      put(CommandName.GET_WINDOW_POSITION,
          get('/session/:sessionId/window/:windowHandle/position')).
      put(CommandName.SET_WINDOW_POSITION,
          post('/session/:sessionId/window/:windowHandle/position')).
      put(CommandName.GET_WINDOW_SIZE,
          get('/session/:sessionId/window/:windowHandle/size')).
      put(CommandName.SET_WINDOW_SIZE,
          post('/session/:sessionId/window/:windowHandle/size')).
      put(CommandName.SWITCH_TO_FRAME,
          post('/session/:sessionId/frame')).
      put(CommandName.GET_PAGE_SOURCE,
          get('/session/:sessionId/source')).
      put(CommandName.GET_TITLE,
          get('/session/:sessionId/title')).
      put(CommandName.EXECUTE_SCRIPT,
          post('/session/:sessionId/execute')).
      put(CommandName.EXECUTE_ASYNC_SCRIPT,
          post('/session/:sessionId/execute_async')).
      put(CommandName.SCREENSHOT,
          get('/session/:sessionId/screenshot')).
      put(CommandName.SET_SCRIPT_TIMEOUT,
          post('/session/:sessionId/timeouts/async_script')).
      put(CommandName.SET_PAGE_LOAD_TIMEOUT,
          post('/session/:sessionId/timeouts')).
      put(CommandName.IMPLICITLY_WAIT,
          post('/session/:sessionId/timeouts/implicit_wait')).
      put(CommandName.MOVE_TO, post('/session/:sessionId/moveto')).
      put(CommandName.CLICK, post('/session/:sessionId/click')).
      put(CommandName.DOUBLE_CLICK,
          post('/session/:sessionId/doubleclick')).
      put(CommandName.MOUSE_DOWN,
          post('/session/:sessionId/buttondown')).
      put(CommandName.MOUSE_UP, post('/session/:sessionId/buttonup')).
      put(CommandName.MOVE_TO, post('/session/:sessionId/moveto')).
      put(CommandName.SEND_KEYS_TO_ACTIVE_ELEMENT,
          post('/session/:sessionId/keys')).
      put(CommandName.ACCEPT_ALERT,
          post('/session/:sessionId/accept_alert')).
      put(CommandName.DISMISS_ALERT,
          post('/session/:sessionId/dismiss_alert')).
      put(CommandName.GET_ALERT_TEXT,
          get('/session/:sessionId/alert_text')).
      put(CommandName.SET_ALERT_TEXT,
          post('/session/:sessionId/alert_text')).

      // local storage
      put(CommandName.SET_LOCAL_STORAGE_ITEM,
          post('/session/:sessionId/local_storage')).
      put(CommandName.GET_LOCAL_STORAGE_KEYS,
          get('/session/:sessionId/local_storage')).
      put(CommandName.CLEAR_LOCAL_STORAGE,
          del('/session/:sessionId/local_storage')).
      put(CommandName.GET_LOCAL_STORAGE_SIZE,
          get('/session/:sessionId/local_storage/size')).
      put(CommandName.GET_LOCAL_STORAGE_ITEM,
          get('/session/:sessionId/local_storage/key/:key')).
      put(CommandName.REMOVE_LOCAL_STORAGE_ITEM,
          del('/session/:sessionId/local_storage/key/:key')).


      // local storage
      put(CommandName.SET_SESSION_STORAGE_ITEM,
          post('/session/:sessionId/session_storage')).
      put(CommandName.GET_SESSION_STORAGE_KEYS,
          get('/session/:sessionId/session_storage')).
      put(CommandName.CLEAR_SESSION_STORAGE,
          del('/session/:sessionId/session_storage')).
      put(CommandName.GET_SESSION_STORAGE_SIZE,
          get('/session/:sessionId/session_storage/size')).
      put(CommandName.GET_SESSION_STORAGE_ITEM,
          get('/session/:sessionId/session_storage/key/:key')).
      put(CommandName.REMOVE_SESSION_STORAGE_ITEM,
          del('/session/:sessionId/session_storage/key/:key')).



      build();

  /** @constructor */
  function Builder() {
    var map = {};

    this.put = function(name, resource) {
      map[name] = resource;
      return this;
    };

    this.build = function() {
      return map;
    };
  }

  function post(path) { return resource('POST', path); }
  function del(path)  { return resource('DELETE', path); }
  function get(path)  { return resource('GET', path); }
  function resource(method, path) { return {method: method, path: path}; }
})();


/**
 * Queries a WebDriver server for its current status.
 * @param {string} url Base URL of the server to query.
 * @param {function(Error, *=)} callback The function to call with the
 *     response.
 */
function getSessions(url, callback) {
  var client = new HttpClient(url);
  var executor = new Executor(client);
  var command = new Command(CommandName.GET_SESSIONS);
  executor.execute(command, function(err, responseObj) {
    if (err) return callback(err);
    try {
      checkResponse(responseObj);
    } catch (ex) {
      return callback(ex);
    }
    callback(null, responseObj['value']);
  });
}

/**
 * Queries a WebDriver server for its current status.
 * @param {string} url Base URL of the server to query.
 * @return {!webdriver.promise.Promise.<!Object>} A promise that resolves with
 *     a hash of the server status.
 */
webdriver.http.util.getSessions = function(url) {
  return promise.checkedNodeCall(getSessions.bind(null, url));
};

/**
 * Sets the amount of time to wait, in milliseconds, for an asynchronous script
 * to finish execution before returning an error. If the timeout is less than or
 * equal to 0, the script will be allowed to run indefinitely.
 *
 * @param {number} ms The amount of time to wait, in milliseconds.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     script timeout has been set.
 */
webdriver.WebDriver.Timeouts.prototype.setPageLoadTimeout = function(ms) {
  return this.driver_.schedule(
      new webdriver.Command(webdriver.CommandName.SET_PAGE_LOAD_TIMEOUT).
          setParameter('type', 'page load').
          setParameter('ms', ms < 0 ? 0 : ms),
      'WebDriver.manage().timeouts().setPageLoadTimeout(' + ms + ')');
};

/**
 * Schedules a command to compute the location of this element in page space.
 * @return {!webdriver.promise.Promise} A promise that will be resolved to the
 *     element's location as a {@code {x:number, y:number}} object.
 */
webdriver.WebElement.prototype.getLocationOnceScrolledIntoView = function() {
  return this.schedule_(
      new webdriver.Command(webdriver.CommandName.GET_ELEMENT_LOCATION_IN_VIEW),
      'WebElement.getLocationOnceScrolledIntoView()');
};

/**
 * Schedules a command to compute the location of this element in page space.
 * @return {!webdriver.promise.Promise} A promise that will be resolved to the
 *     element's location as a {@code {x:number, y:number}} object.
 */
webdriver.WebElement.prototype.describe_ = function() {
  return this.schedule_(
      new webdriver.Command(webdriver.CommandName.DESCRIBE_ELEMENT),
      'WebElement.describe_()');
};


webdriver.Storage = function(driver, name) {
  this.driver_ = driver;
  this.name_ = name.toUpperCase();
};


webdriver.Storage.prototype.setItem = function(key, value) {
  return this.driver_.schedule(
      new webdriver.Command(webdriver.CommandName[
          'SET_' + this.name_  + '_STORAGE_ITEM']).
          setParameter('key', key).
          setParameter('value', value),
      'WebDriver.' + this.name_.toLowerCase() +
      'Storage().setItem(' + key + ', '+ value+')');
};

webdriver.Storage.prototype.getItem = function(key) {
  return this.driver_.schedule(
      new webdriver.Command(webdriver.CommandName[
          'GET_' + this.name_  + '_STORAGE_ITEM']).
          setParameter('key', key),
      'WebDriver.' + this.name_.toLowerCase() +
      'Storage().getItem(' + key + ')');
};


webdriver.Storage.prototype.removeItem = function(key) {
  return this.driver_.schedule(
      new webdriver.Command(webdriver.CommandName[
          'REMOVE_' + this.name_  + '_STORAGE_ITEM']).
          setParameter('key', key),
      'WebDriver.' + this.name_.toLowerCase() +
      'Storage().removeItem(' + key + ')');
};


webdriver.Storage.prototype.clear = function() {
  return this.driver_.schedule(
      new webdriver.Command(webdriver.CommandName[
          'CLEAR_' + this.name_  + '_STORAGE']),
      'WebDriver.' + this.name_.toLowerCase() +
      'Storage().clear()');
};


webdriver.Storage.prototype.getSize = function() {
  return this.driver_.schedule(
      new webdriver.Command(webdriver.CommandName[
          'GET_' + this.name_  + '_STORAGE_SIZE']),
      'WebDriver.' + this.name_.toLowerCase() +
      'Storage().getSize()');
};


webdriver.Storage.prototype.getKeys = function(index) {
  return this.driver_.schedule(
      new webdriver.Command(webdriver.CommandName[
          'GET_' + this.name_  + '_STORAGE_KEYS']),
      'WebDriver.' + this.name_.toLowerCase() +
      'Storage().getKeys()');
};

webdriver.WebDriver.prototype.localStorage = function() {
  return new webdriver.Storage(this, 'local');
};

webdriver.WebDriver.prototype.sessionStorage = function() {
  return new webdriver.Storage(this, 'session');
};


webdriver.Command = Command;
webdriver.http.Executor = Executor;

module.exports = webdriver;
/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
Copyright (c) 2012, Juliusz Gonera <http://juliuszgonera.com/>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// This code is an almost-exact-cut-and-paste from
// phantom-nodify (https://github.com/jgonera/phantomjs-nodify).
// The code has been adapted by Ivan De Marino <ivan.de.marino@gmail.com>
//
// TODO: Remove this as soon as PhantomJS supports
// "CommonJS Require" (http://wiki.commonjs.org/wiki/Modules/1.1).
function patchRequire() {
  var fs = require("fs"),
    phantomRequire = require,
    requireCache = {},
    sourceIds = {},
    phantomModules = ['fs', 'webpage', 'webserver', 'system'];

  function dirname(path) {
    return path.replace(/\/[^\/]*\/?$/, '');
  };

  function basename(path) {
    return path.replace(/.*\//, '');
  };

  function joinPath() {
    var args = Array.prototype.slice.call(arguments);
    return args.join(fs.separator);
  };

  var rootPath = fs.absolute(phantom.libraryPath),
    mainScript = joinPath(rootPath, basename(require('system').args[0]));

  var loadByExt = {
    '.js': function(module, filename) {
      var code = fs.read(filename);
      module._compile(code);
    },

    '.coffee': function(module, filename) {
      var code = fs.read(filename);
      if (typeof CoffeeScript === 'undefined') {
        phantom.injectJs(joinPath(nodifyPath, 'coffee-script.js'));
      }
      try {
        code = CoffeeScript.compile(code);
      } catch (e) {
        e.fileName = filename;
        throw e;
      }
      module._compile(code);
    },

    '.json': function(module, filename) {
      module.exports = JSON.parse(fs.read(filename));
    }
  };

  var exts = Object.keys(loadByExt);

  function tryFile(path) {
    if (fs.isFile(path)) return path;
    return null;
  }

  function tryExtensions(path) {
    var filename;
    for (var i=0; i<exts.length; ++i) {
      filename = tryFile(path + exts[i]);
      if (filename) return filename;
    }
    return null;
  }

  function tryPackage(path) {
    var filename, package, packageFile = joinPath(path, 'package.json');
    if (fs.isFile(packageFile)) {
      package = JSON.parse(fs.read(packageFile));
      if (!package || !package.main) return null;

      filename = fs.absolute(joinPath(path, package.main));

      return tryFile(filename) || tryExtensions(filename) ||
        tryExtensions(joinPath(filename, 'index'));
    }
    return null;
  }

  function Module(filename) {
    this.id = this.filename = filename;
    this.dirname = dirname(filename);
    this.exports = {};
  }

  Module.prototype._getPaths = function(request) {
    var paths = [], dir;

    if (request[0] === '.') {
      paths.push(fs.absolute(joinPath(this.dirname, request)));
    } else if (request[0] === '/') {
      paths.push(fs.absolute(request));
    } else {
      dir = this.dirname;
      while (dir !== '') {
        paths.push(joinPath(dir, 'node_modules', request));
        dir = dirname(dir);
      }
      paths.push(joinPath(nodifyPath, 'modules', request));
    }

    return paths;
  };

  Module.prototype._getFilename = function(request) {
    var path, filename = null, paths = this._getPaths(request);

    for (var i=0; i<paths.length && !filename; ++i) {
      path = paths[i];
      filename = tryFile(path) || tryExtensions(path) || tryPackage(path) ||
        tryExtensions(joinPath(path, 'index'));
    }

    return filename;
  };

  Module.prototype._getRequire = function() {
    var self = this;

    function require(request) {
      return self.require(request);
    }
    require.cache = requireCache;

    return require;
  };

  Module.prototype._load = function() {
    var ext = this.filename.match(/\.[^.]+$/);
    if (!ext) ext = '.js';
    loadByExt[ext](this, this.filename);
  };

  Module.prototype._compile = function(code) {
    // a trick to associate Error's sourceId with file
    code += ";throw new Error('__sourceId__');";
    try {
      var fn = new Function('require', 'exports', 'module', code);
      fn(this._getRequire(), this.exports, this);
    } catch (e) {
      // assign source id (check if already assigned to avoid reassigning
      // on exceptions propagated from other files)
      if (!sourceIds.hasOwnProperty(e.sourceId)) {
        sourceIds[e.sourceId] = this.filename;
      }
      // if it's not the error we added, propagate it
      if (e.message !== '__sourceId__') {
        throw e;
      }
    }
  };

  Module.prototype.require = function(request) {
    if (phantomModules.indexOf(request) !== -1) {
      return phantomRequire(request);
    }

    var filename = this._getFilename(request);
    if (!filename) {
      var e = new Error("Cannot find module '" + request + "'");
      e.fileName = this.filename;
      e.line = '';
      throw e;
    }

    if (requireCache.hasOwnProperty(filename)) {
      return requireCache[filename].exports;
    }

    var module = new Module(filename);
    module._load();
    requireCache[filename] = module;

    return module.exports;
  };

  require = new Module(mainScript)._getRequire();
};

// Execute the patching
patchRequire();
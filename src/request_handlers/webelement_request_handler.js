/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
Copyright (c) 2012, Alex Anderson <@alxndrsn>
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

var ghostdriver = ghostdriver || {};

ghostdriver.WebElementReqHand = function(id, session) {
    // private:
    var
    _id = id + '',      //< ensure this is always a string
    _session = session,
    _locator = new ghostdriver.WebElementLocator(_session),
    _protoParent = ghostdriver.WebElementReqHand.prototype,
    _const = {
        ELEMENT         : "element",
        ELEMENTS        : "elements",
        VALUE           : "value",
        SUBMIT          : "submit",
        DISPLAYED       : "displayed",
        ENABLED         : "enabled",
        ATTRIBUTE       : "attribute",
        NAME            : "name",
        CLICK           : "click",
        SELECTED        : "selected",
        CLEAR           : "clear",
        CSS             : "css",
        TEXT            : "text",
        EQUALS_DIR      : "equals"
    },
    _errors = require("./errors.js"),

    _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        // console.log("Request => " + JSON.stringify(req, null, '  '));

        // TODO lots to do...

        if (req.urlParsed.file === _const.ELEMENT && req.method === "POST") {
            _findElementCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.ELEMENTS && req.method === "POST") {
            _findElementsCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.VALUE && req.method === "POST") {
            _valueCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SUBMIT && req.method === "POST") {
            _submitCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.DISPLAYED && req.method === "GET") {
            _getDisplayedCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.ENABLED && req.method === "GET") {
            _getEnabledCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.ATTRIBUTE && req.method === "GET") {
            _getAttributeCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.NAME && req.method === "GET") {
            _getNameCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.CLICK && req.method === "POST") {
            _postClickCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SELECTED && req.method === "GET") {
            _getSelectedCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.CLEAR && req.method === "POST") {
            _postClearCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.CSS && req.method === "GET") {
            _getCssCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.TEXT && req.method === "GET") {
            _getTextCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.EQUALS && req.method === "GET") {
            _getEqualsCommand(req, res);
            return;
        } // else ...

        // TODO lots to do...

        throw _errors.createInvalidReqInvalidCommandMethodEH(req);
    },

    _getDisplayedCommand = function(req, res) {
        var displayed = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("is_displayed"),
            _getJSON());
        res.respondBasedOnResult(_session, req, displayed);
    },

    _getEnabledCommand = function(req, res) {
        var enabled = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("is_enabled"),
            _getJSON());
        res.respondBasedOnResult(_session, req, enabled);
    },

    _valueCommand = function(req, res) {
        var i, ilen,
            postObj = JSON.parse(req.post),
            typeAtom = require("./webdriver_atoms.js").get("type"),
            typeRes;

        // Ensure all required parameters are available
        if (typeof(postObj) === "object" && typeof(postObj.value) === "object") {
            // Execute the "type" atom
            typeRes = _getSession().getCurrentWindow().evaluate(typeAtom, _getJSON(), postObj.value);

            // TODO - Error handling based on the value of "typeRes"

            res.success(_session.getId());
            return;
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _getNameCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return arguments[0].tagName;",
                [_getJSON()]);

        // Convert value to a lowercase string as per WebDriver JSONWireProtocol spec
        // @see http://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/element/:id/name
        if(result.status === 0) {
            result.value = result.value.toLowerCase();
        }

        res.respondBasedOnResult(_session, req, result);
    },

    _getAttributeCommand = function(req, res) {
        var attributeValueAtom = require("./webdriver_atoms.js").get("get_attribute_value"),
            result;

        if (typeof(req.urlParsed.file) === "string" && req.urlParsed.file.length > 0) {
            // Read the attribute
            result = _session.getCurrentWindow().evaluate(
                attributeValueAtom,     // < Atom to read an attribute
                _getJSON(),             // < Element to read from
                req.urlParsed.file);    // < Attribute to read

            res.respondBasedOnResult(_session, req, result);
            return;
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _getTextCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("get_text"),
            _getJSON());
        res.respondBasedOnResult(_session, req, result);
    },

    _getEqualsCommand = function(req, res) {
        var result;

        if (typeof(req.urlParsed.file) === "string" && req.urlParsed.file.length > 0) {
            result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return arguments[0].isSameNode(arguments[1]);",
                [_getJSON(), _getJSON(req.urlParsed.file)]);
            res.success(_session.getId(), result);
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _submitCommand = function(req, res) {
        var submitRes;

        // Listen for the page to Finish Loading after the submit
        _getSession().getCurrentWindow().setOneShotCallback("onLoadFinished", function(status) {
            if (status === "success") {
                res.success(_session.getId());
            }

            // TODO - what do we do if this fails?
            // TODO - clear thing up after we are done waiting
        });

        submitRes = _getSession().getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("submit"),
            _getJSON());

        // TODO - Error handling based on the value of "submitRes"
    },

    _postClickCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("click"),
                _getJSON());

        res.respondBasedOnResult(_session, req, result);
    },

    _getSelectedCommand = function(req, res) {
        var result = JSON.parse(_session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("is_selected"),
                _getJSON()));

        res.respondBasedOnResult(_session, req, result);
    },

    _postClearCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("clear"),
                _getJSON());
        res.respondBasedOnResult(_session, req, result);
    },

    _getCssCommand = function(req, res) {
        var cssPropertyName = req.urlParsed.file,
            result;

        // Check that a property name was indeed provided
        if (typeof(cssPropertyName) === "string" || cssPropertyName.length > 0) {
            result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return window.getComputedStyle(arguments[0]).getPropertyValue(arguments[1]);",
                [_getJSON(), cssPropertyName]);

            res.respondBasedOnResult(_session, req, result);
            return;
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _findElementCommand = function(req, res) {
        // Search for a WebElement on the Page
        var element,
            searchStartTime = new Date().getTime();

         // Try to find the element
        //  and retry if "startTime + implicitTimeout" is
        //  greater (or equal) than current time
        do {
            element = _locator.locateElement(JSON.parse(req.post), _getId());
            if (element) {
                res.success(_session.getId(), element.getJSON());
                return;
            }
        } while(searchStartTime + _session.getTimeout(_session.timeoutNames().IMPLICIT) >= new Date().getTime());

        throw _errors.createInvalidReqVariableResourceNotFoundEH(req);
    };

    _findElementsCommand = function(req, res) {
        // Search for a WebElement on the Page
        var elements,
            searchStartTime = new Date().getTime(),
            elementsResponse = "";

        // Try to find at least one element
        //  and retry if "startTime + implicitTimeout" is
        //  greater (or equal) than current time
        do {
            elements = _locator.locateElements(JSON.parse(req.post), _getId());
            if (elements.length > 0) {
                // Manually construct the JSON response, since the return
                // from locateElements is an array of WebElementReqHand
                // objects.
                for (var i = 0; i < elements.length; i++) {
                    if (elementsResponse.length > 0) {
                        elementsResponse += ", ";
                    }
                    elementsResponse += JSON.stringify(elements[i].getJSON());
                }
                break;
            }
        } while(searchStartTime + _session.getTimeout(_session.timeoutNames().IMPLICIT) >= new Date().getTime());

        res.success(_session.getId(), JSON.parse("[" + elementsResponse + "]"));
    };


    /** This method can generate any Element JSON: just provide an ID.
     * Will return the one of the current Element if no ID is provided.
     * @param elementId ID of the Element to describe in JSON format,
     *      or undefined to get the one fo the current Element.
     */
    _getJSON = function(elementId) {
        return {
            "ELEMENT" : elementId || _getId()
        };
    },

    _getId = function() { return _id; },
    _getSession = function() { return _session; };

    // public:
    return {
        handle : _handle,
        getId : _getId,
        getJSON : _getJSON,
        getSession : _getSession//,
        // isAttachedToDOM : _isAttachedToDOM,
        // isVisible : _isVisible
    };
};
// prototype inheritance:
ghostdriver.WebElementReqHand.prototype = new ghostdriver.RequestHandler();

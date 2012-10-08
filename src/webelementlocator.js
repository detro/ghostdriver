/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com / detronizator@gmail.com>
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

ghostdriver.WebElementLocator = function(session) {
    // private:
    var
    _supportedStrategies = [
        "class name", "className",              //< Returns an element whose class name contains the search value; compound class names are not permitted.
        "css", "css selector",                  //< Returns an element matching a CSS selector.
        "id",                                   //< Returns an element whose ID attribute matches the search value.
        "name",                                 //< Returns an element whose NAME attribute matches the search value.
        "link text", "linkText",                //< Returns an anchor element whose visible text matches the search value.
        "partial link text", "partialLinkText", //< Returns an anchor element whose visible text partially matches the search value.
        "tag name", "tagName",                  //< Returns an element whose tag name matches the search value.
        "xpath"                                 //< Returns an element matching an XPath expression.
    ],
    _session = session,
    _errors = require("./errors.js"),

    _find = function(what, locator, rootElement) {
        var currWindow = _session.getCurrentWindow(),
            findRes,
            findAtom = require("./webdriver_atoms.js").get(
                "find_" +
                (what.indexOf("element") >= 0 ? what : "element")), //< normalize
            errorMsg;

        if (currWindow !== null &&
            locator && typeof(locator) === "object" &&
            locator.using && locator.value &&         //< if well-formed input
            _supportedStrategies.indexOf(locator.using) >= 0) {  //< and if strategy is recognized

            // console.log("Find element using Locator: " + JSON.stringify(locator));

            // Ensure "rootElement" is valid, otherwise undefine-it
            if (!rootElement || typeof(rootElement) !== "object" || !rootElement["ELEMENT"]) {
                rootElement = undefined;
            }

            // Use Atom "find_result" to search for element in the page
            findRes = currWindow.evaluate(
                findAtom,
                locator.using,
                locator.value,
                rootElement);

            // De-serialise the result of the Atom execution
            try {
                return JSON.parse(findRes);
            } catch (e) {
                errorMsg = "Invalid locator received: "+JSON.stringify(locator);
                console.error(errorMsg);
                return {
                    "status"    : _errors.FAILED_CMD_STATUS_CODES[_errors.FAILED_CMD_STATUS.UNKNOWN_COMMAND],
                    "value"     : errorMsg
                };
            }
        }

        // Window was not found
        return {
            "status"    : _errors.FAILED_CMD_STATUS_CODES[_errors.FAILED_CMD_STATUS.NO_SUCH_WINDOW],
            "value"     : "No such window"
        };
    },

    _locateElement = function(locator, rootElement) {
        var findElementRes = _find("element", locator, rootElement);

        // console.log("Locator: "+JSON.stringify(locator));
        // console.log("Find Element Result: "+JSON.stringify(findElementRes));

        // If found
        if (findElementRes !== null &&
            typeof(findElementRes) === "object" &&
            typeof(findElementRes.status) !== "undefined") {
            // If the atom succeeds, but returns a null value, the element was not found.
            if (findElementRes.status === 0 && findElementRes.value === null) {
                findElementRes.status = _errors.FAILED_CMD_STATUS_CODES[
                    _errors.FAILED_CMD_STATUS.NO_SUCH_ELEMENT
                ];
                findElementRes.value = {
                    "message": "Unable to find element with " +
                        locator.using + " '" +
                        locator.value + "'"
                };
            }
            return findElementRes;
        }

        // Not found
        return {
            "status"    : _errors.FAILED_CMD_STATUS_CODES[_errors.FAILED_CMD_STATUS.NO_SUCH_ELEMENT],
            "value"     : "No Such Element found"
        };
    },

    _locateElements = function(locator, rootElement) {
        var findElementsRes = _find("elements", locator, rootElement),
            elements = [],
            i, ilen;

        // console.log("Locator: "+JSON.stringify(locator));
        // console.log("Find Element(s) Result: "+JSON.stringify(findElementsRes));

        // If something was found
        if (findElementsRes !== null &&
            typeof(findElementsRes) === "object" &&
            findElementsRes.hasOwnProperty("status") &&
            typeof(findElementsRes.status) === "number" &&
            findElementsRes.hasOwnProperty("value") &&
            findElementsRes.value !== null &&
            typeof(findElementsRes.value) === "object") {
            return findElementsRes;
        }

        // Not found
        return {
            "status"    : _errors.FAILED_CMD_STATUS_CODES[_errors.FAILED_CMD_STATUS.NO_SUCH_ELEMENT],
            "value"     : "No Such Elements found"
        };
    },

    _locateActiveElement = function() {
        var currWindow = _session.getCurrentWindow(),
            activeElementRes;

        if (currWindow !== null) {
            activeElementRes = currWindow.evaluate(
                    require("./webdriver_atoms.js").get("active_element"));

            // De-serialise the result of the Atom execution
            try {
                activeElementRes = JSON.parse(activeElementRes);
            } catch (e) {
                return {
                    "status"    : _errors.FAILED_CMD_STATUS_CODES[_errors.FAILED_CMD_STATUS.NO_SUCH_ELEMENT],
                    "value"     : "No Active Element found"
                };
            }

            // If found
            if (typeof(activeElementRes.status) !== "undefined") {
                return activeElementRes;
            }
        }

        return {
            "status"    : _errors.FAILED_CMD_STATUS_CODES[_errors.FAILED_CMD_STATUS.NO_SUCH_WINDOW],
            "value"     : "No such window"
        };
    };

    // public:
    return {
        locateElement : _locateElement,
        locateElements : _locateElements,
        locateActiveElement : _locateActiveElement
    };
};

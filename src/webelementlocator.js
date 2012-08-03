/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
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

    _find = function(what, locator, rootElement) {
        var findRes,
            findAtom = require("./webdriver_atoms.js").get(
                "find_" +
                (what.indexOf("element") >= 0 ? what : "element")); //< normalize

        if (locator && typeof(locator) === "object" &&
            locator.using && locator.value &&         //< if well-formed input
            _supportedStrategies.indexOf(locator.using) >= 0) {  //< and if strategy is recognized

            // Ensure "rootElement" is valid, otherwise undefine-it
            if (!rootElement || typeof(rootElement) !== "object" || !rootElement.hasOwnProperty("ELEMENT")) {
                rootElement = undefined;
            }

            // Use Atom "find_result" to search for element in the page
            findRes = _session.getCurrentWindow().evaluate(
                findAtom,
                locator.using,
                locator.value,
                rootElement);

            // De-serialise the result of the Atom execution
            try {
                return JSON.parse(findRes);
            } catch (e) {
                console.error("Invalid locator received: "+JSON.stringify(locator));
                return null;
            }
        }
        return null;
    },

    _locateElement = function(type, locator, rootElement) {
        // TODO Handle NoSuchWindow
        // TODO Handle NoSuchElement
        // TODO Handle XPathLookupError
        // TODO Handle Unsupported Locators (rare)
        var findElementRes = _find("element", locator, rootElement);

        // console.log("Locator: "+JSON.stringify(locator));

        // If found
        if (findElementRes !== null && typeof(findElementRes) === "object" &&
            typeof(findElementRes.status) !== "undefined" && findElementRes.status === 0) {

            if (type === "JSON") {
                // Return the Element JSON ID
                return findElementRes.value;
            } else {
                // Return the (Web)Element
                return _getElement(findElementRes.value);
            }
        }

        // Not found
        return null;
    },

    _locateElements = function(type, locator, rootElement) {
        // TODO Handle NoSuchWindow
        // TODO Handle NoSuchElement
        // TODO Handle XPathLookupError
        // TODO Handle Unsupported Locators (rare)
        var findElementsRes = _find("elements", locator, rootElement),
            elements = [],
            i, ilen;

        // console.log("Locator: "+JSON.stringify(locator));

        // If found
        if (findElementsRes !== null && typeof(findElementsRes) === "object" &&
            typeof(findElementsRes.status) !== "undefined" && findElementsRes.status === 0) {

            if (type === "JSON") {
                // Return the array of Element JSON ID as is
                return findElementsRes.value;
            } else {
                // Return all the (Web)Elements we were able to find
                // Put all the Elements in an array
                for (i = 0, ilen = findElementsRes.value.length; i < ilen; ++i) {
                    // Add to the result array
                    elements.push(_getElement(findElementsRes.value[i]));
                }
                return elements;
            }
        }

        // Not found
        return null;
    },

    _locateActiveElement = function(type) {
        // TODO Handle NoSuchWindow
        // TODO Handle NoSuchElement

        var activeElementRes = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("active_element"));

        // De-serialise the result of the Atom execution
        try {
            activeElementRes = JSON.parse(activeElementRes);
        } catch (e) {
            return null;
        }

        // If found
        if (typeof(activeElementRes.status) !== "undefined" && activeElementRes.status === 0) {

            if (type === "JSON") {
                // Return the Element JSON ID
                return activeElementRes.value;
            } else {
                // Return the (Web)Element
                return _getElement(activeElementRes.value);
            }
        }

        return null;
    },

    _getElement = function(idOrElement) {
        return new ghostdriver.WebElementReqHand(idOrElement, _session);
    };

    // public:
    return {
        locateElement : _locateElement,
        locateElements : _locateElements,
        locateActiveElement : _locateActiveElement,
        getElement : _getElement
    };
};

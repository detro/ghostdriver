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

    _locateElement = function(locator, rootElementId) {
        var elementId,
            findElementAtom = require("./webdriver_atoms.js").get("find_element"),
            findElementRes;

        // console.log("Locator: "+JSON.stringify(locator));

        if (locator && locator.using && locator.value &&         //< if well-formed input
            _supportedStrategies.indexOf(locator.using) >= 0) {  //< and if strategy is recognized

            var rootElement;
            if (rootElementId) {
                rootElement = { "ELEMENT" : rootElementId };
            }

            // Use Atom "find_result" to search for element in the page
            findElementRes = _session.getCurrentWindow().evaluate(
                findElementAtom,
                locator.using,
                locator.value,
                rootElement);

            // console.log("Find Element Result: "+JSON.stringify(findElementRes));

            // TODO Handle Missing Elements and XPath errors

            // De-serialise the result of the Atom execution
            try {
                findElementRes = JSON.parse(findElementRes);
            } catch (e) {
                console.error("Invalid locator received: "+JSON.stringify(locator));
                return null;
            }

            // If the Element is found, create a relative WebElement Request Handler and return it
            if (typeof(findElementRes.status) !== "undefined" && findElementRes.status === 0) {
                return _getElement(findElementRes.value, _session);
            }
        }

        // Not found because of invalid Locator
        return null;    // TODO Handle unsupported locator strategy error
    },

    _locateElements = function(locator, rootElementId) {
        var elementId,
            findElementsAtom = require("./webdriver_atoms.js").get("find_elements"),
            findElementsRes,
            rootElement,
            elementsRes = [],
            i, ilen;

        // console.log("Locator: "+JSON.stringify(locator)+", Parent: "+rootElementId);

        if (locator && locator.using && locator.value &&         //< if well-formed input
            _supportedStrategies.indexOf(locator.using) >= 0) {  //< and if strategy is recognized

            if (typeof(rootElementId) !== "undefined") {
                rootElement = { "ELEMENT" : rootElementId };
            }

            // Use Atom "find_result" to search for element in the page
            findElementsRes = _session.getCurrentWindow().evaluate(
                findElementsAtom,
                locator.using,
                locator.value,
                rootElement);

            // console.log("Find Element Result: "+JSON.stringify(findElementsRes));

            // TODO Handle Missing Elements and XPath errors

            // De-serialise the result of the Atom execution
            try {
                findElementsRes = JSON.parse(findElementsRes);
            } catch (e) {
                console.error("Invalid locator received: "+JSON.stringify(locator));
                return null;
            }

            // If the Elements are found, create all the relative
            // WebElement Request Handler and return them in an array
            if (typeof(findElementsRes.status) !== "undefined" && findElementsRes.status === 0) {
                for (i = 0, ilen = findElementsRes.value.length; i < ilen; ++i) {
                    // Add to the result array
                    elementsRes.push(_getElement(findElementsRes.value[i], _session));
                }
                return elementsRes;
            }
        }

        // Not found because of invalid Locator
        return null;    // TODO Handle unsupported locator strategy error
    },

    _getElement = function(idOrElement) {
        return new ghostdriver.WebElementReqHand(idOrElement, _session);
    }

    // _getElementFromCache = function(id) {
    //     var result = _session.getCurrentWindow().evaluate(
    //             require("./webdriver_atoms.js").get("execute_script"),
    //             "return (" + require("./webdriver_atoms.js").get("get_element_from_cache") + ")(arguments[0]);",
    //             [{ "ELEMENT" : id }]);

    //     console.log("Get elem from cache result => " + JSON.stringify(result, null, "  "));

    //     if (result.hasOwnProperty("status") && result.status === 0) {
    //         return result.value;
    //     } else {
    //         return null;
    //     }
    // }
    ;

    // public:
    return {
        locateElement : _locateElement,
        locateElements : _locateElements,
        getElement : _getElement
    };
};

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
    var _const = {
        CLASS_NAME          : "class name",
        CSS_SELECTOR        : "css selector",
        ID                  : "id",
        NAME                : "name",
        LINK_TEXT           : "link text",
        PARTIAL_LINK_TEXT   : "partial link text",
        TAG_NAME            : "tag name",
        XPATH               : "xpath"
    },
    _supportedStrategies = [
        _const.CLASS_NAME,           //< Returns an element whose class name contains the search value; compound class names are not permitted.
        _const.CSS_SELECTOR,         //< Returns an element matching a CSS selector.
        _const.ID,                   //< Returns an element whose ID attribute matches the search value.
        _const.NAME,                 //< Returns an element whose NAME attribute matches the search value.
        _const.LINK_TEXT,            //< Returns an anchor element whose visible text matches the search value.
        _const.PARTIAL_LINK_TEXT,    //< Returns an anchor element whose visible text partially matches the search value.
        _const.TAG_NAME,             //< Returns an element whose tag name matches the search value.
        _const.XPATH                 //< Returns an element matching an XPath expression.
    ],
    _elements = {},
    _session = session,

    _locateElement = function(locator) {
        var elementId,
            findElementAtom = require("./webdriver_atoms.js").get("find_element"),
            findElementRes;

        if (locator && locator.using && locator.value &&              //< if well-formed input
            _supportedStrategies.indexOf(locator.using) >= 0) {  //< and if strategy is recognized

            // Use Atom "find_result" to search for element in the page
            findElementRes = _session.getCurrentWindow().evaluate(findElementAtom, locator.using, locator.value);

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
                elementId = findElementRes.value["ELEMENT"];
                // Create and Store a new WebElement if it doesn't exist yet
                if (typeof(_elements[elementId]) === "undefined") {
                    // TODO There is no need to store elements here and have them wrapped in WebElementReqHand
                    _elements[elementId] = new ghostdriver.WebElementReqHand(elementId, _session);
                }
                return _elements[elementId];
            }
        }

        // Not found because of invalid Locator
        return null;
    },

    _getElement = function(id) {
        if (typeof(_elements[id]) !== "undefined") {
            return _elements[id];
        }
        return null;
    };

    // public:
    return {
        locateElement : _locateElement,
        getElement : _getElement
    };
};

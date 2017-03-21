/*
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2012-2014, Ivan De Marino <http://ivandemarino.me>
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

/**
 * @fileoverview Ready to inject atoms for manipulating the DOM.
 */

goog.provide('phantomjs.atoms.inject.action');

goog.require('bot.action');
goog.require('bot.inject');
goog.require('goog.dom.selection');
goog.require('goog.style');
goog.require('webdriver.atoms.element');
goog.require('webdriver.chrome');

/**
 * Test if an element is a file input element.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to test.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.isFileInput = function(element) {
    return bot.inject.executeScript(function(e) {
        if (e.tagName.toLowerCase() === "input") {
            return e.type.toLowerCase() === "file";
        }
        return false;
    }, [element], true);
};

/**
 * Test if an element is a content editable
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to test.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.isContentEditable = function(element) {
    return bot.inject.executeScript(function(e) {
        return e.isContentEditable;
    }, [element], true);
};

/**
 * Test if two elements are the same node.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} elementa The first element
 * @param {!{bot.inject.ELEMENT_KEY:string}} elementb The second element
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.equals = function(elementa, elementb) {
    return bot.inject.executeScript(function(a, b) {
        return a.isSameNode(b);
    }, [elementa, elementb], true);
};

/**
 * Get the frame name or set the value if it does not exist
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The frame element
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.frameName = function(element) {
    return bot.inject.executeScript(function(e) {
        if (!e.name && !e.id) {
            e.name = 'random_name_id_' + new Date().getTime();
            e.id = e.name;
        }
        return e.name || e.id;
    }, [element], true);
};

/**
 * Get the elements tag name.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to focus on.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.getName = function(element) {
    return bot.inject.executeScript(function(e) {
        return e.tagName.toLowerCase();
    }, [element], true);
};

/**
 * Get the current location
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to focus on.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.getLocation = function(element) {
    return bot.inject.executeScript(goog.style.getPageOffset, [element], true);
};

/**
 * Get the current location in view
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to focus on.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.getLocationInView = function(element) {
    return bot.inject.executeScript(webdriver.chrome.getLocationInView, [element], true);
};


/**
 * Scrolls the given {@code element} in to the current viewport. Aims to do the
 * minimum scrolling necessary, but prefers too much scrolling to too little.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to scroll into view.
 * @param {!{x:number,y:number}} opt_coords Offset relative to the top-left
 *     corner of the element, to ensure is scrolled in to view.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject};
 *     whether the element is in view after scrolling.
 */
phantomjs.atoms.inject.action.scrollIntoView = function(element, opt_coords) {
    return bot.inject.executeScript(bot.action.scrollIntoView, [element, opt_coords], true);
};

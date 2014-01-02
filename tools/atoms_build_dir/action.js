/*
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2014, Ivan De Marino <http://ivandemarino.me>
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
goog.require('webdriver.atoms.element');

/**
 * Focuses on the given element if it is not already the active element.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to focus on.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 * @see bot.action.focusOnElement
 */
phantomjs.atoms.inject.action.focusOnElement = function(element) {
    return bot.inject.executeScript(bot.action.focusOnElement, [element], true);
};

/**
 * Moves the mouse over the given {@code element} with a virtual mouse.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to move to.
 * @param {!{x:number,y:number}} opt_coords Mouse position relative to the element (optional).
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.moveMouse = function(element, opt_coords) {
    return bot.inject.executeScript(bot.action.moveMouse, [element, opt_coords], true);
};

/**
 * Right-clicks on the given {@code element} with a virtual mouse.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to right-click.
 * @param {!{x:number,y:number}} opt_coords Mouse position relative to the element (optional).
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.rightClick = function(element, opt_coords) {
    return bot.inject.executeScript(bot.action.rightClick, [element, opt_coords], true);
};

/**
 * Double-clicks on the given {@code element} with a virtual mouse.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to double-click.
 * @param {!{x:number,y:number}} opt_coords Mouse position relative to the element (optional).
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.doubleClick = function(element, opt_coords) {
    return bot.inject.executeScript(bot.action.doubleClick, [element, opt_coords], true);
};

/**
 * Scrolls the mouse wheel on the given {@code element} with a virtual mouse.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to scroll the mouse wheel on.
 * @param {number} ticks Number of ticks to scroll the mouse wheel;
 *   a positive number scrolls down and a negative scrolls up.
 * @param {!{x:number,y:number}} opt_coords Mouse position relative to the element (optional).
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.scrollMouse = function(element, ticks, opt_coords) {
    return bot.inject.executeScript(bot.action.scrollMouse, [element, ticks, opt_coords], true);
};

/**
 * Drags the given {@code element} by (dx, dy) with a virtual mouse.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to drag.
 * @param {number} dx Increment in x coordinate.
 * @param {number} dy Increment in y coordinate.
 * @param {!{x:number,y:number}} opt_coords Drag start position relative to the element.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.drag = function(element, dx, dy, opt_coords) {
    return bot.inject.executeScript(bot.action.drag, [element, dx, dy, opt_coords], true);
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

/**
 * Taps on the given {@code element} with a virtual touch screen.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to tap.
 * @param {!{x:number,y:number}} opt_coords Finger position relative to the target.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.tap = function(element, opt_coords) {
    return bot.inject.executeScript(bot.action.tap, [element, opt_coords], true);
};

/**
 * Swipes the given {@code element} by (dx, dy) with a virtual touch screen.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to swipe.
 * @param {number} dx Increment in x coordinate.
 * @param {number} dy Increment in y coordinate.
 * @param {!{x:number,y:number}} opt_coords Swipe start position relative to the element.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.swipe = function(element, dx, dy, opt_coords) {
    return bot.inject.executeScript(bot.action.swipe, [element, dx, dy, opt_coords], true);
};

/**
 * Pinches the given {@code element} by the given distance with a virtual touch
 * screen. A positive distance moves two fingers inward toward each and a
 * negative distances spreds them outward. The optional coordinate is the point
 * the fingers move towards (for positive distances) or away from (for negative
 * distances); and if not provided, defaults to the center of the element.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to pinch.
 * @param {number} distance The distance by which to pinch the element.
 * @param {!{x:number,y:number}} opt_coords Position relative to the element at the center of the pinch.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.pinch = function(element, distance, opt_coords) {
    return bot.inject.executeScript(bot.action.pinch, [element, distance, opt_coords], true);
};

/**
 * Rotates the given {@code element} by the given angle with a virtual touch
 * screen. A positive angle moves two fingers clockwise and a negative angle
 * moves them counter-clockwise. The optional coordinate is the point to
 * rotate around; and if not provided, defaults to the center of the element.
 *
 * @param {!{bot.inject.ELEMENT_KEY:string}} element The element to rotate.
 * @param {number} angle The angle by which to rotate the element.
 * @param {!{x:number,y:number}} opt_coords Position relative to the element at the center of the rotation.
 * @return {(string|{status: bot.ErrorCode.<number>, value: *})} A stringified {@link bot.response.ResponseObject}.
 */
phantomjs.atoms.inject.action.rotate = function(element, angle, opt_coords) {
    return bot.inject.executeScript(bot.action.rotate, [element, angle, opt_coords], true);
};

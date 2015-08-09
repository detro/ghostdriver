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

package org.openqa.selenium.phantomjs;

import org.openqa.selenium.remote.HttpCommandExecutor;

/**
 * A specialized {@link org.openqa.selenium.remote.HttpCommandExecutor} that will use a
 * {@link PhantomJSDriverService}. Unlike {@Link PhantomJSCommandExecutor} the lifecycle
 * of the service is to be managed by the caller, allowing the use of one single service
 * by multiple drivers.
 */
public class MultiSessionCommandExecutor extends HttpCommandExecutor {

    /**
     * Creates a new MultiSessionCommandExecutor.
     * The PhantomJSCommandExecutor will communicate with the PhantomJS/GhostDriver through the given {@code service}.
     *
     * @param service The PhantomJSDriverService to send commands to.
     */
    public MultiSessionCommandExecutor(PhantomJSDriverService service) {
        super(PhantomJSDriver.getCustomCommands(), service.getUrl());
    }
}

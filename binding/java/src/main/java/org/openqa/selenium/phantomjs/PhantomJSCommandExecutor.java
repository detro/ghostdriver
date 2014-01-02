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

package org.openqa.selenium.phantomjs;

import com.google.common.base.Throwables;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.Response;

import java.io.IOException;
import java.net.ConnectException;

/**
 * A specialized {@link org.openqa.selenium.remote.HttpCommandExecutor} that will use a
 * {@link PhantomJSDriverService} that lives and dies with a single WebDriver session.
 * <p/>
 * The service will be restarted upon each new session request and shutdown after each quit command.
 * <p/>
 * NOTE: Yes, the design of this class is heavily inspired by
 * {@link org.openqa.selenium.chrome.ChromeCommandExecutor}.
 *
 * @author Ivan De Marino <http://ivandemarino.me>
 */
class PhantomJSCommandExecutor extends HttpCommandExecutor {

    private final PhantomJSDriverService service;

    /**
     * Creates a new PhantomJSCommandExecutor.
     * The PhantomJSCommandExecutor will communicate with the PhantomJS/GhostDriver through the given {@code service}.
     *
     * @param service The PhantomJSDriverService to send commands to.
     */
    public PhantomJSCommandExecutor(PhantomJSDriverService service) {
        super(PhantomJSDriver.getCustomCommands(), service.getUrl());
        this.service = service;
    }

    /**
     * Sends the {@code command} to the PhantomJS/GhostDriver server for execution.
     * The server will be started if requesting a new session.
     * Likewise, if terminating a session, the server will be shutdown once a response is received.
     *
     * @param command The command to execute.
     * @return The command response.
     * @throws java.io.IOException If an I/O error occurs while sending the command.
     */
    @Override
    public Response execute(Command command) throws IOException {
        if (DriverCommand.NEW_SESSION.equals(command.getName())) {
            service.start();
        }

        try {
            return super.execute(command);
        } catch (Throwable t) {
            Throwable rootCause = Throwables.getRootCause(t);
            if (rootCause instanceof ConnectException &&
                    "Connection refused".equals(rootCause.getMessage()) &&
                    !service.isRunning()) {
                throw new WebDriverException("The PhantomJS/GhostDriver server has unexpectedly died!", t);
            }
            Throwables.propagateIfPossible(t);
            throw new WebDriverException(t);
        } finally {
            if (DriverCommand.QUIT.equals(command.getName())) {
                service.stop();
            }
        }
    }
}


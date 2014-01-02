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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.*;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

import java.util.HashMap;
import java.util.Map;

/**
 * A {@link org.openqa.selenium.WebDriver} implementation that controls a PhantomJS running in Remote WebDriver mode.
 * This class is provided as a convenience for easily testing PhantomJS.
 * The control server which each instance communicates with will live and die with the instance.
 * <p/>
 * The Driver requires to optionally set some Capabilities or Environment Variables:
 * <ul>
 * <li>{@link PhantomJSDriverService#PHANTOMJS_EXECUTABLE_PATH_PROPERTY}</li>
 * <li>{@link PhantomJSDriverService#PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY}</li>
 * </ul>
 * <p/>
 * {@link PhantomJSDriverService#PHANTOMJS_EXECUTABLE_PATH_PROPERTY} is required only if the executable
 * <code>phantomjs</code> is not available through the <code>$PATH</code> environment variable:
 * you can provide it either via the {@link Capabilities} construction parameter object,
 * or via {@link System} Property.
 * <p/>
 * {@link PhantomJSDriverService#PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY} is optional in case you want to use a specific
 * version of GhostDriver (i.e. during development of GhostDriver).
 * You can provide it either via the {@link Capabilities} construction parameter object,
 * or via {@link System} Property.
 * <p/>
 * Instead, if you have a PhantomJS WebDriver process already running, you can instead use {@link
 * RemoteWebDriver#RemoteWebDriver(java.net.URL, org.openqa.selenium.Capabilities)} to delegate the
 * execution of your WebDriver/Selenium scripts to it. Of course, in that case you will than be in
 * charge to control the life-cycle of the PhantomJS process.
 * <p/>
 * NOTE: PhantomJS Remote WebDriver mode is implemented via
 * <a href="https://github.com/detro/ghostdriver">GhostDriver</a>.
 * It's a separate project that, at every stable release, is merged into PhantomJS.
 * If interested in developing (contributing to) GhostDriver, it's possible to run PhantomJS and pass GhostDriver as
 * a script.
 * <p/>
 * NOTE: The design of this class is heavily inspired by {@link org.openqa.selenium.chrome.ChromeDriver}.
 *
 * @author Ivan De Marino <http://ivandemarino.me>
 * @see PhantomJSDriverService#createDefaultService()
 */
public class PhantomJSDriver extends RemoteWebDriver implements TakesScreenshot {

    /**
     * Creates a new PhantomJSDriver instance. The instance will have a
     * default set of desired capabilities.
     *
     * @see org.openqa.selenium.phantomjs.PhantomJSDriverService#createDefaultService() for configuration details.
     */
    public PhantomJSDriver() {
        this(DesiredCapabilities.phantomjs());
    }

    /**
     * Creates a new PhantomJSDriver instance.
     *
     * @param desiredCapabilities The capabilities required from PhantomJS/GhostDriver.
     * @see org.openqa.selenium.phantomjs.PhantomJSDriverService#createDefaultService() for configuration details.
     */
    public PhantomJSDriver(Capabilities desiredCapabilities) {
        this(PhantomJSDriverService.createDefaultService(desiredCapabilities), desiredCapabilities);
    }

    /**
     * Creates a new PhantomJSDriver instance. The {@code service} will be started along with the
     * driver, and shutdown upon calling {@link #quit()}.
     *
     * @param service             The service to use.
     * @param desiredCapabilities The capabilities required from PhantomJS/GhostDriver.
     */
    public PhantomJSDriver(PhantomJSDriverService service, Capabilities desiredCapabilities) {
        super(new PhantomJSCommandExecutor(service), desiredCapabilities);
    }

    /**
     * Take screenshot of the current window.
     *
     * @param target The target type/format of the Screenshot
     * @return Screenshot of current window, in the requested format
     * @see TakesScreenshot#getScreenshotAs(org.openqa.selenium.OutputType)
     */
    @Override
    public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
        // Get the screenshot as base64 and convert it to the requested type (i.e. OutputType<T>)
        String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
        return target.convertFromBase64Png(base64);
    }

    /**
     * Execute a PhantomJS fragment.  Provides extra functionality not found in WebDriver
     * but available in PhantomJS.
     * <p/>
     * See the <a href="https://github.com/ariya/phantomjs/wiki/API-Reference">PhantomJS API<</a>
     * for details on what is available.
     * <p/>
     * A 'page' variable pointing to currently selected page is available for use.
     * If there is no page yet, one is created.
     * <p/>
     * When overriding any callbacks be sure to wrap in a try/catch block, as failures
     * may cause future WebDriver calls to fail.
     * <p/>
     * Certain callbacks are used by GhostDriver (the PhantomJS WebDriver implementation)
     * already.  Overriding these may cause the script to fail.  It's a good idea to check
     * for existing callbacks before overriding.
     *
     * @param script The fragment of PhantomJS JavaScript to execute.
     * @param args List of arguments to pass to the function that the script is wrapped in.
     *             These can accessed in the script as 'arguments[0]', 'arguments[1]',
     *             'arguments[2]', etc
     * @return The result of the evaluation.
     */
    public Object executePhantomJS(String script, Object... args) {
        script = script.replaceAll("\"", "\\\"");

        Iterable<Object> convertedArgs = Iterables.transform(
                Lists.newArrayList(args), new WebElementToJsonConverter());
        Map<String, ?> params = ImmutableMap.of(
                "script", script, "args", Lists.newArrayList(convertedArgs));

        return execute(COMMAND_EXECUTE_PHANTOM_SCRIPT, params).getValue();
    }

    private static final String COMMAND_EXECUTE_PHANTOM_SCRIPT = "executePhantomScript";

    protected static Map<String, CommandInfo> getCustomCommands() {
        Map<String, CommandInfo> customCommands = new HashMap<String, CommandInfo>();

        customCommands.put(COMMAND_EXECUTE_PHANTOM_SCRIPT,
                new CommandInfo("/session/:sessionId/phantom/execute", HttpVerb.POST));

        return customCommands;
    }
}

/*
Copyright 2012 Ivan De Marino <ivan.de.marino@gmail.com>
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.phantomjs;

import org.openqa.selenium.*;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

/**
 * @class PhantomJSDriver
 *
 * A {@link org.openqa.selenium.WebDriver} implementation that controls a PhantomJS running locally GhostDriver.
 * This class is provided as a convenience for easily testing PhantomJS.
 * The control server which each instance communicates with will live and die with the instance.
 *
 * Instead, if you have a PhantomJS WebDriver process already running, you can instead use
 * {@link RemoteWebDriver#RemoteWebDriver(java.net.URL, org.openqa.selenium.Capabilities)} to
 * delegate the execution of your WebDriver/Selenium scripts to it.
 * Of course, in that case you will than be in charge to control the life-cycle of the PhantomJS process.
 *
 * NOTE: <a href="https://github.com/detro/ghostdriver">GhostDriver</a> it's the PhantomJS Driver. It's currently
 * a separate project but will later on become one with PhantomJS, making the requirement of the dedicated
 * capability entry obsolete. Also, GhostDriver, being it a work in progress, might rely on a specific version
 * of PhantomJS: please read carefully the instructions available at the project homepage.
 *
 * NOTE: Yes, the design of this class is heavily inspired by {@link org.openqa.selenium.chrome.ChromeDriver}.
 *
 * @see PhantomJSDriverService#createDefaultService()
 */
@Beta
public class PhantomJSDriver extends RemoteWebDriver implements TakesScreenshot {

// TODO Restore once merged into the Selenium codebase
//    public PhantomJSDriver() {
//        this(PhantomJSDriverService.createDefaultService(), DesiredCapabilities.phantomjs());
//    }
//
//    public PhantomJSDriver(PhantomJSDriverService service) {
//        this(service, DesiredCapabilities.phantomjs());
//    }

    /**
     * Creates a new PhantomJSDriver instance.
     * @see org.openqa.selenium.phantomjs.PhantomJSDriverService#createDefaultService() for configuration details.
     *
     * @param desiredCapabilities The capabilities required from PhantomJS/GhostDriver.
     */
    public PhantomJSDriver(Capabilities desiredCapabilities) {
        this(PhantomJSDriverService.createDefaultService(desiredCapabilities), desiredCapabilities);
    }

    /**
     * Creates a new PhantomJSDriver instance. The {@code service} will be started along with the
     * driver, and shutdown upon calling {@link #quit()}.
     *
     * @param service The service to use.
     * @param desiredCapabilities The capabilities required from PhantomJS/GhostDriver.
     */
    public PhantomJSDriver(PhantomJSDriverService service, Capabilities desiredCapabilities) {
        super(new DriverCommandExecutor(service), desiredCapabilities);
    }

    /**
     * Take screenshot of the current window.
     *
     * @param target The target type/format of the Screenshot
     * @return Screenshot of current window, in the requested format
     * @throws WebDriverException
     * @see TakesScreenshot#getScreenshotAs(org.openqa.selenium.OutputType)
     */
    @Override
    public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
        // Get the screenshot as base64 and convert it to the requested type (i.e. OutputType<T>)
        String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
        return target.convertFromBase64Png(base64);
    }
}

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

package ghostdriver;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import phantomjs.PhantomJSDriver;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;

/**
 * Tests base class.
 * Takes care of initialising the Remote WebDriver
 */
public abstract class BaseTest {
    private WebDriver mDriver = null;

    private static final String CONFIG_FILE         = "config.ini";
    private static final String BROWSER_FIREFOX     = "firefox";
    private static final String BROWSER_PHANTOMJS   = "phantomjs";

    private static Properties sConfig;
    private static DesiredCapabilities sCaps;

    @BeforeClass
    public static void configure() throws IOException {
        // Read config file
        sConfig = new Properties();
        sConfig.load(new FileReader(CONFIG_FILE));

        // Prepare capabilities
        sCaps = new DesiredCapabilities();
        sCaps.setJavascriptEnabled(true);
        sCaps.setCapability("takesScreenshot", false);
        sCaps.setCapability(PhantomJSDriver.CAPABILITY_PHANTOMSJS_EXEC_PATH, sConfig.getProperty("phantomjs_exec_path"));
        sCaps.setCapability(PhantomJSDriver.CAPABILITY_PHANTOMJS_DRIVER_PATH, sConfig.getProperty("phantomjs_driver_path"));
    }

    @Before
    public void prepareDriver() throws Exception
    {
        // Which browser to use? (default "phantomjs")
        String browser = sConfig.getProperty("browser", BROWSER_PHANTOMJS);

        // Start the appropriate driver
        if (browser.equals(BROWSER_FIREFOX)) {
            mDriver = new FirefoxDriver(sCaps);
        } else if (browser.equals(BROWSER_PHANTOMJS)) {
            mDriver = new PhantomJSDriver(sCaps);
        }
    }

    protected WebDriver getDriver() {
        return mDriver;
    }

    @After
    public void quitDriver() {
        if (mDriver != null) {
            mDriver.quit();
            mDriver = null;
        }
    }
}

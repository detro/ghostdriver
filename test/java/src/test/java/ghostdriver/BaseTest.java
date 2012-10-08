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

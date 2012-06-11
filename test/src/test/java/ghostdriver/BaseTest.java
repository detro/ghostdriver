package ghostdriver;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.URL;

/**
 * Tests base class.
 * Takes care of initialising the Remote WebDriver
 */
public abstract class BaseTest {
    private WebDriver mDriver = null;
    private static final String GHOSTDRIVER_URL = "http://localhost:8080";

    @Before
    public void prepareDriver() throws Exception
    {
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setJavascriptEnabled(true);
        mDriver = new RemoteWebDriver(new URL(GHOSTDRIVER_URL), capabilities);
//        mDriver = new FirefoxDriver(capabilities);
    }

    protected WebDriver getDriver() {
        return mDriver;
    }

    @After
    public void quitDriver() {
        mDriver.quit();
    }
}

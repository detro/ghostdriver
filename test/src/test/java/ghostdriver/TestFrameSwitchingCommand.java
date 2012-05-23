package ghostdriver;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.URL;
import java.util.concurrent.TimeUnit;


public class TestFrameSwitchingCommand {
    private WebDriver mDriver = null;
    private static final String GHOSTDRIVER_URL = "http://localhost:8080";

    @Before
    public void prepareDriver() throws Exception
    {
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setJavascriptEnabled(true);
        mDriver = new RemoteWebDriver(new URL(GHOSTDRIVER_URL), capabilities);
    }

    @Test
    public void switchToFrameZero() throws Exception {
        mDriver.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        mDriver.switchTo().frame(0);
//        WebElement e = (WebElement)((JavascriptExecutor) mDriver).executeScript("return document.querySelector(arguments[0])", ".FrameHeadingFont");
//        assertEquals(e.getTagName(), "FONT");
    }
}

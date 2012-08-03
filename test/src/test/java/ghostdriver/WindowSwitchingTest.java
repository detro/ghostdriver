package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.WebDriver;

import java.util.ArrayList;
import java.util.Set;

import static org.junit.Assert.*;

public class WindowSwitchingTest extends BaseTest {
    @Test
    public void switchBetween3WindowsThenDeleteSecondOne() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        String googleWH = d.getWindowHandle();
        assertEquals(d.getWindowHandles().size(), 1);

        // Open a new window and make sure the window handle is different
        ((JavascriptExecutor) d).executeScript("window.open('http://www.yahoo.com', 'yahoo')");
        assertEquals(d.getWindowHandles().size(), 2);
        String yahooWH = (String) d.getWindowHandles().toArray()[1];
        assertTrue(!yahooWH.equals(googleWH));

        // Switch to the yahoo window and check that the current window handle has changed
        d.switchTo().window(yahooWH);
        assertEquals(d.getWindowHandle(), yahooWH);

        // Open a new window and make sure the window handle is different
        ((JavascriptExecutor) d).executeScript("window.open('http://www.bing.com', 'bing')");
        assertEquals(d.getWindowHandles().size(), 3);
        String bingWH = (String) d.getWindowHandles().toArray()[2];
        assertTrue(!bingWH.equals(googleWH));
        assertTrue(!bingWH.equals(yahooWH));

        // Close yahoo window
        d.close();

        // Switch to google window and notice that only google and bing are left
        d.switchTo().window(googleWH);
        assertEquals(d.getWindowHandles().size(), 2);
        assertTrue(d.getWindowHandles().contains(googleWH));
        assertTrue(d.getWindowHandles().contains(bingWH));
    }

    @Test(expected = Exception.class)
    public void switchBetween3WindowsThenDeleteFirstOne() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        String googleWH = d.getWindowHandle();
        assertEquals(d.getWindowHandles().size(), 1);

        // Open a new window and make sure the window handle is different
        ((JavascriptExecutor) d).executeScript("window.open('http://www.yahoo.com', 'yahoo')");
        assertEquals(d.getWindowHandles().size(), 2);
        String yahooWH = (String) d.getWindowHandles().toArray()[1];
        assertTrue(!yahooWH.equals(googleWH));

        // Switch to the yahoo window and check that the current window handle has changed
        d.switchTo().window(yahooWH);
        assertEquals(d.getWindowHandle(), yahooWH);

        // Open a new window and make sure the window handle is different
        ((JavascriptExecutor) d).executeScript("window.open('http://www.bing.com', 'bing')");
        assertEquals(d.getWindowHandles().size(), 3);
        String bingWH = (String) d.getWindowHandles().toArray()[2];
        assertTrue(!bingWH.equals(googleWH));
        assertTrue(!bingWH.equals(yahooWH));

        // Switch to google window and close it
        d.switchTo().window(googleWH);
        d.close();

        // Notice that yahoo and bing are the only left
        assertEquals(d.getWindowHandles().size(), 2);
        assertTrue(d.getWindowHandles().contains(yahooWH));
        assertTrue(d.getWindowHandles().contains(bingWH));

        // Try getting the title of the, now closed, google window and cause an Exception
        d.getTitle();
    }
}

package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertTrue;

public class WindowsTest extends BaseTest {
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

        // Switch to the yahoo window and check that the current window handle has changed
        d.switchTo().window(yahooWH);
        assertEquals(d.getWindowHandle(), yahooWH);

        // Delete window and trying to access it should cause an error
        boolean threw = false;
        try {
            d.close();
            d.getTitle();
        } catch (Throwable t) {
            threw = true;
        }
        assertTrue(threw);

        // Swtich to google window and notice that it's the only left (bing was closed as it was a child of yahoo)
        d.switchTo().window(googleWH);
        assertEquals(d.getWindowHandles().size(), 1);
    }

    @Test
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

        // Switch to the google window and check that the current window handle has changed
        d.switchTo().window(googleWH);
        assertEquals(d.getWindowHandle(), googleWH);

        // Delete window and trying to access it should cause an error
        boolean threw = false;
        try {
            d.close();
            d.getTitle();
        } catch (Throwable t) {
            threw = true;
        }
        assertTrue(threw);

        // No windows left - nothing is left to do but quit this driver
        assertEquals(d.getWindowHandles().size(), 0);
    }
}

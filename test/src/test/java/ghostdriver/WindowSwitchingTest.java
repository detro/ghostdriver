package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.JavascriptExecutor;
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

        // Delete yahoo window and try to access it :should cause an error
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
        assertEquals(d.getWindowHandles().size(), 2);
        assertTrue(d.getWindowHandles().contains(googleWH));
        assertTrue(d.getWindowHandles().contains(bingWH));
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

        d.switchTo().window(googleWH);
        // Delete yahoo window and try to access it :should cause an error
        boolean threw = false;
        try {
            d.close();
            d.getTitle();
        } catch (Throwable t) {
            threw = true;
        }
        assertTrue(threw);

        // Swtich to google window and notice that it's the only left (bing was closed as it was a child of yahoo)
        assertEquals(d.getWindowHandles().size(), 2);
        assertTrue(d.getWindowHandles().contains(yahooWH));
        assertTrue(d.getWindowHandles().contains(bingWH));
    }
}

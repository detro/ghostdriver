package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.*;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

public class FrameSwitchingTest extends BaseTest {

    private String getCurrentFrameName(WebDriver driver) {
        return (String)((JavascriptExecutor) driver).executeScript("return window.frameElement ? window.frameElement.name : '__MAIN_FRAME__';");
    }

    private boolean isAtTopWindow(WebDriver driver) {
        return (Boolean)((JavascriptExecutor) driver).executeScript("return window == window.top");
    }

    @Test
    public void switchToFrameByNumber() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame(0);
        assertEquals("packageFrame", getCurrentFrameName(d));
        d.switchTo().defaultContent();
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame(0);
        assertEquals("packageFrame", getCurrentFrameName(d));
    }

    @Test
    public void switchToFrameByName() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
        d.switchTo().defaultContent();
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
    }

    @Test
    public void switchToFrameByElement() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame(d.findElement(By.name("packageFrame")));
        assertEquals("packageFrame", getCurrentFrameName(d));
        d.switchTo().defaultContent();
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame(d.findElement(By.name("packageFrame")));
        assertEquals("packageFrame", getCurrentFrameName(d));
    }

    @Test(expected = NoSuchFrameException.class)
    public void failToSwitchToFrameByName() throws Exception {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame("unavailable frame");
    }

    @Test(expected = NoSuchElementException.class)
    public void testShouldBeAbleToClickInAFrame() throws InterruptedException {
        WebDriver d = getDriver();

        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));

        d.switchTo().frame("classFrame");
        assertEquals("classFrame", getCurrentFrameName(d));

        // This should cause a reload in the frame "classFrame"
        d.findElement(By.linkText("HttpClient")).click();
        // Wait for new content to load in the frame.
        // To avoid a dependency on WebDriverWait, we will hard-code a sleep for now.
        Thread.sleep(2000);

        // Frame should still be "classFrame"
        assertEquals("classFrame", getCurrentFrameName(d));

        // Check if a link "clearCookies()" is there where expected
        assertEquals("clearCookies", d.findElement(By.linkText("clearCookies")).getText());

        // Make sure it was really frame "classFrame" which was replaced:
        // 1. move to the other frame "packageFrame"
        d.switchTo().defaultContent().switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
        // 2. the link "clearCookies()" shouldn't be there anymore
        d.findElement(By.linkText("clearCookies"));
    }

    @Test(expected = NoSuchElementException.class)
    public void shouldBeAbleToClickInAFrameAfterRunningJavaScript() throws InterruptedException {
        WebDriver d = getDriver();

        // Navigate to page and ensure we are on the Main Frame
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        assertTrue(isAtTopWindow(d));
        d.switchTo().defaultContent();
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        assertTrue(isAtTopWindow(d));

        // Switch to a child frame
        d.switchTo().frame("classFrame");
        assertEquals("classFrame", getCurrentFrameName(d));
        assertFalse(isAtTopWindow(d));

        // Renavigate to the page, and check we are back on the Main Frame
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        assertTrue(isAtTopWindow(d));
        // Switch to a child frame
        d.switchTo().frame("classFrame");
        assertEquals("classFrame", getCurrentFrameName(d));
        assertFalse(isAtTopWindow(d));

        // This should cause a reload in the frame "classFrame"
        d.findElement(By.linkText("HttpClient")).click();
        // Wait for new content to load in the frame.
        // To avoid a dependency on WebDriverWait, we will hard-code a sleep for now.
        Thread.sleep(2000);

        // Frame should still be "classFrame"
        assertEquals("classFrame", getCurrentFrameName(d));

        // Check if a link "clearCookies()" is there where expected
        assertEquals("clearCookies", d.findElement(By.linkText("clearCookies")).getText());

        // Make sure it was really frame "classFrame" which was replaced:
        // 1. move to the other frame "packageFrame"
        d.switchTo().defaultContent().switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
        // 2. the link "clearCookies()" shouldn't be there anymore
        d.findElement(By.linkText("clearCookies"));
    }

    @Test
    public void titleShouldReturnWindowTitle() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
		String topLevelTitle = d.getTitle();
        d.switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
        assertEquals(topLevelTitle, d.getTitle());
        d.switchTo().defaultContent();
        assertEquals(topLevelTitle, d.getTitle());
    }
}

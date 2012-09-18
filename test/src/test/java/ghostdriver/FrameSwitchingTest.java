package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.*;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

public class FrameSwitchingTest extends BaseTest {
    @Test
    public void switchToFrameByNumber() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame(0);
        d.switchTo().defaultContent();
        d.switchTo().frame(0);
    }

    @Test
    public void switchToFrameByName() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame("packageFrame");
        d.switchTo().defaultContent();
        d.switchTo().frame("packageFrame");
    }

    @Test
    public void switchToFrameByElement() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame(d.findElement(By.name("packageFrame")));
        d.switchTo().defaultContent();
        d.switchTo().frame(d.findElement(By.name("packageFrame")));
    }

    @Test(expected = NoSuchFrameException.class)
    public void failToSwitchToFrameByName() throws Exception {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame("unavailable frame");
    }

    private String getCurrentFrameName(WebDriver driver) {
        return (String)((JavascriptExecutor) driver).executeScript("return window.frameElement ? window.frameElement.name : '__MAIN_FRAME__';");
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

    @Test
    public void shouldBeAbleToClickInAFrameAfterRunningJavaScript() throws InterruptedException {
        WebDriver d = getDriver();

        JavascriptExecutor executor = (JavascriptExecutor)d;

        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().defaultContent();
        assertTrue((Boolean)executor.executeScript("return window == window.top"));

        d.switchTo().frame("classFrame");
        assertTrue((Boolean)executor.executeScript("return window != window.top"));

		// Renavigate to the page. This simulates the consecutive test case failure.
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
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
}

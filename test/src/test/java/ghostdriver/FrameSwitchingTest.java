package ghostdriver;

import java.lang.Thread;
import java.lang.InterruptedException;
import org.junit.Test;
import static org.junit.Assert.assertEquals;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.WebDriver;

public class FrameSwitchingTest extends BaseTest {
    @Test
    public void switchToFrameByNumber() throws Exception {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame(0);
        d.switchTo().defaultContent();
        d.switchTo().frame(0);
    }

    @Test
    public void switchToFrameByName() throws Exception {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame("packageFrame");
        d.switchTo().defaultContent();
        d.switchTo().frame("packageFrame");
    }

    @Test
    public void switchToFrameByElement() throws Exception {
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

	@Test
    public void testShouldBeAbleToClickInAFrame() throws InterruptedException {
        WebDriver d = getDriver();

		d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame("classFrame");

        // This should replace frame "classFrame" ...
        d.findElement(By.linkText("HttpClient")).click();

		// To avoid a dependency on WebDriverWait, we will hard-code a
		// sleep for now.
		Thread.sleep(2000);

        // driver should still be focused on frame "classFrame" ...
		String text = d.findElement(By.linkText("clearCookies")).getText();
        assertEquals("clearCookies", text);

		// Make sure it was really frame "classFrame" which was replaced ...
        d.switchTo().defaultContent().switchTo().frame("classFrame");

		// To avoid a dependency on WebDriverWait, we will hard-code a
		// sleep for now.
		Thread.sleep(2000);

		// Reverify the text
		text = d.findElement(By.linkText("clearCookies")).getText();
        assertEquals("clearCookies", text);
    }
}

package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.WebDriver;


public class FrameSwitchingTest extends BaseTest {
    @Test
    public void switchToFrameZero() throws Exception {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame(0);
        // TODO
//        WebElement e = (WebElement)((JavascriptExecutor) mDriver).executeScript("return document.querySelector(arguments[0])", ".FrameHeadingFont");
//        assertEquals(e.getTagName(), "FONT");
    }
}

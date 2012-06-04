package ghostdriver;

import org.junit.Test;
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
    public void failtToswitchToFrameByName() throws Exception {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame("unavailable frame");
    }
}

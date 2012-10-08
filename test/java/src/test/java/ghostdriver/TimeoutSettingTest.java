package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.WebDriver;

import java.util.concurrent.TimeUnit;

public class TimeoutSettingTest extends BaseTest {
    @Test
    public void navigateAroundMDN() {
        WebDriver d = getDriver();
        d.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
        d.manage().timeouts().pageLoadTimeout(20, TimeUnit.SECONDS);
        d.manage().timeouts().setScriptTimeout(5, TimeUnit.SECONDS);
    }
}

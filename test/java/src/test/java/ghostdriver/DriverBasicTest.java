package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.WebDriver;

public class DriverBasicTest extends BaseTest {
    @Test
    public void useDriverButDontQuit() {
        WebDriver d = getDriver();
        disableAutoQuitDriver();

        d.get("http://www.google.com");
        d.quit();
    }
}

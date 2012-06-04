package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.WebDriver;

import static org.junit.Assert.assertTrue;

public class NavigationTest extends BaseTest {
    @Test
    public void navigateAroundMDN() {
        WebDriver d = getDriver();

        d.get("https://developer.mozilla.org/en-US/");
        assertTrue(d.getTitle().toLowerCase().contains("Mozilla".toLowerCase()));
        d.navigate().to("https://developer.mozilla.org/en/HTML/HTML5");
        assertTrue(d.getTitle().toLowerCase().contains("HTML5".toLowerCase()));
        d.navigate().refresh();
        assertTrue(d.getTitle().toLowerCase().contains("HTML5".toLowerCase()));
        d.navigate().back();
        assertTrue(d.getTitle().toLowerCase().contains("Mozilla".toLowerCase()));
        d.navigate().forward();
        assertTrue(d.getTitle().toLowerCase().contains("HTML5".toLowerCase()));
    }
}

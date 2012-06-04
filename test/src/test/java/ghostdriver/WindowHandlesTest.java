package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.WebDriver;

import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class WindowHandlesTest extends BaseTest {
    @Test
    public void enumerateWindowHandles() {
        WebDriver d = getDriver();

        // Didn't open any page yet: no Window Handles yet
        Set<String> whandles = d.getWindowHandles();
        assertEquals(whandles.size(), 0);

        // Open Google and count the Window Handles: there should be at least 1
        d.get("http://www.google.com");
        whandles = d.getWindowHandles();
        assertTrue(whandles.size() > 0);
    }
}

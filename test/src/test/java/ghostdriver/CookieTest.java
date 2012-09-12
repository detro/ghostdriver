package ghostdriver;

import org.junit.Test;
import java.util.Set;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.Cookie;

public class CookieTest extends BaseTest {
    @Test
    public void shouldBeAbleToAddCookie() throws InterruptedException {
        WebDriver d = getDriver();
        d.get("http://www.github.com");

        // Clear all cookies
        assertTrue(d.manage().getCookies().size() > 0);
        d.manage().deleteAllCookies();
        assertEquals(d.manage().getCookies().size(), 0);


        Cookie myCookie = new Cookie("foo", "bar");
        d.manage().addCookie(myCookie);
        assertEquals(d.manage().getCookies().size(), 1);

        Cookie myCookieIsBack = d.manage().getCookieNamed("foo");
        assertTrue(myCookieIsBack.getDomain().contains("github"));
    }
}
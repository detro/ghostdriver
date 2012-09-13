package ghostdriver;

import org.junit.Test;
import java.util.Date;
import java.util.Set;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNotNull;

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

	@Test
    public void shouldRetainCookieExpiry() {
        WebDriver d = getDriver();
        d.get("http://www.github.com");

        // Clear all cookies
        assertTrue(d.manage().getCookies().size() > 0);
        d.manage().deleteAllCookies();
        assertEquals(d.manage().getCookies().size(), 0);

        Cookie addedCookie =
            new Cookie.Builder("fish", "cod")
                .expiresOn(new Date(System.currentTimeMillis() + 100000))
                .build();
        d.manage().addCookie(addedCookie);

        Cookie retrieved = d.manage().getCookieNamed("fish");
        assertNotNull(retrieved);
        assertEquals(addedCookie.getExpiry(), retrieved.getExpiry());
    }
}
package ghostdriver;

import org.junit.Test;
import java.util.Set;
import static org.junit.Assert.assertEquals;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.Cookie;

public class CookieTest extends BaseTest {
    @Test
    public void shouldBeAbleToAddCookie() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");

        d.manage().deleteAllCookies();
        Cookie myCookie = new Cookie("foo", "bar");
        d.manage().addCookie(myCookie);

        Set<Cookie> allCookies = d.manage().getCookies();
        assertEquals(1, allCookies.size());
    }
}
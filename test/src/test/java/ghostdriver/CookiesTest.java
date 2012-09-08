package ghostdriver;

import static junit.framework.Assert.assertEquals;
import ghostdriver.server.EmptyPageHttpRequestCallback;
import ghostdriver.server.HttpRequestCallback;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CookiesTest extends BaseTestWithServer {
    private WebDriver driver;

    private final static HttpRequestCallback COOKIE_SETTING_CALLBACK = new EmptyPageHttpRequestCallback() {
        @Override
        public void call(HttpServletRequest req, HttpServletResponse res) throws IOException {
            super.call(req, res);
            res.addCookie(new javax.servlet.http.Cookie("test", "test"));
            res.addCookie(new javax.servlet.http.Cookie("test2", "test2"));
        }
    };

    private final static HttpRequestCallback EMPTY_CALLBACK = new EmptyPageHttpRequestCallback();

    @Before
    public void setup() {
        driver = getDriver();
    }

    private void goToPage() {
        driver.get(server.getBaseUrl());
    }

    private Cookie[] getCookies() {
        return driver.manage().getCookies().toArray(new Cookie[]{});
    }

    @Test
    public void gettingAllCookies() {
        server.setGetHandler(COOKIE_SETTING_CALLBACK);
        goToPage();
        Cookie[] cookies = getCookies();

        assertEquals(2, cookies.length);
        assertEquals("test", cookies[0].getName());
        assertEquals("test", cookies[0].getValue());
        assertEquals("localhost", cookies[0].getDomain());
        assertEquals("/", cookies[0].getPath());
        assertEquals(false, cookies[0].isSecure());
        assertEquals("test2", cookies[1].getName());
        assertEquals("test2", cookies[1].getValue());
        assertEquals("localhost", cookies[1].getDomain());
        assertEquals("/", cookies[1].getPath());
        assertEquals(false, cookies[1].isSecure());
    }

    @Test
    public void deletingAllCookies() {
        server.setGetHandler(COOKIE_SETTING_CALLBACK);
        goToPage();
        driver.manage().deleteAllCookies();

        assertEquals(0, getCookies().length);

        server.setGetHandler(EMPTY_CALLBACK);
        goToPage();
        assertEquals(0, getCookies().length);
    }

    @Test
    public void deletingOneCookie() {
        server.setGetHandler(COOKIE_SETTING_CALLBACK);
        goToPage();

        driver.manage().deleteCookieNamed("test");

        Cookie[] cookies = getCookies();

        assertEquals(1, cookies.length);
        assertEquals("test2", cookies[0].getName());

        server.setGetHandler(EMPTY_CALLBACK);
        goToPage();
        assertEquals(1, getCookies().length);
    }

    @Test
    public void addingACookie() {
        server.setGetHandler(EMPTY_CALLBACK);
        goToPage();

        driver.manage().addCookie(new Cookie("newCookie", "newValue"));

        Cookie[] cookies = getCookies();
        assertEquals(1, cookies.length);
        assertEquals("newCookie", cookies[0].getName());
        assertEquals("newValue", cookies[0].getValue());
        assertEquals("localhost", cookies[0].getDomain());
        assertEquals("/", cookies[0].getPath());
        assertEquals(false, cookies[0].isSecure());
    }

    @Test
    public void modifyingACookie() {
        server.setGetHandler(COOKIE_SETTING_CALLBACK);
        goToPage();

        driver.manage().addCookie(new Cookie("test", "newValue", "localhost", "/", null, true));

        Cookie[] cookies = getCookies();
        assertEquals(2, cookies.length);
        assertEquals("test", cookies[0].getName());
        assertEquals("newValue", cookies[0].getValue());
        assertEquals("localhost", cookies[0].getDomain());
        assertEquals("/", cookies[0].getPath());
        assertEquals(true, cookies[0].isSecure());

        assertEquals("test2", cookies[1].getName());
        assertEquals("test2", cookies[1].getValue());
        assertEquals("localhost", cookies[1].getDomain());
        assertEquals("/", cookies[1].getPath());
        assertEquals(false, cookies[1].isSecure());
    }
}

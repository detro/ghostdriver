package ghostdriver;

import ghostdriver.server.EmptyPageHttpRequestCallback;
import ghostdriver.server.HttpRequestCallback;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.util.Date;
import java.util.Set;

import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.Cookie;

import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertTrue;
import static org.junit.Assert.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CookieTest extends BaseTestWithServer {
    private WebDriver driver;

    private final static HttpRequestCallback COOKIE_SETTING_CALLBACK = new EmptyPageHttpRequestCallback() {
        @Override
        public void call(HttpServletRequest req, HttpServletResponse res) throws IOException {
            super.call(req, res);
            javax.servlet.http.Cookie cookie = new javax.servlet.http.Cookie("test", "test");
            cookie.setMaxAge(360);

            res.addCookie(cookie);
            res.addCookie(new javax.servlet.http.Cookie("test2", "test2"));
        }
    };

    private final static HttpRequestCallback EMPTY_CALLBACK = new EmptyPageHttpRequestCallback();

    @Before
    public void setup() {
        driver = getDriver();
    }

    @After
    public void cleanUp() {
        driver.manage().deleteAllCookies();
    }

    private void goToPage(String path) {
        driver.get(server.getBaseUrl() + path);
    }

    private void goToPage() {
        goToPage("");
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
        assertTrue(cookies[0].getExpiry() != null);
        assertEquals(false, cookies[0].isSecure());
        assertEquals("test2", cookies[1].getName());
        assertEquals("test2", cookies[1].getValue());
        assertEquals("localhost", cookies[1].getDomain());
        assertEquals("/", cookies[1].getPath());
        assertEquals(false, cookies[1].isSecure());
        assertTrue(cookies[1].getExpiry() == null);
    }

    @Test
    public void gettingAllCookiesOnANonCookieSettingPage() {
        server.setGetHandler(EMPTY_CALLBACK);
        goToPage();
        assertEquals(0, getCookies().length);
    }

    @Test
    public void deletingAllCookies() {
        server.setGetHandler(COOKIE_SETTING_CALLBACK);
        goToPage();
        driver.manage().deleteAllCookies();

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

        driver.manage().addCookie(new Cookie("test", "newValue", "localhost", "/", null, false));

        Cookie[] cookies = getCookies();
        assertEquals(2, cookies.length);
        assertEquals("test", cookies[0].getName());
        assertEquals("newValue", cookies[0].getValue());
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
    public void shouldRetainCookieInfo() {
        server.setGetHandler(EMPTY_CALLBACK);
        goToPage();

        // Added cookie (in a sub-path - allowed)
        Cookie addedCookie =
            new Cookie.Builder("fish", "cod")
                .expiresOn(new Date(System.currentTimeMillis() + 100 * 1000)) //< now + 100sec
                .path("/404")
                .domain("localhost")
                .build();
        driver.manage().addCookie(addedCookie);

        // Search cookie on the root-path and fail to find it
        Cookie retrieved = driver.manage().getCookieNamed("fish");
        assertNull(retrieved);

        // Go to the "/404" sub-path (to find the cookie)
        goToPage("404");
        retrieved = driver.manage().getCookieNamed("fish");
        assertNotNull(retrieved);
        // Check that it all matches
        assertEquals(addedCookie.getName(), retrieved.getName());
        assertEquals(addedCookie.getValue(), retrieved.getValue());
        assertEquals(addedCookie.getExpiry(), retrieved.getExpiry());
        assertEquals(addedCookie.isSecure(), retrieved.isSecure());
        assertEquals(addedCookie.getPath(), retrieved.getPath());
        assertTrue(retrieved.getDomain().contains(addedCookie.getDomain()));
    }

    @Test(expected = InvalidCookieDomainException.class)
    public void shouldNotAllowToCreateCookieOnDifferentDomain() {
        goToPage();

        // Added cookie (in a sub-path)
        Cookie addedCookie =
                new Cookie.Builder("fish", "cod")
                        .expiresOn(new Date(System.currentTimeMillis() + 100 * 1000)) //< now + 100sec
                        .path("/404")
                        .domain("github.com")
                        .build();
        driver.manage().addCookie(addedCookie);
    }
}
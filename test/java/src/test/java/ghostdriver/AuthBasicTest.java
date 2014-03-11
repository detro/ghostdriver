package ghostdriver;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriverService;

public class AuthBasicTest extends BaseTest {

    // credentials for testing, no one would ever use these
    private final static String userName = "admin";
    private final static String password = "admin";

    @Override
    public void prepareDriver() throws Exception {
        sCaps.setCapability(PhantomJSDriverService.PHANTOMJS_PAGE_SETTINGS_PREFIX + "userName", userName);
        sCaps.setCapability(PhantomJSDriverService.PHANTOMJS_PAGE_SETTINGS_PREFIX + "password", password);

        super.prepareDriver();
    }

    @Test
    public void simpleBasicAuthShouldWork() {
        // Get Driver Instance
        WebDriver driver = getDriver();

        // wrong password
        driver.get(String.format("http://httpbin.org/basic-auth/%s/Wrong%s", userName, password));
        assertTrue(!driver.getPageSource().contains("authenticated"));

        // we should be authorized
        driver.get(String.format("http://httpbin.org/basic-auth/%s/%s", userName, password));
        assertTrue(driver.getPageSource().contains("authenticated"));
    }

}

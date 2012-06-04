package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class ScriptExecutionTest extends BaseTest {
    @Test
    public void findGoogleInputFieldInjectingJavascript() {
        WebDriver d = getDriver();
        d.get("http://www.google.com");
        WebElement e = (WebElement)((JavascriptExecutor) d).executeScript(
                "return document.querySelector(\"[name='\"+arguments[0]+\"']\");",
                "q");
        assertNotNull(e);
        assertEquals("input", e.getTagName().toLowerCase());
    }

    @Test
    public void setTimeoutAsynchronously() {
        WebDriver d = getDriver();
        d.get("http://www.google.com");
        String res = (String)((JavascriptExecutor) d).executeAsyncScript(
                "window.setTimeout(arguments[arguments.length - 1], arguments[0], 'done');",
                1000);
        assertEquals("done", res);
    }
}

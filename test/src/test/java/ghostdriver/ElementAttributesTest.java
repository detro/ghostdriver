package ghostdriver;

import static org.junit.Assert.*;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.Assert.assertTrue;

public class ElementAttributesTest extends BaseTest {
    @Test
    public void checkAttributesOnGoogleSearchBox() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        WebElement el = d.findElement(By.cssSelector("input[name*='q']"));

        assertTrue(el.getAttribute("name").toLowerCase().contains("q"));
        assertTrue(el.getAttribute("type").toLowerCase().contains("text"));
        assertTrue(el.getAttribute("style").length() > 0);
        assertTrue(el.getAttribute("type").length() > 0);
    }
}

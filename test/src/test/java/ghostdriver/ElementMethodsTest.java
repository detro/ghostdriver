package ghostdriver;

import static org.junit.Assert.*;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.Assert.assertTrue;

public class ElementMethodsTest extends BaseTest {
    @Test
    public void checkDisplayedOnGoogleSearchBox() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        WebElement el = d.findElement(By.cssSelector("input[name*='q']"));

        assertTrue(el.isDisplayed());

        el = d.findElement(By.cssSelector("input[type='hidden']"));

        assertFalse(el.isDisplayed());
    }

    @Test
    public void checkEnabledOnGoogleSearchBox() {
        // TODO: Find a sample site that has hidden elements and use it to
        // verify behavior of enabled and disabled elements.
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        WebElement el = d.findElement(By.cssSelector("input[name*='q']"));

        assertTrue(el.isEnabled());
    }
}

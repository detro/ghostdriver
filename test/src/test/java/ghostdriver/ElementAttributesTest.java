package ghostdriver;

import static org.junit.Assert.*;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.Assert.assertTrue;

public class ElementAttributesTest extends BaseTest {
    @Test
    public void navigateAroundMDN() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        WebElement el = d.findElement(By.cssSelector("img[id*='logo']"));

        assertTrue(el.getAttribute("alt").toLowerCase().contains("google"));
        assertTrue(el.getAttribute("id").toLowerCase().contains("logo"));
        Integer.parseInt(el.getAttribute("width"));
        Integer.parseInt(el.getAttribute("height"));
        assertTrue(el.getAttribute("src").toLowerCase().contains("google"));
        assertTrue(el.getAttribute("src").toLowerCase().contains("logo"));
        assertTrue(el.getAttribute("style").length() > 0);
    }
}

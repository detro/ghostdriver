package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.internal.Locatable;

import java.util.concurrent.TimeUnit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class ElementQueryingTest extends BaseTest {
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

    @Test
    public void checkLocationAndSizeOfBingSearchBox() {
        WebDriver d = getDriver();
        d.manage().timeouts().pageLoadTimeout(20, TimeUnit.SECONDS);

        d.get("http://www.bing.com");
        WebElement searchBox = d.findElement(By.cssSelector("input[name*='q']"));

        assertTrue(searchBox.getCssValue("color").contains("rgb(0, 0, 0)") || searchBox.getCssValue("color").contains("rgba(0, 0, 0, 1)"));
        assertEquals("", searchBox.getAttribute("value"));
        assertEquals("input", searchBox.getTagName());
        assertEquals(true, searchBox.isEnabled());
        assertEquals(true, searchBox.isDisplayed());
        assertTrue(searchBox.getLocation().getX() >= 200);
        assertTrue(searchBox.getLocation().getY() >= 100);
        assertTrue(searchBox.getSize().getWidth() >= 350);
        assertTrue(searchBox.getSize().getHeight() >= 20);
    }

    @Test
    public void scrollElementIntoView() {
        WebDriver d = getDriver();

        d.get("https://developer.mozilla.org/en/CSS/Attribute_selectors");
        WebElement aboutGoogleLink = d.findElement(By.partialLinkText("About MDN"));
        Point locationBeforeScroll = aboutGoogleLink.getLocation();
        Point locationAfterScroll = ((Locatable) aboutGoogleLink).getLocationOnScreenOnceScrolledIntoView();

        assertTrue(locationBeforeScroll.x >= locationAfterScroll.x);
        assertTrue(locationBeforeScroll.y >= locationAfterScroll.y);
    }
}

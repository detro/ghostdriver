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
    public void checkLocationAndSizeOfGoogleSearchBox() {
        WebDriver d = getDriver();
        d.manage().timeouts().pageLoadTimeout(20, TimeUnit.SECONDS);

        d.get("http://www.bing.com");
        WebElement radio = d.findElement(By.cssSelector("input#nofilt[type='radio']"));
        WebElement radioLabel = d.findElement(By.cssSelector("label[for='nofilt']"));

        assertEquals(radio.getCssValue("color"), "rgb(0, 0, 0)");
        assertEquals(radioLabel.getText(), "Show all");
        assertEquals(radio.getAttribute("value"), "all");
        assertEquals(radio.getTagName(), "input");
        assertEquals(radio.isEnabled(), true);
        assertEquals(radio.isDisplayed(), true);
        assertEquals(radio.isSelected(), true);
        assertEquals(radio.getLocation(), new Point(215, 138));
        assertEquals(radio.getSize(), new Dimension(15, 15));
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

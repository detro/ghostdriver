package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.Actions;

public class MouseCommandsTest extends BaseTest {
    @Test
    public void move() {
        WebDriver d = getDriver();
        Actions actionBuilder = new Actions(d);

        d.get("http://www.duckduckgo.com");

        // Move mouse by x,y
        actionBuilder.moveByOffset(100, 100).build().perform();
        // Move mouse on a given element
        actionBuilder.moveToElement(d.findElement(By.id("logo_homepage"))).build().perform();
        // Move mouse on a given element, by x,y relative coordinates
        actionBuilder.moveToElement(d.findElement(By.id("logo_homepage")), 50, 50).build().perform();
    }

    @Test
    public void clickAndRightClick() {
        WebDriver d = getDriver();
        Actions actionBuilder = new Actions(d);

        d.get("http://www.duckduckgo.com");

        // Left click
        actionBuilder.click().build().perform();
        // Right click
        actionBuilder.contextClick(null).build().perform();
        // Right click on the logo (it will cause a "/moveto" before clicking
        actionBuilder.contextClick(d.findElement(By.id("logo_homepage"))).build().perform();
    }

    @Test
    public void doubleClick() {
        WebDriver d = getDriver();
        Actions actionBuilder = new Actions(d);

        d.get("http://www.duckduckgo.com");

        // Double click
        actionBuilder.doubleClick().build().perform();
        // Double click on the logo
        actionBuilder.doubleClick(d.findElement(By.id("logo_homepage"))).build().perform();
    }

    @Test
    public void clickAndHold() {
        WebDriver d = getDriver();
        Actions actionBuilder = new Actions(d);

        d.get("http://www.duckduckgo.com");

        // Hold, then release
        actionBuilder.clickAndHold().build().perform();
        actionBuilder.release();
        // Hold on the logo, then release
        actionBuilder.clickAndHold(d.findElement(By.id("logo_homepage"))).build().perform();
        actionBuilder.release();
    }
}

package ghostdriver;

import static org.junit.Assert.*;

import java.util.List;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.Assert.assertTrue;

public class ElementFindingTest extends BaseTest {
    @Test
    public void findChildElement() {
        WebDriver d = getDriver();

        d.get("http://www.yahoo.com");
        WebElement parent = d.findElement(By.id("y-masthead"));

        WebElement child = parent.findElement(By.name("p"));
    }

    @Test
    public void findChildElements() {
        WebDriver d = getDriver();

        d.get("http://www.yahoo.com");
        WebElement parent = d.findElement(By.id("y-masthead"));

        List<WebElement> children = parent.findElements(By.tagName("input"));

        assertEquals(5, children.size());
    }

    @Test
    public void findMultipleElements() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        List<WebElement> els = d.findElements(By.tagName("input"));

        assertEquals(8, els.size());
    }

    @Test
    public void findNoElementsMeetingCriteria() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        List<WebElement> els = d.findElements(By.name("noElementWithThisName"));

        assertEquals(0, els.size());
    }

    @Test
    public void findNoChildElementsMeetingCriteria() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        WebElement parent = d.findElement(By.name("q"));

        List<WebElement> children = parent.findElements(By.tagName("input"));

        assertEquals(0, children.size());
    }
}

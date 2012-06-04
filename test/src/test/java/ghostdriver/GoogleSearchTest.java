package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.Assert.assertTrue;

public class GoogleSearchTest extends BaseTest {
    @Test
    public void searchForCheese() {
        String strToSearchFor = "Cheese!";
        WebDriver d = getDriver();

        // Load Google.com
        d.get("http://www.google.com");
        // Locate the Search field on the Google page
        WebElement element = d.findElement(By.name("q"));
        // Type Cheese
        element.sendKeys(strToSearchFor);
        // Submit form
        element.submit();

        // Check results contains the term we searched for
        assertTrue(d.getTitle().toLowerCase().contains(strToSearchFor.toLowerCase()));
    }
}

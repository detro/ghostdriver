package ghostdriver;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;


public class GoogleCheese extends WebDriverTester {
	public static void main(String[] args) {
		new GoogleCheese(args);
	}
	
	private GoogleCheese(String[] args) {
		super(args);
	}
	
    protected void runTestOn(WebDriver driver) {
        // And now use this to visit Google
        System.out.println("Loading 'http://www.google.com'...");
        driver.get("http://www.google.com");
        System.out.println("Loaded. Current URL is: '" + driver.getCurrentUrl() + "'");
        
        // Find the text input element by its name
        System.out.println("Finding an Element via [name='q']...");
        WebElement element = driver.findElement(By.name("q"));
        System.out.println("Found.");
        
        // Enter something to search for
        System.out.println("Sending keys 'Cheese!...'");
        element.sendKeys("Cheese!");
        System.out.println("Sent.");
        
        // Now submit the form. WebDriver will find the form for us from the element
        System.out.println("Submitting Element...");
        element.submit();
        System.out.println("Submitted.");
        
        // Check the title of the page
        System.out.println("Page title is: " + driver.getTitle());
        driver.close();
    }
}

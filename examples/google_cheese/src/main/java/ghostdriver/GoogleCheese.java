package ghostdriver;

import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;


public class GoogleCheese {
    public static void main( String[] args ) throws MalformedURLException {
        // Create a new instance of the html unit driver
        // Notice that the remainder of the code relies on the interface,
        // not the implementation.

        // Ask for a JavaScript-enabled browser
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setJavascriptEnabled(true);

        // Get a handle to the driver. This will throw an exception if a matching driver cannot be located
        WebDriver driver = new RemoteWebDriver(new URL("http://localhost:8080"), capabilities);

        // Query the driver to find out more information
        Capabilities actualCapabilities = ((RemoteWebDriver) driver).getCapabilities();

        // And now use this to visit Google
        driver.get("http://www.google.com");

        // Find the text input element by its name
        WebElement element = driver.findElement(By.name("q"));

        // Enter something to search for
        element.sendKeys("Cheese!");

        // Now submit the form. WebDriver will find the form for us from the element
        element.submit();

        // Check the title of the page
        System.out.println("Page title is: " + driver.getTitle());
    }
}

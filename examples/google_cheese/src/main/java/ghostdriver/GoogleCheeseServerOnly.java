package ghostdriver;

import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;


public class GoogleCheeseServerOnly {
    public static void main( String[] args ) throws MalformedURLException, IOException, InterruptedException, NumberFormatException {
        int samplingSize = 1;
        int port = 8080;

        if (args.length > 0) {
            samplingSize = Integer.parseInt(args[0]);
        }

        if (args.length > 1) {
            port = Integer.parseInt(args[1]);
        }

        System.out.println("Sampling Size: "+samplingSize);
        System.out.println("Remote WebDriver Server port: "+port);

        // Let's make some stats
        long stats = 0;

        // Sum up samples
        for (int i = 0; i < samplingSize; ++i) {
            stats += runTest(port);
        }

        // Normalize
        stats /= samplingSize;

        System.out.println("");
        System.out.println("--------------------------------------");
        System.out.println("*** STATS");
        System.out.println("*** Total Execution Time over "+samplingSize+" samples: "+stats);
        System.out.println("--------------------------------------");
        System.out.println("");

        System.exit(0);
    }

    public static long runTest(int port) throws MalformedURLException, IOException, InterruptedException {
        long totalTime;

        // Start the clock
        Date start = new Date();

        // Ask for a JavaScript-enabled browser
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setJavascriptEnabled(true);

        WebDriver driver = new RemoteWebDriver(new URL("http://localhost:"+port), capabilities);
        Capabilities actualCapabilities = ((RemoteWebDriver) driver).getCapabilities();

        // And now use this to visit Google
        System.out.println("Loading 'http://www.google.com'...");
        driver.get("http://www.google.com");
        System.out.println("Loaded. Current URL is: '" + driver.getCurrentUrl() + "'");

        // Play around with the navigation...
        driver.navigate().refresh();
        driver.navigate().forward();
        driver.navigate().back();
        driver.navigate().to("http://www.google.com");

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

        // Executing a Script, synchronously
        System.out.println("Grabbing 'div#ires' container of the search results...");
        WebElement e = (WebElement)((RemoteWebDriver) driver).executeScript("return document.getElementById(arguments[0])", "ires");
//        e.isEnabled();
//        e.isSelected();
//        e.isDisplayed();
//        System.out.println("Tag name is: " + e.getTagName());
//        System.out.println("Tag text is: " + e.getText());

        // Navigate 'Back'
        System.out.println("Going back...");
        driver.navigate().back();
        System.out.println("After going back, page title is: " + driver.getTitle());

        // Closing
        System.out.println("Closing...");
        driver.close();
        System.out.println("Closed");

        totalTime = new Date().getTime() - start.getTime();
        System.out.println("Time elapsed (ms): " + totalTime);

        return totalTime;
    }
}

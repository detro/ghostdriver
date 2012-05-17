package ghostdriver;

import org.openqa.selenium.*;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.Set;
import java.util.concurrent.TimeUnit;


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

        System.out.println("Changing Timeouts values ('implicit', 'page load' and 'script')...");
        driver.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS);
        driver.manage().timeouts().pageLoadTimeout(10, TimeUnit.SECONDS);
        driver.manage().timeouts().setScriptTimeout(2, TimeUnit.SECONDS);
        System.out.println("Done changing Timeouts.");

        System.out.println("Current Window Handle: " + driver.getWindowHandle());
        Set<String> whandles = driver.getWindowHandles();
        System.out.println("Number of Window Handles: " + whandles.size() + " - list: " + whandles.toString());

        // Play around with the navigation...
        driver.navigate().refresh();
        System.out.println("Refreshed.");
        driver.navigate().forward();
        System.out.println("Clicked on Forward.");
        driver.navigate().back();
        System.out.println("Clicked on Backward.");
        driver.navigate().to("http://www.google.com");
        System.out.println("Went to: '" + driver.getCurrentUrl() + "'");

        System.out.println("Calling a meaningless 'setTimeout' using 'executeAsyncScript'...");
        ((JavascriptExecutor) driver).executeAsyncScript("window.setTimeout(arguments[arguments.length - 1], 1000); ");
        System.out.println("Timed-out.");

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
        System.out.println("Grabbing 'div#ires' container of the search results, using 'executeScript'...");
        WebElement e = (WebElement)((JavascriptExecutor) driver).executeScript("return document.getElementById(arguments[0])", "ires");
        System.out.println("Grabbed.");
//        e.isEnabled();
//        e.isSelected();
//        e.isDisplayed();
//        System.out.println("Tag name is: " + e.getTagName());
//        System.out.println("Tag text is: " + e.getText());

        // Navigate 'Back'
        System.out.println("Going back...");
        driver.navigate().back();
        System.out.println("Back.");
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

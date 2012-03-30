package ghostdriver;

import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.UnreachableBrowserException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;


public class GoogleCheese {
    private static final int USE_GHOSTDRIVER = 0;
    private static final int USE_FIREFOX_DRIVER = 1;
    private static final int USE_CHROME_DRIVER = 2;
    private static final int USE_ALL_AND_MAKE_STATS = 3;

    private static final int STATS_SAMPLING_SIZE = 100;

    private static final String PHANTOMJS_PATH = "/Users/idemarin/Workspaces/qt/phantomjs/bin/phantomjs";   //< CHANGEME
    private static final String GHOSTDRIVER_PATH = "/Users/idemarin/Workspaces/qt/ghostdriver/main.js";     //< CHANGEME
    private static final String CHROMEDRIVER_PATH = "/Users/idemarin/bin/chromedriver";                     //< CHANGEME

    public static void main( String[] args ) throws MalformedURLException, IOException, InterruptedException {
        int use = USE_GHOSTDRIVER;

        if (args.length == 1) {
            if (args[0].toLowerCase().equals("firefox")) {
                use = USE_FIREFOX_DRIVER;
            } else if (args[0].toLowerCase().equals("chrome")) {
                use = USE_CHROME_DRIVER;
            } else if (args[0].toLowerCase().equals("stats")) {
                use = USE_ALL_AND_MAKE_STATS;
            }
        }

        if (use == USE_ALL_AND_MAKE_STATS) {
            // Let's make some stats
            long stats[][] = new long[][]{{0, 0, 0}, {0, 0, 0}, {0, 0, 0}};

            for (int driverType : new int[]{0, 1, 2}) {
                long sample[] = null;

                // Sum up samples
                for (int i = 0; i < STATS_SAMPLING_SIZE; ++i) {
                    sample = runTest(driverType);
                    stats[driverType][0] += sample[0];
                    stats[driverType][1] += sample[1];
                    stats[driverType][2] += sample[2];
                }

                // Normalize
                stats[driverType][0] /= STATS_SAMPLING_SIZE;
                stats[driverType][1] /= STATS_SAMPLING_SIZE;
                stats[driverType][2] /= STATS_SAMPLING_SIZE;
            }

            for (int driverType : new int[]{0, 1, 2}) {
                System.out.println("");
                System.out.println("--------------------------------------");
                System.out.println("*** STATS for Driver Type: "+driverName(driverType));
                System.out.println("*** Average Driver Start Time over "+STATS_SAMPLING_SIZE+" samples: "+stats[driverType][0]);
                System.out.println("*** Average Test Execution Time over "+STATS_SAMPLING_SIZE+" samples: "+stats[driverType][1]);
                System.out.println("*** Total Execution Time over "+STATS_SAMPLING_SIZE+" samples: "+stats[driverType][2]);
                System.out.println("--------------------------------------");
                System.out.println("");
            }
        } else {
            // Just test 1 browser (boring)
            GoogleCheese.runTest(use);
        }

        System.exit(0);
    }

    public static String driverName(int driverType) {
        if (driverType == USE_GHOSTDRIVER) return "GhostDriver + PhantomJS";
        if (driverType == USE_FIREFOX_DRIVER) return "FirefoxDriver + Firefox";
        if (driverType == USE_CHROME_DRIVER) return "ChromeDriver + Chrome";
        return "UNKNOWN";
    }

    public static long[] runTest(int driverType) throws MalformedURLException, IOException, InterruptedException {
        long timeToStartDriver = 0;
        long timeToTest = 0;
        long totalTime = 0;

        // Start the clock
        Date start = new Date();

        // Ask for a JavaScript-enabled browser
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setJavascriptEnabled(true);

        WebDriver driver = null;
        Capabilities actualCapabilities = null;
        Process phantomjsProcess = null;

        switch (driverType) {
            case USE_FIREFOX_DRIVER: {
                System.out.println("*** USING FIREFOX DRIVER ***");

                driver = new FirefoxDriver(capabilities);

                actualCapabilities = ((FirefoxDriver) driver).getCapabilities();
                break;
            }
            case USE_CHROME_DRIVER: {
                System.out.println("*** USING CHROME DRIVER ***");
                System.out.println("NOTICE: This is currently manually set to a Mac path, and to a specific home directory. CHANGE IT!");

                // Setting property to change where the "chromedriver" executable is expected to be
                System.setProperty("webdriver.chrome.driver", CHROMEDRIVER_PATH); // CHANGEME
                driver = new ChromeDriver();

                actualCapabilities = ((ChromeDriver) driver).getCapabilities();
                break;
            }
            case USE_GHOSTDRIVER: default: {
                System.out.println("*** USING GHOSTDRIVER ***");

                phantomjsProcess = Runtime.getRuntime().exec(PHANTOMJS_PATH + ' ' + GHOSTDRIVER_PATH);

                BufferedReader phantomOutputReader = new BufferedReader (new InputStreamReader(phantomjsProcess.getInputStream()));
                while (phantomOutputReader.readLine () == null) { } //< As soon as Ghostdriver outputs something, we can continue
                phantomOutputReader.close();

                try {
                    driver = new RemoteWebDriver(new URL("http://localhost:8080"), capabilities);
                    actualCapabilities = ((RemoteWebDriver) driver).getCapabilities();
                } catch (UnreachableBrowserException e) {
                    // Ensure we don't leave zombies around...
                    phantomjsProcess.destroy();
                }
                break;
            }
        }
        timeToStartDriver = new Date().getTime() - start.getTime();
        System.out.println("Driver started in (ms): " + timeToStartDriver);

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
        if (phantomjsProcess != null) {
            phantomjsProcess.destroy();
        }

        totalTime = new Date().getTime() - start.getTime();
        timeToTest = totalTime - timeToStartDriver;
        System.out.println("Test done in (ms): " + timeToTest);
        System.out.println("Time elapsed (ms): " + totalTime);

        return new long[]{timeToStartDriver, timeToTest, totalTime};
    }
}

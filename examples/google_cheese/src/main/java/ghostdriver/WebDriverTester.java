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
import java.io.FileReader;
import java.util.Properties;
import java.util.Map;
import java.util.HashMap;


public abstract class WebDriverTester {
    
    /** Number of iterations when computing statistics.
     */
    public static final int STATS_SAMPLING_SIZE = 10;
    
    /** Set of files from which to fetch the properties.
     */
    //@{
    /** File storing all supported drivers and their user-readable description as properties.
     * The contents of that file should be edited to reflect the user's setup.
     *
     *@see java.util.Properties
     */
    public static final String DRIVERS_LIST_FILE = "config/drivers.properties";
    
    /** File storing paths to all necessary executables as properties.
     * The contents of that file should be edited to reflect the user's setup.
     *
     *@see java.util.Properties
     */
    public static final String DRIVERS_PATHS_FILE = "config/paths.properties";
    
    /** Value appended to some properties list to get their default values.
     */
    public static final String DEFAULTS_EXTENSION = ".defaults";
    //@}
    
    /** Port used by GhostDriver.
     */
    public static int port = 8080;
    
    
    /** The desired capabilities for all drivers.
     */
    protected DesiredCapabilities desiredCapabilities;
    
    /** List of all drivers mapped to their user-readable description
     */
    protected static Properties availableDrivers;
    
    /** Paths to all necessary executables.
     */
    protected static Properties paths;

    
    /** Some drivers might need to start another process.
    */
    private Process serverProcess;

    
    private void init() {
        try {
            availableDrivers =  new Properties();
            availableDrivers.load(new FileReader(DRIVERS_LIST_FILE));
        } catch (Exception e) {
            throw new RuntimeException("Error while trying to load drivers list file (" + DRIVERS_LIST_FILE + ")", e);
        }
        
        try {
            paths = new Properties();
            paths.load(new FileReader(DRIVERS_PATHS_FILE + DEFAULTS_EXTENSION));
            try {
                paths.load(new FileReader(DRIVERS_PATHS_FILE));
            } catch (java.io.FileNotFoundException e) {
                System.err.println("\nAre you sure you don't need to override the default executables paths?\n"
                                   + "If tests fail, first make sure the '" + DRIVERS_PATHS_FILE + "' properties point at the proper executables on your system!\n");
                // no specific error recovery procedure
            }
        } catch (Exception e) {
            throw new RuntimeException("Error while trying to load executable paths file (" + DRIVERS_PATHS_FILE + ")", e);
        }
        
        desiredCapabilities = new DesiredCapabilities();
        desiredCapabilities.setJavascriptEnabled(true);
    }
    
    /**
     * Usage: [driverName [port]]
     * Where `diverName` is one of the drivers listed in the `DRIVERS_LIST_FILE` properties file.
     * If `driverName` refers to GhostDriver, then the optional `port` argument may be used to override the default.
     */
    protected WebDriverTester(String[] args) {
        init();
        
        if (args.length == 0) {
            System.out.println("Testing all drivers and computing stats on them\n"
                               + "-----------------------------------------------\n"
                               + "If you simply want to test one driver, provide its name as argument.\n"
                               + "You can see and edit possible drivers in the .properties files along this example file.");

            long[][] stats = runStats();
            
            printStats(stats);
        } else {
            timeTestWithDriver(args[0].toLowerCase());
            
            if (args.length > 1)
                port = Integer.parseInt(args[1]);
        }

        System.exit(0);
    }
    
    private long[][] runStats() {
        long stats[][] = new long[][]{{0, 0, 0}, {0, 0, 0}, {0, 0, 0}};
        byte driverCount = 0;

        for (String currentDriver : availableDrivers.stringPropertyNames()) {
            long sample[];
            
            try {
                // Sum up samples
                for (int i = 0; i < STATS_SAMPLING_SIZE; ++i) {
                    sample = timeTestWithDriver(currentDriver);
                    stats[driverCount][0] += sample[0];
                    stats[driverCount][1] += sample[1];
                    stats[driverCount][2] += sample[2];
                }
                
                // Normalize
                stats[driverCount][0] /= STATS_SAMPLING_SIZE;
                stats[driverCount][1] /= STATS_SAMPLING_SIZE;
                stats[driverCount][2] /= STATS_SAMPLING_SIZE;
            } catch (Exception e) {
                System.err.println("Woops, an error occured while testing driver '" + currentDriver + "'!");
                e.printStackTrace();
            }
            
            // Go to next driver
            driverCount++;
        }
        
        return stats;
    }
    
    /**
     *@see  #runStats()
     */
    private void printStats(long[][] data) {
        byte driverCount = 0;
        
        for (String currentDriver : availableDrivers.stringPropertyNames()) {
            System.out.println("");
            System.out.println("--------------------------------------");
            System.out.println("*** STATS for driver '" + currentDriver + "', averaged over " + STATS_SAMPLING_SIZE + " runs:");
            System.out.println("*** Driver start:\t" + (data[driverCount][0] / 10E5) + " ms"); // divide to obtain ms from ns
            System.out.println("*** Test execution:\t" + (data[driverCount][1] / 10E5) + " ms"); // divide to obtain ms from ns
            System.out.println("*** Total execution:\t" + (data[driverCount][2] / 10E5) + " ms"); // divide to obtain ms from ns
            System.out.println("--------------------------------------");
            System.out.println("");
            
            driverCount++;
        }
    }

    /**
     *@return   Array of nanoseconds durations: {timeToStartDriver, timeToTest, totalTime}, or `null` if the driver is not known.
     */
    protected long[] timeTestWithDriver(String driverName) {
        String driverDescription = availableDrivers.getProperty(driverName);
                
        System.out.println("\n\n**********************\n"
                           + "Using " + driverDescription + "\n"
                           + "**********************");
        
        WebDriver driver;
        
        long timeToStartDriver,
             timeToTest,
             totalTime;
        
        // Start the clock
        long startTime = System.nanoTime();
        

        if (driverName.equals("firefox")) {
            driver = setupFirefoxDriver();
        } else if (driverName.equals("chrome")) {
            driver = setupChromeDriver();
        } else if (driverName.equals("ghost")) {
            driver = setupGhostDriver();
        } else {
            System.err.println("Oops, driver '" + driverName + "' is unknown  :/");
            System.err.println("Take a look at the '" + DRIVERS_LIST_FILE + "' for a list of available drivers.");
            
            return null;	
        }
        
        timeToStartDriver = System.nanoTime() - startTime;
        System.out.println("Driver started in (ns): " + timeToStartDriver);
        
        try {
            runTestOn(driver);
        } finally {
            cleanup(driver);
        }

        totalTime = System.nanoTime() - startTime;
        timeToTest = totalTime - timeToStartDriver;
        System.out.println("Test done in (ns): " + timeToTest);
        System.out.println("Time elapsed (ns): " + totalTime);

        return new long[]{timeToStartDriver, timeToTest, totalTime};
    }
    
    protected WebDriver setupFirefoxDriver() {
        String firefoxBinary = paths.getProperty("firefox");
    	if (firefoxBinary != null)
	        System.setProperty("webdriver.firefox.bin", firefoxBinary);

        WebDriver driver = new FirefoxDriver(desiredCapabilities);
        
        return driver;
    }
    
    protected WebDriver setupChromeDriver() {
        System.setProperty("webdriver.chrome.driver", paths.getProperty("chromedriver"));
        
        String chromeBinary = paths.getProperty("chrome");
        if (chromeBinary != null)
            desiredCapabilities.setCapability("chrome.binary", chromeBinary);
        
        WebDriver driver = new ChromeDriver(desiredCapabilities);
        
        return driver;
    }
    
    protected WebDriver setupGhostDriver() {
        WebDriver driver = null;
        try {
	        serverProcess = Runtime.getRuntime().exec(paths.getProperty("phantomjs") + ' ' + paths.getProperty("ghostdriver"));
	        
	        BufferedReader phantomOutputReader = new BufferedReader(new InputStreamReader(serverProcess.getInputStream()));
	        while (phantomOutputReader.readLine () == null) { } //< As soon as Ghostdriver outputs something, we can continue
	        phantomOutputReader.close();
	        
    	    System.out.println("Remote WebDriver server port: " + port);    
	        driver = new RemoteWebDriver(new URL("http://localhost:" + port), desiredCapabilities);
        } catch (Exception e) {
        	cleanup(driver);
        	throw new RuntimeException(e);
        }
                
        return driver;
    }
    
    protected void cleanup(WebDriver driver) {
        // Ensure we don't leave zombies around...

        if (driver != null)
            driver.quit();
        
        if (serverProcess != null)
            serverProcess.destroy();
    }
    
    protected abstract void runTestOn(WebDriver driver);
}

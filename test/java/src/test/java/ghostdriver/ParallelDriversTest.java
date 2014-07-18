package ghostdriver;

import com.google.common.collect.ImmutableMap;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriverService;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Clock;
import java.util.*;
import java.util.concurrent.ConcurrentSkipListSet;
import java.util.concurrent.atomic.AtomicInteger;

import static java.lang.System.out;

public class ParallelDriversTest {
    private static final String CONFIG_FILE        = "../config.ini";
    private static final String DRIVER_FIREFOX     = "firefox";
    private static final String DRIVER_CHROME      = "chrome";
    private static final String DRIVER_PHANTOMJS   = "phantomjs";
    private static final String UA_CHROME = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36";

    protected static Properties sConfig;
    protected static DesiredCapabilities sCaps;

    private static boolean isUrl(String urlString) {
        try {
            new URL(urlString);
            return true;
        } catch (MalformedURLException mue) {
            return false;
        }
    }

    @BeforeClass
    public static void configure() throws IOException {
        // Read config file
        sConfig = new Properties();
        sConfig.load(new FileReader(CONFIG_FILE));

        // Prepare capabilities
        sCaps = new DesiredCapabilities();
        sCaps.setJavascriptEnabled(true);
        sCaps.setCapability("takesScreenshot", false);

        String driver = sConfig.getProperty("driver", DRIVER_PHANTOMJS);

        // Fetch PhantomJS-specific configuration parameters
        if (driver.equals(DRIVER_PHANTOMJS)) {
            // PhantomJS will pretend to be Chrome
            sCaps.setCapability("phantomjs.page.settings.userAgent", UA_CHROME);

            // "phantomjs_exec_path"
            if (sConfig.getProperty("phantomjs_exec_path") != null) {
                sCaps.setCapability(PhantomJSDriverService.PHANTOMJS_EXECUTABLE_PATH_PROPERTY, sConfig.getProperty("phantomjs_exec_path"));
            } else {
                throw new IOException(String.format("Property '%s' not set!", PhantomJSDriverService.PHANTOMJS_EXECUTABLE_PATH_PROPERTY));
            }
            // "phantomjs_driver_path"
            if (sConfig.getProperty("phantomjs_driver_path") != null) {
                out.println("Test will use an external GhostDriver");
                sCaps.setCapability(PhantomJSDriverService.PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY, sConfig.getProperty("phantomjs_driver_path"));
            } else {
                out.println("Test will use PhantomJS internal GhostDriver");
            }
        }

        // Disable "web-security", enable all possible "ssl-protocols" and "ignore-ssl-errors" for PhantomJSDriver
        ArrayList<String> cliArgsCap = new ArrayList<String>();
        cliArgsCap.add("--web-security=false");
        cliArgsCap.add("--ssl-protocol=any");
        cliArgsCap.add("--ignore-ssl-errors=true");
        sCaps.setCapability(PhantomJSDriverService.PHANTOMJS_CLI_ARGS, cliArgsCap);

        // Control LogLevel for GhostDriver, via CLI arguments
        sCaps.setCapability(PhantomJSDriverService.PHANTOMJS_GHOSTDRIVER_CLI_ARGS, new String[] {
                "--logLevel=" + (sConfig.getProperty("phantomjs_driver_loglevel") != null ? sConfig.getProperty("phantomjs_driver_loglevel") : "INFO")
        });
    }

    public WebDriver buildDriver() throws Exception {
        // Which driver to use? (default "phantomjs")
        String driver = sConfig.getProperty("driver", DRIVER_PHANTOMJS);

        // Start appropriate Driver
        if (isUrl(driver)) {
            return new RemoteWebDriver(new URL(driver), sCaps);
        } else if (driver.equals(DRIVER_FIREFOX)) {
            return new FirefoxDriver(sCaps);
        } else if (driver.equals(DRIVER_CHROME)) {
            out.println(String.format("DISPLAY env variable: %s", System.getenv("DISPLAY")));

            ChromeOptions opts = new ChromeOptions();
            opts.addArguments(
//                    "--no-sandbox",
                    "--enable-experimental-extension-apis",
                    "--allow-http-screen-capture");
            sCaps.setCapability(ChromeOptions.CAPABILITY, opts);

//            ChromeDriverService service = new ChromeDriverService.Builder()
//                    .usingAnyFreePort()
//                    .withEnvironment(ImmutableMap.of("DISPLAY", ":10"))
//                    .usingDriverExecutable(new File("/usr/bin/chromedriver"))
//                    .build();

//            return new ChromeDriver(service, sCaps);
            return new ChromeDriver(sCaps);
        } else {
            return new PhantomJSDriver(sCaps);
        }
    }

    @Test
    public void loadAverageInMultithreading() {
        String testUrl = sConfig.getProperty("test_url");
        int concurrentBrowsers = Integer.parseInt(sConfig.getProperty("concurrent_browsers"));
        int iterations = Integer.parseInt(sConfig.getProperty("iterations"));

        BigInteger[] averages;
        BigInteger averageDriverStartupTime = new BigInteger("0");
        BigInteger averagePageLoadTime = new BigInteger("0");
        for (int i = 0; i < iterations; ++i) {
            averages = loadAverage(testUrl, concurrentBrowsers);
            averageDriverStartupTime = averageDriverStartupTime.add(averages[0]);
            averagePageLoadTime = averagePageLoadTime.add(averages[1]);
        }
        averageDriverStartupTime = averageDriverStartupTime.divide(new BigInteger(Integer.toString(iterations)));
        averagePageLoadTime = averagePageLoadTime.divide(new BigInteger(Integer.toString(iterations)));

        out.println();
        out.println("***RESULT******************************");
        out.println(String.format("* Driver: %s", sConfig.getProperty("driver")));
        out.println(String.format("* URL: %s", testUrl));
        out.println(String.format("* Number of Concurrent Browsers: %d", concurrentBrowsers));
        out.println(String.format("* Iterations : %d", iterations));
        out.println(String.format("* Average Driver Startup Time: %.4f", (double)averageDriverStartupTime.longValue()/1000));
        out.println(String.format("* Average Page Load Time: %.4f", (double) averagePageLoadTime.longValue()/1000));
        out.println("***************************************");
        out.println();
    }

    private BigInteger[] loadAverage(final String url, final int concurrentBrowsers) {
        final Set<Long> pageLoadTimes = new ConcurrentSkipListSet<Long>();
        final Set<Long> driverStartupTimes = new ConcurrentSkipListSet<Long>();
        final Clock clock = Clock.systemDefaultZone();
        final AtomicInteger finishedThreads = new AtomicInteger(0);

        for (int i = 0; i < concurrentBrowsers; ++i) {
            new Thread(() -> {
                WebDriver d = null;
                long startTime = clock.millis();
                try {
                    d = buildDriver();
                    // Establish Driver Startup Time
                    driverStartupTimes.add(clock.millis() - startTime);

                    startTime = clock.millis();
                    d.get(url);
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    // Establish Page Load Time
                    pageLoadTimes.add(clock.millis() - startTime);
                    // Thread is done
                    finishedThreads.incrementAndGet();

                    if (null != d) d.quit();
                }
            }).start();
            out.print(".");
        }

        // Wait for all threads to be finished
        ThreadUtils.waitFor(t -> finishedThreads.get() == concurrentBrowsers);
        out.println();

        // Average it
        BigInteger driverStartupTimeAverage = average(driverStartupTimes);
        BigInteger pageLoadTimeAverage = average(pageLoadTimes);

        return new BigInteger[]{ driverStartupTimeAverage, pageLoadTimeAverage };
    }

    private BigInteger average(Set<Long> pageLoadTimes) {
        BigInteger pageLoadTimeAverage = new BigInteger("0");
        for (Long l : pageLoadTimes) {
            pageLoadTimeAverage = pageLoadTimeAverage.add(new BigInteger(l.toString()));
        }
        pageLoadTimeAverage = pageLoadTimeAverage.divide(new BigInteger(Integer.toString(pageLoadTimes.size())));
        return pageLoadTimeAverage;
    }
}

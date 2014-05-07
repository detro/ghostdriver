package ghostdriver;

import com.github.detro.browsermobproxyclient.BMPCLocalLauncher;
import com.github.detro.browsermobproxyclient.BMPCProxy;
import com.github.detro.browsermobproxyclient.manager.BMPCLocalManager;
import com.google.gson.JsonObject;
import org.junit.*;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;

import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@RunWith(Parameterized.class)
public class RuntimeProxySetupTest extends BaseTestWithServer {
    private static BMPCLocalManager localProxyManager;
    private BMPCProxy proxy;
    private URL url;

    @Parameterized.Parameters(name = "URL requested through Proxy: {0}")
    public static Collection<URL[]> data() throws Exception {
        List<URL[]> requestedUrls = new ArrayList<URL[]>();
        requestedUrls.add(new URL[]{new URL("http://www.google.com/")});
        requestedUrls.add(new URL[]{new URL("http://ivandemarino.me/ghostdriver/")});
        return requestedUrls;
    }

    public RuntimeProxySetupTest(URL url) {
        this.url = url;
    }

    @BeforeClass
    public static void startProxyManager() {
        localProxyManager = BMPCLocalLauncher.launchOnRandomPort();
    }

    @Before
    public void createProxy() throws Exception {
        proxy = localProxyManager.createProxy();
        sCaps.setCapability(CapabilityType.PROXY, proxy.asSeleniumProxy());
        prepareDriver();
    }

    @Test
    public void requestsProcessedByProxy() {
        proxy.newHar(url.toString());

        WebDriver driver = getDriver();
        driver.navigate().to(url);

        JsonObject har = proxy.har();
        assertNotNull(har);
        String firstUrlLoaded = har.getAsJsonObject("log")
                .getAsJsonArray("entries").get(0).getAsJsonObject()
                .getAsJsonObject("request")
                .getAsJsonPrimitive("url").getAsString();
        assertEquals(url.toString(), firstUrlLoaded);
    }

    @After
    public void closeProxy() {
        proxy.close();
    }

    @AfterClass
    public static void stopProxyManager() throws Exception {
        localProxyManager.closeAll();
        localProxyManager.stop();
    }
}

package ghostdriver;

import static org.hamcrest.CoreMatchers.hasItem;
import static org.junit.Assert.assertThat;

import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.browsermob.proxy.ProxyServer;
import org.browsermob.proxy.http.BrowserMobHttpRequest;
import org.browsermob.proxy.http.RequestInterceptor;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;

/**
 * 
 * @author Artem Koshelev artkoshelev@gmail.com
 *
 */
@RunWith(Parameterized.class)
public class RuntimeProxySetupTest extends BaseTestWithServer {
	private SaveRequestsProxyServer proxyServer;
	private WebDriver driver;
	private URL url;
	
    @Parameterized.Parameters(name = "Requested url: {0}")
    public static Collection<URL[]> data() throws Exception {
        List<URL[]> requestedUrls = new ArrayList<URL[]>();
        requestedUrls.add(new URL[]{new URL("http://phantomjs.org//")});
        requestedUrls.add(new URL[]{new URL("http://ivandemarino.me/ghostdriver/")});
        requestedUrls.add(new URL[]{new URL("http://casperjs.org/")});
        return requestedUrls;
    }
    
    public RuntimeProxySetupTest(URL url) {
    	this.url = url;
    }
	
	@Before
	public void startProxy() throws Exception {
		proxyServer = new SaveRequestsProxyServer(0);
		proxyServer.start();
		
		Proxy proxy = proxyServer.seleniumProxy();
		sCaps.setCapability(CapabilityType.PROXY, proxy);
		prepareDriver();
		driver = getDriver();
	}
	
	@Test
	public void requestsProcessedByProxy() {
		driver.navigate().to(url);;
		assertThat(proxyServer.allRequests, hasItem(url.getHost()));
	}
	
	@After
	public void shutdownProxy() throws Exception {
		proxyServer.stop();
	}
	
	private class SaveRequestsProxyServer extends ProxyServer {
		List<String> allRequests = new ArrayList<String>();
		
		public SaveRequestsProxyServer(int port) {
			super(port);
		}
		
		@Override
		public void start() throws Exception {
			super.start();		
			addRequestInterceptor(new RequestInterceptor() {
				@Override
				public void process(BrowserMobHttpRequest request) {
					System.out.println(request.getProxyRequest().getHost());
					allRequests.add(request.getProxyRequest().getHost());
				}
			});
		}
		
		public List<String> getAllRequests() {
			return allRequests;
		}
	}
}

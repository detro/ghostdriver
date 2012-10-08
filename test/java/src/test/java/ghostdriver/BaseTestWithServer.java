package ghostdriver;

import ghostdriver.server.CallbackHttpServer;
import org.junit.After;
import org.junit.Before;

abstract public class BaseTestWithServer extends BaseTest {
    protected CallbackHttpServer server;

    @Before
    public void startServer() throws Exception {
        server = new CallbackHttpServer();
        server.start();
    }

    @After
    public void stopServer() throws Exception {
        server.stop();
    }
}

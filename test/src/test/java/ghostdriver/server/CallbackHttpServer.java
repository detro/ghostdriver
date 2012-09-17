package ghostdriver.server;

import static java.lang.String.format;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.servlet.Context;
import org.mortbay.jetty.servlet.ServletHolder;

public class CallbackHttpServer {
    protected Server server;

    public HttpRequestCallback getGetHandler() {
        return getHandler;
    }

    public void setGetHandler(HttpRequestCallback getHandler) {
        this.getHandler = getHandler;
    }

    protected HttpRequestCallback getHandler;

    public void start() throws Exception {
        server = new Server(0);
        Context context = new Context(server, "/");
        addServlets(context);
        server.start();
    }

    public void stop() throws Exception {
        server.stop();
    }

    protected void addServlets(Context context) {
        context.addServlet(new ServletHolder(new CallbackServlet(this)), "/*");
    }

    public int getPort() {
        return server.getConnectors()[0].getLocalPort();
    }

    public String getBaseUrl() {
        return format("http://localhost:%d/", getPort());
    }
}

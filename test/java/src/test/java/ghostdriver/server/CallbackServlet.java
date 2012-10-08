package ghostdriver.server;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CallbackServlet extends HttpServlet {
    private CallbackHttpServer server;

    CallbackServlet(CallbackHttpServer server) {
        this.server = server;
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        if (server.getGetHandler() != null) {
            server.getGetHandler().call(req, res);
        } else {
            super.doGet(req, res);
        }
    }
}

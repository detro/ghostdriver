package ghostdriver.server;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class EmptyPageHttpRequestCallback implements HttpRequestCallback {
    @Override
    public void call(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.getOutputStream().println("<html><head></head><body></body></html>");
    }
}

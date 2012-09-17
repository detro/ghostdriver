package ghostdriver.server;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public interface HttpRequestCallback {
    void call(HttpServletRequest req, HttpServletResponse res) throws IOException;
}

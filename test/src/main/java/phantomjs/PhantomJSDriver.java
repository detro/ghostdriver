package phantomjs;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;

/**
 * TODO Doc
 */
public class PhantomJSDriver extends RemoteWebDriver {
    private boolean mExternalPhantomJS;
    private Process mPhantomJSProcess;
    private String mPhantomJSExecPath;
    private String mPhantomJSDriverPath;        //< TODO Remove this once GhostDriver is merged into PhantomJS

    public static final String CAPABILITY_PHANTOMSJS_EXEC_PATH      = "phantomjsExecPath";
    public static final String CAPABILITY_PHANTOMJS_DRIVER_PATH     = "phantomjsDriverPath";

    /**
     * TODO
     * @param externalDriverUrl
     * @param desireCapabilities
     */
    public PhantomJSDriver(URL externalDriverUrl, Capabilities desireCapabilities) {
        super(externalDriverUrl, desireCapabilities);
        mExternalPhantomJS = true;
        mPhantomJSProcess = null;
        mPhantomJSExecPath = null;
        mPhantomJSDriverPath = null;
    }

    /**
     * TODO
     * @param desiredCapabilities
     */
    public PhantomJSDriver(Capabilities desiredCapabilities) {
        super((CommandExecutor) null, desiredCapabilities);

        // NOTE: At this point, given that there is not a Command Executor set,
        // the status of the Driver is inconsistent.
        // We will create the Executor as part of the "PhantomJSDriver#startSession(Capabilities)"
        // call that the RemoteWebDriver constructor will make.
    }

    /**
     * TODO
     * @param desiredCapabilities
     * @param requiredCapabilities
     * @throws WebDriverException
     */
    @Override
    protected void startSession(Capabilities desiredCapabilities, Capabilities requiredCapabilities) throws WebDriverException {
        // Will launch a PhantomJS WebDriver process ONLY if this driver is not already using an external one
        if (!mExternalPhantomJS) {
            // Read PhantomJS executable and JS Driver path from the capabilities
            mPhantomJSExecPath = (String)desiredCapabilities.getCapability(CAPABILITY_PHANTOMSJS_EXEC_PATH);
            mPhantomJSDriverPath = (String)desiredCapabilities.getCapability(CAPABILITY_PHANTOMJS_DRIVER_PATH);
            // Throw WebDriverException in case any of the previous two was not provided
            if (mPhantomJSExecPath == null ||
                    mPhantomJSDriverPath == null ||
                    !new File(mPhantomJSExecPath).exists() ||
                    !new File(mPhantomJSDriverPath).exists()) {
                throw new WebDriverException("PhantomJSDriver: Path to PhantomJS Executable or Driver not provided/invalid");
            }

            // Read the Proxy configuration
            Proxy proxy = (Proxy) desiredCapabilities.getCapability(CapabilityType.PROXY);
            // Find a free port to launch PhantomJS WebDriver on
            String phantomJSPortStr = Integer.toString(PortProber.findFreePort());

            log(getSessionId(), "About to launch PhantomJS WebDriver", null, When.BEFORE);
            try {
                // Launch PhantomJS and wait for first output on console before proceeding
                mPhantomJSProcess = Runtime.getRuntime().exec(new String[] {
                        mPhantomJSExecPath,
                        proxy != null ? "--proxy=" + proxy.getHttpProxy() : "",
                        mPhantomJSDriverPath,
                        phantomJSPortStr
                });
                final BufferedReader reader = new BufferedReader(new InputStreamReader(mPhantomJSProcess.getInputStream()));
                while (reader.readLine() == null) { /* wait here for some output: once it prints, it's ready to work */ }
                mExternalPhantomJS = false;

                // PhantomJS is ready to serve.
                // Setting the HTTP Command Executor that this RemoteWebDriver will use
                setCommandExecutor(new HttpCommandExecutor(new URL("http://localhost:"+phantomJSPortStr)));
            } catch (IOException ioe) {
                // Log exception & Cleanup
                log(getSessionId(), null, ioe, When.EXCEPTION);
                stopClient();
                throw new WebDriverException("PhantomJSDriver: " + ioe.getMessage());
            }
            log(getSessionId(), "PhantomJS WebDriver ready", null, When.AFTER);
        }

        // We are ready to let the RemoteDriver do its job from here
        super.startSession(desiredCapabilities, requiredCapabilities);
    }

    /**
     * TODO
     */
    @Override
    protected void stopClient() {
        // Shutdown the PhantomJS process
        if (!mExternalPhantomJS && mPhantomJSProcess != null) {
            log(getSessionId(), "Shutting down PhantomJS WebDriver", null, When.BEFORE);
            mPhantomJSProcess.destroy();
        }
    }
}
/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package phantomjs;

import org.openqa.selenium.*;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;

/**
 * A WebDriver client-side implementations for PhantomJS.
 *
 * This class relies largely on the parent class RemoteWebDriver: the only functionality added here is the handling
 * of the PhantomJS process.
 * @class PhantomJSDriver
 */
public class PhantomJSDriver extends RemoteWebDriver implements TakesScreenshot {
    private boolean useExternalPhantomJS = false;   //< "true" only when a running instance of PhantomJS Driver is provided
    private Process phantomJSProcess;

    public static final String CAPABILITY_PHANTOMSJS_EXEC_PATH      = "phantomjs.execPath";
    public static final String CAPABILITY_PHANTOMJS_DRIVER_PATH     = "phantomjs.driverPath";

    /**
     * Constructor.
     *
     * This instance will NOT be responsible for the life-cycle of the PhantomJS process.
     * In case you want to delegate this, consider
     * using {@link PhantomJSDriver#PhantomJSDriver(org.openqa.selenium.Capabilities)}.
     *
     * @param externalDriverUrl URL to the running PhantomJS WebDriver instance.
     * @param desiredCapabilities Capabilities required during this WebDriver session.
     */
    public PhantomJSDriver(URL externalDriverUrl, Capabilities desiredCapabilities) {
        super(externalDriverUrl, desiredCapabilities);
        useExternalPhantomJS = true;
        phantomJSProcess = null;
    }

    /**
     * Constructor.
     *
     * This instance will be responsible to control the life-cycle of the PhantomJS process.
     * In case you have a PhantomJS WebDriver process already running, you can instead use
     * {@link PhantomJSDriver#PhantomJSDriver(java.net.URL, org.openqa.selenium.Capabilities)} to
     * delegate the execution to that.
     *
     * @param desiredCapabilities Capabilities required during this WebDriver session.
     */
    public PhantomJSDriver(Capabilities desiredCapabilities) {
        super((CommandExecutor) null, desiredCapabilities);

        // NOTE: At this point, given that there is not a Command Executor set,
        // the status of the Driver is inconsistent.
        // We will create the Executor as part of the "PhantomJSDriver#startSession(Capabilities)"
        // call that the RemoteWebDriver constructor will make.
    }

    /**
     * In case this instance was required to handle the life-cycle of the PhantomJS process, that starts here.
     * Otherwise this is a "transparent" method.
     *
     * @param desiredCapabilities
     * @param requiredCapabilities
     * @throws WebDriverException
     */
    @Override
    protected void startSession(Capabilities desiredCapabilities, Capabilities requiredCapabilities) throws WebDriverException {
        // Will launch a PhantomJS WebDriver process ONLY if this driver is not already using an external one
        if (!useExternalPhantomJS) {
            // Read PhantomJS executable and JS Driver path from the capabilities
            String executablePath = (String)desiredCapabilities.getCapability(CAPABILITY_PHANTOMSJS_EXEC_PATH);
            String driverPath = (String)desiredCapabilities.getCapability(CAPABILITY_PHANTOMJS_DRIVER_PATH);

            // Throw WebDriverException in case any of the previous two was not provided
            if (executablePath == null ||
                    driverPath == null ||
                    !new File(executablePath).exists() ||
                    !new File(driverPath).exists()) {
                throw new WebDriverException("PhantomJSDriver: Path to PhantomJS Executable or Driver not provided/invalid");
            }

            // Read the Proxy configuration
            Proxy proxy = (Proxy) desiredCapabilities.getCapability(CapabilityType.PROXY);
            // Prepare the parameters to pass to the PhantomJS executable on the command line
            String proxyParams = "";
            if (proxy != null) {
                switch(proxy.getProxyType()) {
                    case MANUAL:
                        if (!proxy.getHttpProxy().isEmpty()) {          //< HTTP proxy
                            log(getSessionId(), "Reading Proxy Configuration", "Manual, HTTP", When.BEFORE);
                            proxyParams = String.format("--proxy-type=http --proxy=%s",
                                    proxy.getHttpProxy());
                        } else if (!proxy.getSocksProxy().isEmpty()) {  //< SOCKS5 proxy
                            log(getSessionId(), "Reading Proxy Configuration", "Manual, SOCKS5", When.BEFORE);
                            proxyParams = String.format("--proxy-type=socks5 --proxy=%s --proxy-auth=%s:%s",
                                    proxy.getSocksProxy(),
                                    proxy.getSocksUsername(),
                                    proxy.getSocksPassword());
                        } else {
                            // TODO Other type of proxy not supported yet by PhantomJS
                            log(getSessionId(), "Reading Proxy Configuration", "Manual, NOT SUPPORTED", When.BEFORE);
                        }
                        break;
                    case PAC:
                        // TODO Not supported yet by PhantomJS
                        log(getSessionId(), "Reading Proxy Configuration", "PAC, NOT SUPPORTED", When.BEFORE);
                        break;
                    case SYSTEM:
                        log(getSessionId(), "Reading Proxy Configuration", "SYSTEM", When.BEFORE);
                        proxyParams = "--proxy-type=system";
                        break;
                    case AUTODETECT:
                        // TODO Not supported yet by PhantomJS
                        log(getSessionId(), "Reading Proxy Configuration", "AUTODETECT, NOT SUPPORTED", When.BEFORE);
                        break;
                    case DIRECT:
                        log(getSessionId(), "Reading Proxy Configuration", "DIRECT", When.BEFORE);
                        proxyParams = "--proxy-type=none";
                    default:
                        log(getSessionId(), "Reading Proxy Configuration", "NONE", When.BEFORE);
                        proxyParams = "";
                        break;
                }
            }

            // Find a free port to launch PhantomJS WebDriver on
            String phantomJSPortStr = Integer.toString(PortProber.findFreePort());
            log(getSessionId(), "Looking for a free port for PhantomJS WebDriver", phantomJSPortStr, When.AFTER);

            log(getSessionId(), "About to launch PhantomJS WebDriver", null, When.BEFORE);
            try {
                // Launch PhantomJS and wait for first output on console before proceeding
                phantomJSProcess = Runtime.getRuntime().exec(new String[] {
                        executablePath,     //< path to PhantomJS executable
                        proxyParams,        //< command line parameters for Proxy configuration
                        driverPath,         //< path to the PhantomJS Driver
                        phantomJSPortStr    //< port on which the Driver should listen on
                });
                final BufferedReader reader = new BufferedReader(new InputStreamReader(phantomJSProcess.getInputStream()));
                while (reader.readLine() == null) { /* wait here for some output: once it prints, it's ready to work */ }
                useExternalPhantomJS = false;

                // PhantomJS is ready to serve.
                // Setting the HTTP Command Executor that this RemoteWebDriver will use
                setCommandExecutor(new HttpCommandExecutor(new URL("http://localhost:"+phantomJSPortStr)));
            } catch (IOException ioe) {
                // Log exception & Cleanup
                log(getSessionId(), null, ioe, When.EXCEPTION);
                stopClient();
                throw new WebDriverException("PhantomJSDriver: " + ioe.getMessage(), ioe);
            }
            log(getSessionId(), "PhantomJS WebDriver ready", null, When.AFTER);
        }

        // We are ready to let the RemoteDriver do its job from here
        super.startSession(desiredCapabilities, requiredCapabilities);
    }

    /**
     * If this instance initially started the PhantomJS process, it's now responsible to shut it down.
     */
    @Override
    protected void stopClient() {
        // Shutdown the PhantomJS process
        if (!useExternalPhantomJS && phantomJSProcess != null) {
            log(getSessionId(), "Shutting down PhantomJS WebDriver", null, When.BEFORE);
            phantomJSProcess.destroy();
        }
    }

    /**
     * Take screenshot of the current window.
     *
     * @param target The target type/format of the Screenshot
     * @return Screenshot of current window, in the requested format
     * @throws WebDriverException
     * @see TakesScreenshot#getScreenshotAs(org.openqa.selenium.OutputType)
     */
    @Override
    public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
        // Get the screenshot as base64 and convert it to the requested type (i.e. OutputType<T>)
        String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
        return target.convertFromBase64Png(base64);
    }
}
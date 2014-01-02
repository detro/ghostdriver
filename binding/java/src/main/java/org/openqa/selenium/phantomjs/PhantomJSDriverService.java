/*
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2014, Ivan De Marino <http://ivandemarino.me>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

package org.openqa.selenium.phantomjs;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Map;
import java.util.logging.Logger;

import static com.google.common.base.Preconditions.*;

/**
 * Service that controls the life-cycle of a PhantomJS in Remote WebDriver mode.
 * The Remote WebDriver is implemented via GhostDriver.
 * <p/>
 * NOTE: Yes, the design of this class is heavily inspired by {@link org.openqa.selenium.chrome.ChromeDriverService}.
 *
 * @author Ivan De Marino <http://ivandemarino.me>
 */
public class PhantomJSDriverService extends DriverService {

    /**
     * Internal Logger
     */
    private static final Logger LOG = Logger.getLogger(PhantomJSDriverService.class.getName());

    /**
     * System property/capability that defines the location of the PhantomJS executable.
     */
    public static final String PHANTOMJS_EXECUTABLE_PATH_PROPERTY = "phantomjs.binary.path";
    /**
     * Optional System property/capability that defines the location of the
     * GhostDriver JavaScript launch file (i.e. <code>"src/main.js"</code>).
     */
    public static final String PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY = "phantomjs.ghostdriver.path";

    /**
     * Capability that allows to add custom command line arguments to the
     * spawned PhantomJS process.
     *
     * <p>
     * Set this capability with a list of of argument strings to add, e.g.
     * <code>new String[] { "--ignore-ssl-errors=yes", "--load-images=no" }</code>.
     * </p>
     */
    public static final String PHANTOMJS_CLI_ARGS = "phantomjs.cli.args";

    /**
     * Capability that allows to pass custom command line arguments to the
     * GhostDriver JavaScript launch file, spawned PhantomJS process.
     * NOTE: This is useful only when used together with PhantomJSDriverService#PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY.
     *
     * <p>
     * Set this capability with a list of of argument strings to add, e.g.
     * <code>new String[] { "--logFile=PATH", "--logLevel=DEBUG" }</code>.
     * </p>
     *
     * <p>
     * Acceptable arguments:
     * <ul>
     *     <li><code>--ip=IP_GHOSTDRIVER_SHOULD_LISTEN_ON</code></li>
     *     <li><code>--port=PORT_GHOSTDRIVER_SHOULD_LISTEN_ON</code></li>
     *     <li><code>--hub=HTTP_ADDRESS_TO_SELENIUM_HUB</code></li>
     *     <li><code>--logFile=PATH_TO_LOGFILE</code></li>
     *     <li><code>--logLevel=(INFO|DEBUG|WARN|ERROR)</code></li>
     *     <li><code>--logColor=(false|true)</code></li>
     * </ul>
     * </p>
     */
    public static final String PHANTOMJS_GHOSTDRIVER_CLI_ARGS = "phantomjs.ghostdriver.cli.args";

    /**
     * Set capabilities with this prefix to apply it to the PhantomJS <code>page.settings.*</code> object.
     * Every PhantomJS WebPage Setting can be used.
     * See <a href="https://github.com/ariya/phantomjs/wiki/API-Reference#wiki-webpage-settings">PhantomJS docs/a>.
     */
    public static final String PHANTOMJS_PAGE_SETTINGS_PREFIX = "phantomjs.page.settings.";

    /**
     * Set capabilities with this prefix to apply it to the PhantomJS <code>page.customHeaders.*</code> object.
     * Any header can be used.
     * See <a href="https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#wiki-webpage-customHeaders">PhantomJS docs/a>.
     */
    public static final String PHANTOMJS_PAGE_CUSTOMHEADERS_PREFIX = "phantomjs.page.customHeaders.";

    /**
     * Default Log file name.
     * Can be changed using {@link PhantomJSDriverService.Builder#withLogFile(java.io.File)}.
     */
    private static final String PHANTOMJS_DEFAULT_LOGFILE = "phantomjsdriver.log";

    private static final String PHANTOMJS_DEFAULT_EXECUTABLE = "phantomjs";

    private static final String PHANTOMJS_DOC_LINK = "https://github.com/ariya/phantomjs/wiki";
    private static final String PHANTOMJS_DOWNLOAD_LINK = "http://phantomjs.org/download.html";
    private static final String GHOSTDRIVER_DOC_LINK = "https://github.com/detro/ghostdriver/blob/master/README.md";
    private static final String GHOSTDRIVER_DOWNLOAD_LINK = "https://github.com/detro/ghostdriver/downloads";

    /**
     * Constructor
     *
     * @param executable  File pointing at the PhantomJS executable.
     * @param port        Which port to start the PhantomJS/GhostDriver on.
     * @param args        The arguments to the launched server.
     * @param environment The environment for the launched server.
     * @throws java.io.IOException If an I/O error occurs.
     */
    private PhantomJSDriverService(File executable,
                                   int port,
                                   ImmutableList<String> args,
                                   ImmutableMap<String, String> environment) throws IOException {
        super(executable, port, args, environment);

        // Print out the parameters used to launch PhantomJS Driver Service
        LOG.info("executable: " + executable.getAbsolutePath());
        LOG.info("port: " + port);
        LOG.info("arguments: " + args.toString());
        LOG.info("environment: " + environment.toString());
    }

    /**
     * Configures and returns a new {@link PhantomJSDriverService} using the default configuration.
     * <p/>
     * In this configuration, the service will use the PhantomJS executable identified by the the
     * following capability, system property or PATH environment variables:
     * <ul>
     *      <li>{@link PhantomJSDriverService#PHANTOMJS_EXECUTABLE_PATH_PROPERTY}</li>
     *      <li>
     *          {@link PhantomJSDriverService#PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY}
     *          (Optional - without will use GhostDriver internal to PhantomJS)
     *      </li>
     * </ul>
     * <p/>
     * Each service created by this method will be configured to find and use a free port on the current system.
     *
     * @return A new ChromeDriverService using the default configuration.
     */
    public static PhantomJSDriverService createDefaultService(Capabilities desiredCapabilities) {
        // Look for Proxy configuration within the Capabilities
        Proxy proxy = null;
        if (desiredCapabilities != null) {
            proxy = Proxies.extractProxy(desiredCapabilities);
        }

        // Find PhantomJS executable
        File phantomjsfile = findPhantomJS(desiredCapabilities, PHANTOMJS_DOC_LINK, PHANTOMJS_DOWNLOAD_LINK);

        // Find GhostDriver main JavaScript file
        File ghostDriverfile = findGhostDriver(desiredCapabilities, GHOSTDRIVER_DOC_LINK, GHOSTDRIVER_DOWNLOAD_LINK);

        // Build & return service
        return new Builder().usingPhantomJSExecutable(phantomjsfile)
                .usingGhostDriver(ghostDriverfile)
                .usingAnyFreePort()
                .withProxy(proxy)
                .withLogFile(new File(PHANTOMJS_DEFAULT_LOGFILE))
                .usingCommandLineArguments(
                        findCLIArgumentsFromCaps(desiredCapabilities, PHANTOMJS_CLI_ARGS))
                .usingGhostDriverCommandLineArguments(
                        findCLIArgumentsFromCaps(desiredCapabilities, PHANTOMJS_GHOSTDRIVER_CLI_ARGS))
                .build();
    }

    /**
     * Same as {@link PhantomJSDriverService#createDefaultService(org.openqa.selenium.Capabilities)}.
     * <p/>
     * In this case PhantomJS or GhostDriver can't be searched within the Capabilities, only System
     * Properties.
     *
     * @return A new ChromeDriverService using the default configuration.
     */
    public static PhantomJSDriverService createDefaultService() {
        return createDefaultService(null);
    }

    /**
     * Looks into the Capabilities, the current $PATH and the System Properties for
     * {@link PhantomJSDriverService#PHANTOMJS_EXECUTABLE_PATH_PROPERTY}.
     * <p/>
     * NOTE: If the Capability, the $PATH and the System Property are set, the Capability takes
     * priority over the System Property, that in turn takes priority over the $PATH.
     *
     * @param desiredCapabilities Capabilities in which we will look for the path to PhantomJS
     * @param docsLink            The link to the PhantomJS documentation page
     * @param downloadLink        The link to the PhantomJS download page
     * @return The driver executable as a {@link File} object
     * @throws IllegalStateException If the executable not found or cannot be executed
     */
    @SuppressWarnings("deprecation")
    protected static File findPhantomJS(Capabilities desiredCapabilities, String docsLink,
                                        String downloadLink) {
        String phantomjspath = null;
        if (desiredCapabilities != null &&
                desiredCapabilities.getCapability(PHANTOMJS_EXECUTABLE_PATH_PROPERTY) != null) {
            phantomjspath = (String) desiredCapabilities.getCapability(PHANTOMJS_EXECUTABLE_PATH_PROPERTY);
        } else {
            phantomjspath = CommandLine.find(PHANTOMJS_DEFAULT_EXECUTABLE);
            phantomjspath = System.getProperty(PHANTOMJS_EXECUTABLE_PATH_PROPERTY, phantomjspath);
        }

        checkState(phantomjspath != null,
                "The path to the driver executable must be set by the %s capability/system property/PATH variable;"
                        + " for more information, see %s. "
                        + "The latest version can be downloaded from %s",
                PHANTOMJS_EXECUTABLE_PATH_PROPERTY,
                docsLink,
                downloadLink);

        File phantomjs = new File(phantomjspath);
        checkExecutable(phantomjs);
        return phantomjs;
    }

    /**
     * Find the GhostDriver main file (i.e. <code>"main.js"</code>).
     * <p/>
     * Looks into the Capabilities and the System Properties for
     * {@link PhantomJSDriverService#PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY}.
     * <p/>
     * NOTE: If both the Capability and the System Property are set, the Capability takes priority.
     *
     * @param desiredCapabilities Capabilities in which we will look for the path to GhostDriver
     * @param docsLink            The link to the GhostDriver documentation page
     * @param downloadLink        The link to the GhostDriver download page
     * @return The driver executable as a {@link File} object
     * @throws IllegalStateException If the executable not found or cannot be executed
     */
    protected static File findGhostDriver(Capabilities desiredCapabilities, String docsLink, String downloadLink) {
        // Recover path to GhostDriver from the System Properties or the Capabilities
        String ghostdriverpath = null;
        if (desiredCapabilities != null &&
                (String) desiredCapabilities.getCapability(PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY) != null) {
            ghostdriverpath = (String) desiredCapabilities.getCapability(PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY);
        } else {
            ghostdriverpath = System.getProperty(PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY, ghostdriverpath);
        }

        if (ghostdriverpath != null) {
            checkState(ghostdriverpath != null,
                    "The path to the driver executable must be set by the '%s' capability/system property;"
                            + " for more information, see %s. "
                            + "The latest version can be downloaded from %s",
                    PHANTOMJS_GHOSTDRIVER_PATH_PROPERTY,
                    docsLink,
                    downloadLink);

            // Check few things on the file before returning it
            File ghostdriver = new File(ghostdriverpath);
            checkState(ghostdriver.exists(),
                    "The GhostDriver does not exist: %s",
                    ghostdriver.getAbsolutePath());
            checkState(ghostdriver.isFile(),
                    "The GhostDriver is a directory: %s",
                    ghostdriver.getAbsolutePath());
            checkState(ghostdriver.canRead(),
                    "The GhostDriver is not a readable file: %s",
                    ghostdriver.getAbsolutePath());

            return ghostdriver;
        }

        // This means that no GhostDriver System Property nor Capability was set
        return null;
    }

    private static String[] findCLIArgumentsFromCaps(Capabilities desiredCapabilities, String capabilityName) {
        if (desiredCapabilities != null) {
            Object cap = desiredCapabilities.getCapability(capabilityName);
            if (cap != null) {
                if (cap instanceof String[]) {
                    return (String[]) cap;
                } else if (cap instanceof Collection) {
                    try {
                        @SuppressWarnings("unchecked")
                        Collection<String> capCollection = (Collection<String>)cap;
                        return capCollection.toArray(new String[capCollection.size()]);
                    } catch (Exception e) {
                        // If casting fails, log an error and assume no CLI arguments are provided
                        LOG.warning(String.format(
                                "Unable to set Capability '%s' as it was neither a String[] or a Collection<String>",
                                capabilityName));
                    }
                }
            }
        }
        return new String[]{};  // nothing found: return an empty array of arguments
    }

    /**
     * Builder used to configure new {@link PhantomJSDriverService} instances.
     */
    public static class Builder {

        private int port = 0;
        private File phantomjs = null;
        private File ghostdriver = null;
        private ImmutableMap<String, String> environment = ImmutableMap.of();
        private File logFile;
        private Proxy proxy = null;
        private String[] commandLineArguments = null;
        private String[] ghostdriverCommandLineArguments = null;

        /**
         * Sets which PhantomJS executable the builder will use.
         *
         * @param file The executable to use.
         * @return A self reference.
         */
        public Builder usingPhantomJSExecutable(File file) {
            checkNotNull(file);
            checkExecutable(file);
            this.phantomjs = file;
            return this;
        }

        /**
         * Sets which GhostDriver the builder will use.
         *
         * @param file The GhostDriver's <code>main.js</code> to use.
         * @return A self reference.
         */
        public Builder usingGhostDriver(File file) {
            this.ghostdriver = file;
            return this;
        }

        /**
         * Sets which port the service should listen on. A value of 0 indicates that any free port
         * may be used.
         *
         * @param port The port to use; must be non-negative.
         * @return A self reference.
         */
        public Builder usingPort(int port) {
            checkArgument(port >= 0, "Invalid port number: %d", port);
            this.port = port;
            return this;
        }

        /**
         * Configures the service to listen on any available port.
         *
         * @return A self reference.
         */
        public Builder usingAnyFreePort() {
            this.port = 0;
            return this;
        }

        /**
         * Defines the environment for the service. These settings will be inherited by every
         * browser session launched by the service.
         *
         * @param environment A map of the environment variables to launch the service with.
         * @return A self reference.
         */
        public Builder withEnvironment(Map<String, String> environment) {
            this.environment = ImmutableMap.copyOf(environment);
            return this;
        }

        /**
         * Configures the service to write log to the given file.
         *
         * @param logFile A file to write log to.
         * @return A self reference.
         */
        public Builder withLogFile(File logFile) {
            this.logFile = logFile;
            return this;
        }

        /**
         * Configures the service to use a specific Proxy configuration.
         * <p/>
         * NOTE: Usually the proxy configuration is passed to the Remote WebDriver via WireProtocol
         * Capabilities. PhantomJS doesn't yet support protocol configuration at runtime: it
         * requires it to be defined on launch.
         *
         * @param proxy The {@link Proxy} configuration from the {@link org.openqa.selenium.remote.DesiredCapabilities}
         * @return A self reference.
         */
        public Builder withProxy(Proxy proxy) {
            this.proxy = proxy;
            return this;
        }

        /**
         * Configures the service to pass additional command line arguments to the PhantomJS executable.
         * @param commandLineArguments list of command line arguments, e.g. "--ignore-ssl-errors=yes"
         * @return A self reference.
         */
        public Builder usingCommandLineArguments(String[] commandLineArguments) {
            this.commandLineArguments = commandLineArguments;
            return this;
        }

        /**
         * Configures the service to pass additional command line arguments to GhostDriver, run by PhantomJS executable.
         * @param ghostdriverCommandLineArguments list of command line arguments for GhostDriver
         * @return A self reference.
         */
        public Builder usingGhostDriverCommandLineArguments(String[] ghostdriverCommandLineArguments) {
            this.ghostdriverCommandLineArguments = ghostdriverCommandLineArguments;
            return this;
        }

        /**
         * Creates a new service. Before creating a new service, the builder will find a port for
         * the server to listen to.
         *
         * @return The new service object.
         */
        public PhantomJSDriverService build() {
            // Find a port to listen on, if not already decided
            port = port == 0 ? PortProber.findFreePort() : port;

            // Few final checks
            checkState(phantomjs != null, "Path to PhantomJS executable not specified");

            try {
                // Build a list of command line arguments for the executable
                ImmutableList.Builder<String> argsBuilder = ImmutableList.builder();

                // Add command line proxy configuration for PhantomJS
                if (proxy != null) {
                    switch (proxy.getProxyType()) {
                        case MANUAL:
                            if (!proxy.getHttpProxy().isEmpty()) {          //< HTTP proxy
                                argsBuilder.add("--proxy-type=http");
                                argsBuilder.add(String.format("--proxy=%s", proxy.getHttpProxy()));
                            } else if (!proxy.getSocksProxy().isEmpty()) {  //< SOCKS5 proxy
                                argsBuilder.add("--proxy-type=socks5");
                                argsBuilder.add(String.format("--proxy=%s", proxy.getSocksProxy()));
                                argsBuilder.add(String.format("--proxy-auth=%s:%s", proxy.getSocksUsername(),
                                        proxy.getSocksPassword()));
                            } else {
                                // TODO Not supported yet by PhantomJS
                                checkArgument(true, "PhantomJS supports only HTTP and Socks5 Proxy currently");
                            }
                            break;
                        case PAC:
                            // TODO Not supported yet by PhantomJS
                            checkArgument(true, "PhantomJS doesn't support Proxy PAC files");
                            break;
                        case SYSTEM:
                            argsBuilder.add("--proxy-type=system");
                            break;
                        case AUTODETECT:
                            // TODO Not supported yet by PhantomJS
                            checkArgument(true, "PhantomJS doesn't support Proxy Auto-configuration");
                            break;
                        case DIRECT:
                        default:
                            argsBuilder.add("--proxy-type=none");
                            break;
                    }
                }

                // Additional command line arguments (if provided)
                if (this.commandLineArguments != null) {
                    argsBuilder.add(this.commandLineArguments);
                }

                // Should use an external GhostDriver?
                if (ghostdriver != null) { //< Path to GhostDriver provided: use it simply as a PhantomJS script
                    // Add the canonical path to GhostDriver
                    argsBuilder.add(ghostdriver.getCanonicalPath());

                    // Add the port to listed on
                    argsBuilder.add(String.format("--port=%d", port));

                    // Add Log File
                    if (logFile != null) {
                        argsBuilder.add(String.format("--logFile=%s", logFile.getAbsolutePath()));
                    }

                    // Additional GhostDriver command line arguments (if provided)
                    if (this.ghostdriverCommandLineArguments!= null) {
                        argsBuilder.add(this.ghostdriverCommandLineArguments);
                    }
                } else { //< Path to GhostDriver not provided: use PhantomJS's internal GhostDriver (default behaviour)

                    // Append required parameters
                    argsBuilder.add(String.format("--webdriver=%d", port));

                    // Add Log File
                    if (logFile != null) {
                        argsBuilder.add(String.format("--webdriver-logfile=%s", logFile.getAbsolutePath()));
                    }
                }

                // Create a new service
                return new PhantomJSDriverService(phantomjs, port, argsBuilder.build(), environment);
            } catch (IOException e) {
                throw new WebDriverException(e);
            }
        }
    }
}

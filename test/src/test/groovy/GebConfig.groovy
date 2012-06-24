import org.openqa.selenium.remote.*

baseUrl = 'http://localhost:4567/'

reportsDir = "target/geb-reports"

driver = {
	def driver
	if(System.properties.firefox == 'true') {
		driver = new org.openqa.selenium.firefox.FirefoxDriver()
	} else {
		// Ask for a JavaScript-enabled browser
		DesiredCapabilities capabilities = new DesiredCapabilities()
		capabilities.javascriptEnabled = true
		driver = new RemoteWebDriver(new URL("http://localhost:8080"), capabilities)
		actualCapabilities = ((RemoteWebDriver) driver).getCapabilities();
		assert actualCapabilities.javascriptEnabled
	}
	return driver
}


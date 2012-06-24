package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec
import org.openqa.selenium.*
import javax.imageio.ImageIO

class WindowSizeSpec extends GebReportingSpec {
	def setup() {
		to WindowSizePage
	}

	def "When size is not explicitly set, screen size is 400x300"() {
		when:
			def dim = driver.manage().window().size
		then:
			[dim.width, dim.height] == [400, 300]
	}

	def "When window size is set, screenshot dimensions correspond to the new dimension"() {
		given: "The size is set"
			def w=567, h=456
		when: "Screenshot is taken"
			driver.manage().window().setSize(new Dimension(w, h))
		then: "Screenshot dimensions are as expected"
			def img = ImageIO.read(new ByteArrayInputStream(augmentedDriver.getScreenshotAs(OutputType.BYTES)))
			[img.width, img.height] == [w, h]
	}

	def "When window size is set and a new page is loaded, screenshot dimensions correspond to the new dimension"() {
		given: "The size is set"
			def w=567, h=456
		when: "Screenshot is taken"
			driver.manage().window().setSize(new Dimension(w, h))
			to WindowSizePage
		then: "Screenshot dimensions are as expected"
			def img = ImageIO.read(new ByteArrayInputStream(augmentedDriver.getScreenshotAs(OutputType.BYTES)))
			[img.width, img.height] == [w, h]
	}
}

class WindowSizePage extends Page {
	static url = 'window_size.html'
}


package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class SourceSpec extends GebReportingSpec {
	def setup() {
		to SimpleSourcePage
	}
		
	def 'page HTML should not be null'() {
		expect:
			html == '<html><head><title>Simple</title></head><body><div><p>Some text</p></div>\n</body></html>'
	}
}

class SimpleSourcePage extends Page {
	static url = 'simple_source.html'
	static content = {
		html { browser.driver.pageSource }
	}
}


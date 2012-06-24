package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class FindMultipleSpec extends GebReportingSpec {
	def setup() {
		to FindMultiplePage
	}

	@Unroll
	def 'text should be fetched for multiple elements'() {
		expect:
			paras*.text() == ['one', 'two', 'three']
	}
}

class FindMultiplePage extends Page {
	static url = 'find_multiple.html'
	static content = {
		paras { $('p') }
	}
}


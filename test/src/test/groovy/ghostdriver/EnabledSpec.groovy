package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class EnabledSpec extends GebReportingSpec {
	def setup() {
		to EnabledPage
	}

	@Unroll
	def 'enabled and disabled elements should be identified correctly'() {
		expect:
			$(selecter).disabled == !enabled
		where:
			selecter    | enabled
			'input.en'  | true
			'input.dis' | false
	}
}

class EnabledPage extends Page {
	static url = 'enabled.html'
}


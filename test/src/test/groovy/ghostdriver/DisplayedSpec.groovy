package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class DisplayedSpec extends GebReportingSpec {
	def setup() {
		to DisplayPage
	}

	def 'Block elemement should be displayed'() {
		expect:
			normalDiv.displayed
	}

	def 'Inline element should be displayed'() {
		expect:
			normalSpan.displayed
	}

	def 'css display:none should mark something as not displayed'() {
		expect:
			!displayNoneDiv.displayed
	}
}

class DisplayPage extends Page {
	static url = 'displayed_and_hidden.html'
	static content = {
		normalDiv { $('div.normal') }
		normalSpan { $('span.normal') }
		displayNoneDiv { $('div.none') }
	}
}


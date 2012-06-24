package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class TextSpec extends GebReportingSpec {
	def setup() {
		to TextPage
	}

	@Unroll
	def 'text should be fetched'() {
		expect:
			$(selecter).text() == text
		where:
			selecter     | text
			'#content'   | "I'm a p\nAnd I'm a div\nDoes this work?"
			'p'          | "I'm a p"
			'div>div'    | "And I'm a div"
			'textarea'   | "Does this work?"
			'style'      | "" // N.B. should get VISIBLE text only!
			'title'      | ""
			'.not-shown' | ""
	}
}

class TextPage extends Page {
	static url = 'text.html'
}


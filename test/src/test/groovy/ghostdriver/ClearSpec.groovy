package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class ClearSpec extends GebReportingSpec {
	def setup() {
		to ClearPage
	}

	@Unroll
	def "clear should empty a text input of it's value"() {
		when:
			def element = $(selecter)
		then:
			element.value() == initialText
		when:
			element.firstElement().clear()
		then:
			element.value() == ''
		where:
			selecter                 | initialText
			'textarea'               | 'I am the textarea'
			'input[type="text"]'     | 'I am the text input'
			'input[type="password"]' | 'I am the password'
	}
}

class ClearPage extends Page {
	static url = 'clear.html'
}


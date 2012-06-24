package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class ClickSpec extends GebReportingSpec {
	def setup() {
		to ClickPage
	}

	def "Clicking on a submit button should submit a form(!)"() {
		when:
			submitButton.click()
		then:
			waitFor { $('.content p').text() == 'Thanks for submitting!' }
	}
}

class ClickPage extends Page {
	static url = 'click.html'

	static content = {
		submitButton { $('input[type="submit"]') }
	}
}


package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class NameSpec extends GebReportingSpec {
	def setup() {
		to NamePage
	}
		
	def 'element names should always be reported in lower case'() {
		expect:
			$('#' + id).tag() == expectedName
		where:
			expectedName | id
                        'span'       | 'lower-case-span'
                        'span'       | 'upper-case-span'
	}
}

class NamePage extends Page {
	static url = 'name.html'
}


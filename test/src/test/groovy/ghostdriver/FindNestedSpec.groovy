package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class FindNestedSpec extends GebReportingSpec {
	def setup() {
		to FindNestedPage
	}

	def 'd1 should have lots of text'() {
		expect:
			$('#d1').text() == 'one\ntwo\nthree'
	}

	def 'd2 should have a little less text'() {
		expect:
			$('#d1').find('#d2').text() == 'two\nthree'
	}

	def 'd3 should have even less text'() {
		expect:
			$('#d1').find('#d2').find('#d3').text() == 'three'
	}

	def 'e1 should not have much text in either'() {
		expect:
			$('#e1').find('div')*.text() == ['only me!']
	}
}

class FindNestedPage extends Page {
	static url = 'find_nested.html'
}


package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class SelectedSpec extends GebReportingSpec {
	def setup() {
		to SelectedPage
	}

	@Unroll
	def "should be able to check the selected item"() {
		expect:
			$(selecter).firstElement().selected == selected
		where:
			selecter                      | selected
			'input[name="cb_unselected"]' | false
			'input[name="cb_selected"]'   | true
			'input[name="rb_unselected"]' | false
			'input[name="rb_selected"]'   | true
			'option#op_unselected'        | false
			'option#op_selected'          | true
	}
}

class SelectedPage extends Page {
	static url = 'selected.html'
}


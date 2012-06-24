package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class CssPropertySpec extends GebReportingSpec {
	def setup() {
		to CssPropertyPage
	}

	/**
	 * NB. According to Spec colors should be returned in #000000 format, but spec also
	 * warns of inconsisten behaviour so we can probably ignore that and use phantomjs's
	 * rgb() values.
	 * @see https://selenium.googlecode.com/svn/trunk/docs/api/java/org/openqa/selenium/WebElement.html#getCssValue%28java.lang.String%29
	 */
	@Unroll
	def "Simple CSS properties should be fetched"() {
		expect:
			$(selecter).firstElement().getCssValue(key) == value
		where:
			selecter         | key                  | value
			'#normal-div'    | 'display'            | 'block'
			'#hidden-div'    | 'display'            | 'none'
			'#bordered-div'  | 'border-right-width' | '1px'
			'#bordered-div'  | 'border-right-style' | 'solid'
			'#bordered-div'  | 'border-right-color' | 'rgb(255, 0, 0)'
			'#unwrapped-div' | 'white-space'        | 'nowrap'
			'#freestyle-div' | 'background-color'   | 'rgb(0, 128, 0)'
	}

	@Unroll
	def "Shorthand properties should not be fetched"() {
		expect:
			$(selecter).firstElement().getCssValue(key) == ""
		where:
			selecter         | key             | value
			'#bordered-div'  | 'border'        | '1px solid black'
			'#bordered-div'  | 'border-top'    | '1px solid black'
			'#bordered-div'  | 'border-right'  | '1px solid black'
			'#bordered-div'  | 'border-bottom' | '1px solid black'
			'#bordered-div'  | 'border-right'  | '1px solid black'
	}
}

class CssPropertyPage extends Page {
	static url = 'css_properties.html'
}

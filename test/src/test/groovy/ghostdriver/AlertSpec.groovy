package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec
import org.openqa.selenium.*

@Ignore
class AlertSpec extends GebReportingSpec {
	private static final String ALERT_PAGE = 'alert/alert.html'
	private static final String CONFIRM_PAGE = 'alert/confirm.html'
	private static final String PROMPT_PAGE = 'alert/prompt.html'

	@Unroll
	def "check alert content"() {
		when:
			go "alert/${page}.html"
		then:
			waitFor { getAlert() }.text == "I am an alert of type $page"
		where:
			page << ['alert', 'confirm', 'prompt']
	}

	def "alert can be accepted"() {
		given:
			go ALERT_PAGE
		when:
			waitFor { getAlert() }.accept()
		then:
			waitFor { $('#result').text() == 'alert removed' }
	}

	def "alert can be dismissed"() {
		given:
			go ALERT_PAGE
		when:
			waitFor { getAlert() }.dismiss()
		then:
			waitFor { $('#result').text() == 'alert removed' }
	}

	def "confirm can be accepted"() {
		given:
			go CONFIRM_PAGE
		when:
			waitFor { getAlert() }.accept()
		then:
			$('#result').text() == 'confirmed'
			$('#cancelled').text() == ''
	}

	def "confirm can be dismissed"() {
		given:
			go CONFIRM_PAGE
		when:
			waitFor { getAlert() }.accept()
		then:
			$('#result').text() == ''
			$('#cancelled').text() == 'cancelled'
	}

	def "prompt can be accepted"() {
		given:
			def alert
			go PROMPT_PAGE
		when:
			waitFor { alert = getAlert() }.accept()
			alert.sendKeys('helo')
		then:
			$('#result').text() == 'prompt accepted: helo'
			$('#cancelled').text() == ''
	}

	def "prompt can be dismissed"() {
		given:
			go PROMPT_PAGE
		when:
			waitFor { getAlert() }.accept()
		then:
			$('#result').text() == ''
			$('#cancelled').text() == 'cancelled'
	}

	private def getAlert() {
		try {
			driver.switchTo().alert()
		} catch(NoAlertPresentException _ ) {
			null
		}
	}
}


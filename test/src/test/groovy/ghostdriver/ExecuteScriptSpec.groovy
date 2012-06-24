
package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class ExecuteScriptSpec extends GebReportingSpec {
	def setup() {
		to IndexPage
	}

	@Unroll
	def 'should be able to execute arbitrary javascript on the server'() {
		expect:
			js.exec(1, 2, "return arguments[0] + arguments[1];") == 3
	}
}


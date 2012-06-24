package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class AttributeSpec extends GebReportingSpec {
	def setup() {
		to AttributePage
	}

	@Unroll
	def 'attributes should be fetched'() {
		expect:
			ellie."@$name" == value
		where:
			name       | value
			'missing'  | null
			'id'       | 'ellie'
			'style'    | 'color: red; '
			'class'    | 'normal thing'
			'invented' | 'ABC 123 four'
	}

	@Unroll('Fetching an attribute value called "#name" should be fully legal')
	def 'attribute names that look like commands should be treated as attributes'() {
		expect:
			println "CHECKING ATTRIBUTE VALUE: $name"
			keywords."@$name" == name.reverse()
		where:
			// This is a list of all words used in the URLs of commands the JSONWireProtocol (@see https://code.google.com/p/selenium/wiki/JsonWireProtocol)
			name << ['accept_alert', 'activate', 'activated', 'active', 'active_engine', 'alert_text', 'async_script', 'attribute', 'available_engines', 'back', 'buttondown', 'buttonup', 'clear', 'click', 'cookie', 'css', 'deactivate', 'dismiss_alert', 'displayed', 'doubleclick', 'down', 'element', 'elements', 'enabled', 'equals', 'execute', 'execute_async', 'flick', 'forward', 'frame', 'ime', 'implicit_wait', 'key', 'keys', 'local_storage', 'location', 'location_in_view', 'longclick', 'maximize', 'move', 'moveto', 'name', 'orientation', 'position', 'refresh', 'screenshot', 'scroll', 'selected', 'session', 'session_storage', 'sessions', 'size', 'source', 'status', 'submit', 'text', 'timeouts', 'title', 'touch', 'up', 'url', 'value', 'window', 'window_handle', 'window_handles']
	}
}

class AttributePage extends Page {
	static url = 'attribute.html'
	static content = {
		ellie { $('#ellie') }
		keywords { $('#keywords') }
	}
}


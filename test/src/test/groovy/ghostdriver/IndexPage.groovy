package ghostdriver

import spock.lang.*
import geb.*

class IndexPage extends Page {
	static url = 'index.html'
	static content = {
		html { $() }
		title { $('title', 0).text() }
		contentContainer { $('#content') }
		hiddenDiv { $('#hiddenthing') }
	}
}

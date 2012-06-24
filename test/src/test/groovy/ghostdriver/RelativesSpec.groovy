package ghostdriver

import spock.lang.*
import geb.*
import geb.spock.GebReportingSpec

class RelativesSpec extends GebReportingSpec {
	private static final def GRANDAD = 'grandad'
	private static final def DAD = 'dad'
	private static final def ALICE = 'alice'
	private static final def BOB = 'bob'
	private static final def CHARLIE = 'charlie'
	private static final def KIDS = [ALICE, BOB, CHARLIE]

	def setup() {
		to RelativesPage
	}

	private def find(id) {
		return $("#$id")
	}

	@Unroll
	def 'kids should know their parent'() {
		expect:
			find(kid).parent().@id == parent
		where:
			parent  | kid
			GRANDAD | DAD
			DAD     | ALICE
			DAD     | BOB
			DAD     | CHARLIE
	}

	@Unroll
	def 'parents should know their children'() {
		expect:
			find(parent).children()*.@id == children
		where:
			parent  | children
			GRANDAD | [DAD]
			DAD     | KIDS
			ALICE   | []
			BOB     | []
			CHARLIE | []
	}

	@Unroll
	def 'elements should know their preceding sibling'() {
		expect:
			find(e).previous().@id == previous
		where:
			e       | previous
			GRANDAD | null
			DAD     | null
			ALICE   | null
			BOB     | ALICE
			CHARLIE | BOB
	}

	@Unroll
	def 'elements should know their following sibling'() {
		expect:
			find(e).next().@id == next
		where:
			e       | next
			GRANDAD | null
			DAD     | null
			ALICE   | BOB
			BOB     | CHARLIE
			CHARLIE | null
	}

	@Unroll
	def 'elements should know all their siblings'() {
		expect:
			find(element).siblings()*.@id == siblings
		where:
			element | siblings
			GRANDAD | []
			DAD     | []
			ALICE   | KIDS - ALICE
			BOB     | KIDS - BOB
			CHARLIE | KIDS - CHARLIE
	}

	@Unroll
	def 'elements should know all preceding siblings'() {
		expect:
			find(element).prevAll()*.@id == previousSiblings
		where:
			element | previousSiblings
			GRANDAD | []
			DAD     | []
			ALICE   | []
			BOB     | [ALICE]
			CHARLIE | KIDS - CHARLIE
	}

	@Unroll
	def 'elements should know all following siblings'() {
		expect:
			find(element).nextAll()*.@id == followingSiblings
		where:
			element | followingSiblings
			GRANDAD | []
			DAD     | []
			ALICE   | KIDS - ALICE
			BOB     | [CHARLIE]
			CHARLIE | []
	}
}

class RelativesPage extends Page {
	static url = 'relatives.html'
}


import unittest
import base_test
from selenium.webdriver.support.ui import WebDriverWait


class DuckDuckGoSearchWebDriver(base_test.BaseTest):

    def test_duckduckgo_search_webdriver(self):
        driver = self.driver

        # Load DuckDuckGo
        driver.get("http://duckduckgo.com/")
        self.assertIn("DuckDuckGo", driver.title)

        # Search for "webdriver"
        searchBox = WebDriverWait(driver, 5).until(lambda driver: driver.find_element_by_id('search_form_input_homepage'))
        searchBox.send_keys("webdriver")
        driver.find_element_by_id("search_button_homepage").click()

        # Wait for page load (i.e. title changed)
        WebDriverWait(driver, 10).until(lambda driver: "webdriver" in driver.title.encode("utf-8"))


if __name__ == "__main__":
    unittest.main()

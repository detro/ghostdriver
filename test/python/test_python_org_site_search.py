import unittest
import base_test
from selenium.webdriver.common.keys import Keys


class PythonOrgSiteSearch(base_test.BaseTest):

    def test_search_in_python_org(self):
        driver = self.driver
        driver.get("http://www.python.org")
        self.assertIn("Python", driver.title)
        elem = driver.find_element_by_name("q")
        elem.send_keys("selenium")
        elem.send_keys(Keys.RETURN)
        self.assertIn("Google", driver.title)


if __name__ == "__main__":
    unittest.main()

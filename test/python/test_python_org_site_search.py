import unittest
import base_test
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait


class PythonOrgSiteSearch(base_test.BaseTest):

    def test_search_in_python_org(self):
        driver = self.driver
        driver.get("http://www.python.org")

        # Check title contains "Python"
        self.assertIn("Python", driver.title)

        # Submit a search
        elem = driver.find_element_by_name("q")
        elem.send_keys("selenium")
        elem.send_keys(Keys.RETURN)

        # Wait for page load (i.e. title changed)
        WebDriverWait(driver, 10).until(lambda driver: "Google" in driver.title.encode("utf-8"))


if __name__ == "__main__":
    unittest.main()

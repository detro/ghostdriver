import sys
sys.path.insert(0, "utils")
import properties
import unittest
from selenium import webdriver


class BaseTest(unittest.TestCase):

    def __init__(self, arguments):
        super(BaseTest, self).__init__(arguments)

        # Reading configuration
        self.config = properties.Properties()
        self.config.load(open("../config.ini"))

        # Preparing Capabilities
        self.caps = {
            'takeScreenshot': False,
            'javascriptEnabled': True
        }

    def setUp(self):
        browser = self.config.getProperty("browser")

        # Decide the Driver to use
        if browser == "firefox":
            self.driver = webdriver.Firefox()
        else:
            self.driver = webdriver.Remote(
                command_executor="http://localhost:8080/wd/hub",
                desired_capabilities=self.caps)

    def tearDown(self):
        self.driver.close()

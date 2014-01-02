# This file is part of the GhostDriver project from Neustar inc.
#
# Copyright (c) 2014, Ivan De Marino <http://ivandemarino.me>
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
#
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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
        driver = self.config.getProperty("driver")

        # TODO Use/Make a PhantomJSDriver for Python
        # TODO Handle the case where "driver" is a URL to a RemoteWebDriver instance

        # Decide the Driver to use
        if driver == "firefox":
            self.driver = webdriver.Firefox()
        else:
            self.driver = webdriver.Remote(
                command_executor="http://localhost:8080/wd/hub",
                desired_capabilities=self.caps)

    def tearDown(self):
        self.driver.close()

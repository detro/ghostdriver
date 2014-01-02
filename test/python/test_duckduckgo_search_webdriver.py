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

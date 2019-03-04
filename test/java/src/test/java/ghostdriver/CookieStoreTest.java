/*
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2017, Jason Gowan
Copyright (c) 2012-2014, Ivan De Marino <http://ivandemarino.me>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

package ghostdriver;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import ghostdriver.server.HttpRequestCallback;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;

public class CookieStoreTest extends BaseTestWithServer {
    private File cookiesFile;

    private final static HttpRequestCallback COOKIE_TEST_CALLBACK = new HttpRequestCallback() {
        @Override
        public void call(HttpServletRequest req, HttpServletResponse res) throws IOException {
            javax.servlet.http.Cookie cookie = new javax.servlet.http.Cookie("test", "test");
            cookie.setDomain(".localhost");
            cookie.setMaxAge(360);

            res.addCookie(cookie);

            Cookie[] requestCookies = req.getCookies();
            String value = "";
            for (int i = 0; i < requestCookies.length; i++) {
                if (requestCookies[i].getName().equals("hello")) {
                    value = requestCookies[i].getValue().replaceAll("[^a-z]", "");
                }
            }
            res.getOutputStream().println("<div id=\"hello\">" + value + "</div>");
        }
    };

    private void goToPage(String path) {
        getDriver().get(server.getBaseUrl() + path);
    }

    private void goToPage() {
        goToPage("");
    }

    @Override
    public void prepareDriver() throws Exception {
        cookiesFile = File.createTempFile("cookies", ".ini");
        FileWriter writer = new FileWriter(cookiesFile);
        String expires = new SimpleDateFormat("EEE, dd-MMM-yyyy HH:mm:ss zzz").
                format(new Date(System.currentTimeMillis() + 3600 * 1000));
        writer.write("[General]\n");
        writer.write("cookies=\"@Variant(\\0\\0\\0\\x7f\\0\\0\\0\\x16QList<QNetworkCookie>" +
                "\\0\\0\\0\\0\\x1\\0\\0\\0\\x1\\0\\0\\0Mhello=world; expires=" + expires +
                "; domain=.localhost; path=/)\"\n");
        writer.close();
        sCaps.setCapability("phantomjs.cookies.path", cookiesFile.getPath());
        super.prepareDriver();
    }

    @After
    public void deleteCookiesFile() throws IOException {
        cookiesFile.delete();
    }

    @Test
    public void shouldSaveCookies() throws Exception {
        disableAutoQuitDriver();
        server.setHttpHandler("GET", COOKIE_TEST_CALLBACK);
        goToPage();
        getDriver().quit();

        BufferedReader reader = new BufferedReader(new FileReader(cookiesFile));
        boolean matched = false;
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.indexOf("test=test") >= 0) matched = true;
        }
        assertTrue(matched);
    }

    @Test
    public void shouldLoadCookies() throws Exception {
        server.setHttpHandler("GET", COOKIE_TEST_CALLBACK);
        goToPage();
        WebElement e = getDriver().findElement(By.id("hello"));
        assertEquals("world", e.getText());
    }
}

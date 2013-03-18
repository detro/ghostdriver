/*
This file is part of the GhostDriver by Ivan De Marino <http://ivandemarino.me>.

Copyright (c) 2012, Ivan De Marino <http://ivandemarino.me>
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

import ghostdriver.server.HttpRequestCallback;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class FrameSwitchingTest extends BaseTestWithServer {

    private String getCurrentFrameName(WebDriver driver) {
        return (String)((JavascriptExecutor) driver).executeScript("return window.frameElement ? " +
                "window.frameElement.name : " +
                "'__MAIN_FRAME__';");
    }

    private boolean isAtTopWindow(WebDriver driver) {
        return (Boolean)((JavascriptExecutor) driver).executeScript("return window == window.top");
    }

    @Test
    public void switchToFrameByNumber() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame(0);
        assertEquals("packageFrame", getCurrentFrameName(d));
        d.switchTo().defaultContent();
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame(0);
        assertEquals("packageFrame", getCurrentFrameName(d));
    }

    @Test
    public void switchToFrameByName() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
        d.switchTo().defaultContent();
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
    }

    @Test
    public void switchToFrameByElement() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame(d.findElement(By.name("packageFrame")));
        assertEquals("packageFrame", getCurrentFrameName(d));
        d.switchTo().defaultContent();
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        d.switchTo().frame(d.findElement(By.name("packageFrame")));
        assertEquals("packageFrame", getCurrentFrameName(d));
    }

    @Test(expected = NoSuchFrameException.class)
    public void failToSwitchToFrameByName() throws Exception {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        d.switchTo().frame("unavailable frame");
    }

    @Test(expected = NoSuchElementException.class)
    public void shouldBeAbleToClickInAFrame() throws InterruptedException {
        WebDriver d = getDriver();

        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));

        d.switchTo().frame("classFrame");
        assertEquals("classFrame", getCurrentFrameName(d));

        // This should cause a reload in the frame "classFrame"
        d.findElement(By.linkText("HttpClient")).click();

        // Wait for new content to load in the frame.
        WebDriverWait wait = new WebDriverWait(d, 10);
        wait.until(ExpectedConditions.titleContains("HttpClient"));

        // Frame should still be "classFrame"
        assertEquals("classFrame", getCurrentFrameName(d));

        // Check if a link "clearCookies()" is there where expected
        assertEquals("clearCookies", d.findElement(By.linkText("clearCookies")).getText());

        // Make sure it was really frame "classFrame" which was replaced:
        // 1. move to the other frame "packageFrame"
        d.switchTo().defaultContent().switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
        // 2. the link "clearCookies()" shouldn't be there anymore
        d.findElement(By.linkText("clearCookies"));
    }

    @Test(expected = NoSuchElementException.class)
    public void shouldBeAbleToClickInAFrameAfterRunningJavaScript() throws InterruptedException {
        WebDriver d = getDriver();

        // Navigate to page and ensure we are on the Main Frame
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        assertTrue(isAtTopWindow(d));
        d.switchTo().defaultContent();
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        assertTrue(isAtTopWindow(d));

        // Switch to a child frame
        d.switchTo().frame("classFrame");
        assertEquals("classFrame", getCurrentFrameName(d));
        assertFalse(isAtTopWindow(d));

        // Renavigate to the page, and check we are back on the Main Frame
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        assertTrue(isAtTopWindow(d));
        // Switch to a child frame
        d.switchTo().frame("classFrame");
        assertEquals("classFrame", getCurrentFrameName(d));
        assertFalse(isAtTopWindow(d));

        // This should cause a reload in the frame "classFrame"
        d.findElement(By.linkText("HttpClient")).click();

        // Wait for new content to load in the frame.
        WebDriverWait wait = new WebDriverWait(d, 10);
        wait.until(ExpectedConditions.titleContains("HttpClient"));

        // Frame should still be "classFrame"
        assertEquals("classFrame", getCurrentFrameName(d));

        // Check if a link "clearCookies()" is there where expected
        assertEquals("clearCookies", d.findElement(By.linkText("clearCookies")).getText());

        // Make sure it was really frame "classFrame" which was replaced:
        // 1. move to the other frame "packageFrame"
        d.switchTo().defaultContent().switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
        // 2. the link "clearCookies()" shouldn't be there anymore
        d.findElement(By.linkText("clearCookies"));
    }

    @Test
    public void titleShouldReturnWindowTitle() {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");
        assertEquals("__MAIN_FRAME__", getCurrentFrameName(d));
        String topLevelTitle = d.getTitle();
        d.switchTo().frame("packageFrame");
        assertEquals("packageFrame", getCurrentFrameName(d));
        assertEquals(topLevelTitle, d.getTitle());
        d.switchTo().defaultContent();
        assertEquals(topLevelTitle, d.getTitle());
    }

    @Test
    public void pageSourceShouldReturnSourceOfFocusedFrame() throws InterruptedException {
        WebDriver d = getDriver();
        d.get("http://docs.wpm.neustar.biz/testscript-api/index.html");

        // Compare source before and after the frame switch
        String pageSource = d.getPageSource();
        d.switchTo().frame("classFrame");
        String framePageSource = d.getPageSource();
        assertFalse(pageSource.equals(framePageSource));

        assertTrue("Page source was: " + framePageSource, framePageSource.contains("Interface Summary"));
    }

    @Test
    public void shouldSwitchBackToMainFrameIfLinkInFrameCausesTopFrameReload() throws Exception {
        WebDriver d = getDriver();
        String expectedTitle = "Unique title";

        d.get("http://localhost:2310/common/frameset.html");
        assertEquals(expectedTitle, d.getTitle());

        d.switchTo().frame(0);
        d.findElement(By.linkText("top")).click();

        // Wait for new content to load in the frame.
        expectedTitle = "XHTML Test Page";
        WebDriverWait wait = new WebDriverWait(d, 10);
        wait.until(ExpectedConditions.titleIs(expectedTitle));
        assertEquals(expectedTitle, d.getTitle());

        WebElement element = d.findElement(By.id("amazing"));
        assertNotNull(element);
    }

    @Test
    public void shouldSwitchBetweenNestedFrames() {
        // Define HTTP response for test
        server.setGetHandler(new HttpRequestCallback() {
            @Override
            public void call(HttpServletRequest req, HttpServletResponse res) throws IOException {
                String pathInfo = req.getPathInfo();
                ServletOutputStream out = res.getOutputStream();

                // NOTE: the following pages are cut&paste from "Watir" test specs.
                // @see https://github.com/watir/watirspec/tree/master/html/nested_frame.html
                if (pathInfo.endsWith("nested_frame_1.html")) {
                    // nested frame 1
                    out.println("frame 1");
                } else if (pathInfo.endsWith("nested_frame_2.html")) {
                    // nested frame 2
                    out.println("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\">\n" +
                            "<html>\n" +
                            "  <body>\n" +
                            "    <iframe id=\"three\" src=\"nested_frame_3.html\"></iframe>\n" +
                            "  </body>\n" +
                            "</html>");
                } else if (pathInfo.endsWith("nested_frame_3.html")) {
                    // nested frame 3, nested inside frame 2
                    out.println("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\">\n" +
                            "<html>\n" +
                            "  <body>\n" +
                            "    <a id=\"four\" href=\"definition_lists.html\" target=\"_top\">this link should consume the page</a>\n" +
                            "  </body>\n" +
                            "</html>");
                } else if (pathInfo.endsWith("definition_lists.html")) {
                    // definition lists
                    out.println("<html>\n" +
                            "  <head>\n" +
                            "    <title>definition_lists</title>\n" +
                            "  </head>\n" +
                            "</html>");
                } else {
                    // main page
                    out.println("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\">\n" +
                            "<html>\n" +
                            "  <frameset cols=\"20%, 80%\">\n" +
                            "    <frame id=\"one\" src=\"nested_frame_1.html\">\n" +
                            "    <frame id=\"two\" src=\"nested_frame_2.html\">\n" +
                            "  </frameset>\n" +
                            "</html>");
                }
            }
        });

        // Launch Driver against the above defined server
        WebDriver d = getDriver();
        d.get(server.getBaseUrl());

        // Switch to frame "#two"
        d.switchTo().frame("two");
        // Switch further down into frame "#three"
        d.switchTo().frame("three");
        // Click on the link in frame "#three"
        d.findElement(By.id("four")).click();

        // Expect page to have loaded and title to be set correctly
        new WebDriverWait(d, 5).until(ExpectedConditions.titleIs("definition_lists"));
    }

    @Test
    public void shouldSwitchBetweenNestedFramesPickedViaWebElement() {
        // Define HTTP response for test
        server.setGetHandler(new HttpRequestCallback() {
            @Override
            public void call(HttpServletRequest req, HttpServletResponse res) throws IOException {
                String pathInfo = req.getPathInfo();
                ServletOutputStream out = res.getOutputStream();

                // NOTE: the following pages are cut&paste from "Watir" test specs.
                // @see https://github.com/watir/watirspec/tree/master/html/nested_frame.html
                if (pathInfo.endsWith("nested_frame_1.html")) {
                    // nested frame 1
                    out.println("frame 1");
                } else if (pathInfo.endsWith("nested_frame_2.html")) {
                    // nested frame 2
                    out.println("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\">\n" +
                            "<html>\n" +
                            "  <body>\n" +
                            "    <iframe id=\"three\" src=\"nested_frame_3.html\"></iframe>\n" +
                            "  </body>\n" +
                            "</html>");
                } else if (pathInfo.endsWith("nested_frame_3.html")) {
                    // nested frame 3, nested inside frame 2
                    out.println("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\">\n" +
                            "<html>\n" +
                            "  <body>\n" +
                            "    <a id=\"four\" href=\"definition_lists.html\" target=\"_top\">this link should consume the page</a>\n" +
                            "  </body>\n" +
                            "</html>");
                } else if (pathInfo.endsWith("definition_lists.html")) {
                    // definition lists
                    out.println("<html>\n" +
                            "  <head>\n" +
                            "    <title>definition_lists</title>\n" +
                            "  </head>\n" +
                            "</html>");
                } else {
                    // main page
                    out.println("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\">\n" +
                            "<html>\n" +
                            "  <frameset cols=\"20%, 80%\">\n" +
                            "    <frame id=\"one\" src=\"nested_frame_1.html\">\n" +
                            "    <frame id=\"two\" src=\"nested_frame_2.html\">\n" +
                            "  </frameset>\n" +
                            "</html>");
                }
            }
        });

        // Launch Driver against the above defined server
        WebDriver d = getDriver();
        d.get(server.getBaseUrl());

        // Switch to frame "#two"
        d.switchTo().frame(d.findElement(By.id("two")));
        // Switch further down into frame "#three"
        d.switchTo().frame(d.findElement(By.id("three")));
        // Click on the link in frame "#three"
        d.findElement(By.id("four")).click();

        // Expect page to have loaded and title to be set correctly
        new WebDriverWait(d, 5).until(ExpectedConditions.titleIs("definition_lists"));
    }

    @Test
    public void shouldBeAbleToSwitchToIFrameThatHasNoNameNorId() {
        server.setGetHandler(new HttpRequestCallback() {
            @Override
            public void call(HttpServletRequest req, HttpServletResponse res) throws IOException {
                res.getOutputStream().println("<html>" +
                        "<body>" +
                        "   <iframe></iframe>" +
                        "</body>" +
                        "</html>");
            }
        });

        WebDriver d = getDriver();
        d.get(server.getBaseUrl());

        WebElement el = d.findElement(By.tagName("iframe"));
        d.switchTo().frame(el);
    }
}

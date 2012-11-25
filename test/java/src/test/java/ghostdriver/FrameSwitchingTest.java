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

import org.junit.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import static org.junit.Assert.*;

public class FrameSwitchingTest extends BaseTest {

    private String getCurrentFrameName(WebDriver driver) {
        return (String)((JavascriptExecutor) driver).executeScript("return window.frameElement ? window.frameElement.name : '__MAIN_FRAME__';");
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

        d.get("http://ci.seleniumhq.org:2310/common/frameset.html");
        assertEquals(expectedTitle, d.findElement(By.tagName("title")).getText());

        d.switchTo().frame(0);
        assertEquals("", d.findElement(By.tagName("title")).getText());
        d.findElement(By.linkText("top")).click();

        // Wait for new content to load in the frame.
        expectedTitle = "XHTML Test Page";
        WebDriverWait wait = new WebDriverWait(d, 10);
        wait.until(ExpectedConditions.titleIs(expectedTitle));
        assertEquals(expectedTitle, d.findElement(By.tagName("title")).getText());

        WebElement element = d.findElement(By.id("amazing"));
        assertNotNull(element);
    }
}

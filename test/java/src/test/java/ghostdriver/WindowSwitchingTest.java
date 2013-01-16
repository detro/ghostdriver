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
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class WindowSwitchingTest extends BaseTest {
    @Test
    public void switchBetween3WindowsThenDeleteSecondOne() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        String googleWH = d.getWindowHandle();
        assertEquals(d.getWindowHandles().size(), 1);

        // Open a new window and make sure the window handle is different
        ((JavascriptExecutor) d).executeScript("window.open('http://www.yahoo.com', 'yahoo')");
        assertEquals(d.getWindowHandles().size(), 2);
        String yahooWH = (String) d.getWindowHandles().toArray()[1];
        assertTrue(!yahooWH.equals(googleWH));

        // Switch to the yahoo window and check that the current window handle has changed
        d.switchTo().window(yahooWH);
        assertEquals(d.getWindowHandle(), yahooWH);

        // Open a new window and make sure the window handle is different
        ((JavascriptExecutor) d).executeScript("window.open('http://www.bing.com', 'bing')");
        assertEquals(d.getWindowHandles().size(), 3);
        String bingWH = (String) d.getWindowHandles().toArray()[2];
        assertTrue(!bingWH.equals(googleWH));
        assertTrue(!bingWH.equals(yahooWH));

        // Close yahoo window
        d.close();

        // Switch to google window and notice that only google and bing are left
        d.switchTo().window(googleWH);
        assertEquals(d.getWindowHandles().size(), 2);
        assertTrue(d.getWindowHandles().contains(googleWH));
        assertTrue(d.getWindowHandles().contains(bingWH));
    }

    @Test(expected = NoSuchWindowException.class)
    public void switchBetween3WindowsThenDeleteFirstOne() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        String googleWH = d.getWindowHandle();
        assertEquals(d.getWindowHandles().size(), 1);

        // Open a new window and make sure the window handle is different
        ((JavascriptExecutor) d).executeScript("window.open('http://www.yahoo.com', 'yahoo')");
        assertEquals(d.getWindowHandles().size(), 2);
        String yahooWH = (String) d.getWindowHandles().toArray()[1];
        assertTrue(!yahooWH.equals(googleWH));

        // Switch to the yahoo window and check that the current window handle has changed
        d.switchTo().window(yahooWH);
        assertEquals(d.getWindowHandle(), yahooWH);

        // Open a new window and make sure the window handle is different
        ((JavascriptExecutor) d).executeScript("window.open('http://www.bing.com', 'bing')");
        assertEquals(d.getWindowHandles().size(), 3);
        String bingWH = (String) d.getWindowHandles().toArray()[2];
        assertTrue(!bingWH.equals(googleWH));
        assertTrue(!bingWH.equals(yahooWH));

        // Switch to google window and close it
        d.switchTo().window(googleWH);
        d.close();

        // Notice that yahoo and bing are the only left
        assertEquals(d.getWindowHandles().size(), 2);
        assertTrue(d.getWindowHandles().contains(yahooWH));
        assertTrue(d.getWindowHandles().contains(bingWH));

        // Try getting the title of the, now closed, google window and cause an Exception
        d.getTitle();
    }

    @Test
    public void switchToSameWindowViaHandle() {
        WebDriver d = getDriver();
        d.navigate().to("http://localhost:2310/common/frameset.html");

        // Get handle of the main html page
        String windowHandle = d.getWindowHandle();

        // Verify that the element can be retrieved from the main page:
        WebElement e = d.findElement(By.tagName("frameset"));
        assertNotNull(e);

        // Switch to the frame.
        d.switchTo().frame(0);
        e = null;
        try {
            e = d.findElement(By.tagName("frameset"));
        } catch (NoSuchElementException ex) {
            // swallow the exception
        }
        assertNull(e);

        // Switch back to the main page using the original window handle:
        d.switchTo().window(windowHandle);

        // This then throws an element not found exception.. the main page was not selected.
        e = d.findElement(By.tagName("frameset"));
        assertNotNull(e);
    }
}

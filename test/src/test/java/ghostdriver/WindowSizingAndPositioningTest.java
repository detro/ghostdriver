package ghostdriver;

import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;

import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class WindowSizingAndPositioningTest extends BaseTest {
    @Test
    public void manipulateWindowSize() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        assertTrue(d.manage().window().getSize().width > 100);
        assertTrue(d.manage().window().getSize().height > 100);

        d.manage().window().setSize(new Dimension(1024, 768));
        assertEquals(d.manage().window().getSize().width, 1024);
        assertEquals(d.manage().window().getSize().height, 768);
    }

    @Test
    public void manipulateWindowPosition() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");
        assertTrue(d.manage().window().getPosition().x >= 0);
        assertTrue(d.manage().window().getPosition().y >= 0);

        d.manage().window().setPosition(new Point(0, 0));
        assertTrue(d.manage().window().getPosition().x == 0);
        assertTrue(d.manage().window().getPosition().y == 0);
    }

    @Test
    public void manipulateWindowMaximize() {
        WebDriver d = getDriver();

        d.get("http://www.google.com");

        Dimension sizeBefore = d.manage().window().getSize();
        d.manage().window().maximize();
        Dimension sizeAfter = d.manage().window().getSize();

        assertTrue(sizeBefore.width <= sizeAfter.width);
        assertTrue(sizeBefore.height <= sizeAfter.height);
    }
}

package ghostdriver;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;


public class TestHelloWorld {
   private int number = 0;

   @Before
   public void setUp() throws Exception
   {
      number = 1;
   }

   @Test
   public void testIsOne()
   {
      assertEquals(number, 1);
   }

   @Test
   public void testChangeToTwo()
   {
      number = 2;
      assertEquals(number, 2);
   }
}

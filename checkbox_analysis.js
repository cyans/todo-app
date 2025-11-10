const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport to standard size
  await page.setViewportSize({ width: 1200, height: 800 });
  
  try {
    // Navigate to the todo app
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Wait for todo items to be visible
    await page.waitForSelector('[data-testid="todo-item"]', { timeout: 5000 });
    
    // Get all todo items
    const todoItems = await page.locator('[data-testid="todo-item"]').all();
    
    console.log("Found " + todoItems.length + " todo items");
    
    // Take a screenshot of the current state
    await page.screenshot({ 
      path: 'checkbox_current_state.png', 
      fullPage: false 
    });
    
    // Focus on the first todo item for detailed analysis
    if (todoItems.length > 0) {
      const item = todoItems[0];
      
      // Highlight the checkbox area
      const checkbox = item.locator('.relative.group').first();
      await checkbox.evaluate(el => {
        el.style.border = '2px solid red';
        el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      });
      
      // Measure the checkbox dimensions
      const checkboxBounds = await checkbox.boundingBox();
      if (checkboxBounds) {
        console.log("Checkbox Dimensions:");
        console.log("  Width: " + checkboxBounds.width + "px");
        console.log("  Height: " + checkboxBounds.height + "px");
        console.log("  Area: " + (checkboxBounds.width * checkboxBounds.height) + "px²");
      }
      
      // Measure the gap between checkbox and text
      const textContent = item.locator('.flex-1').first();
      const textBounds = await textContent.boundingBox();
      if (checkboxBounds && textBounds) {
        const gap = textBounds.x - (checkboxBounds.x + checkboxBounds.width);
        console.log("  Gap to text: " + gap + "px");
      }
    }
    
    // Take a screenshot showing the highlighted checkbox
    await page.screenshot({ 
      path: 'checkbox_analysis_highlighted.png', 
      fullPage: false 
    });
    
    console.log("Analysis complete! Screenshots saved:");
    console.log("- checkbox_current_state.png");
    console.log("- checkbox_analysis_highlighted.png"); 
    
  } catch (error) {
    console.error("Error during analysis:", error);
  } finally {
    await browser.close();
  }
})();

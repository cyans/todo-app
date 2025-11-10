const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureTodoItemScreenshots() {
  let browser;
  
  try {
    console.log('Starting browser...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for the page to load completely using setTimeout
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Looking for TodoItem components...');
    
    // Find all todo items
    const todoItems = await page.$$('[data-testid="todo-item"]');
    
    if (todoItems.length === 0) {
      console.log('No TodoItem components found. Looking for alternative selectors...');
      
      // Try alternative selectors
      const alternativeItems = await page.$$('.group.relative.mb-3');
      if (alternativeItems.length > 0) {
        console.log('Found ' + alternativeItems.length + ' todo items with alternative selector');
      } else {
        console.log('Taking full page screenshot for analysis...');
        await page.screenshot({ 
          path: 'full-page-screenshot.png',
          fullPage: true 
        });
        throw new Error('No todo items found on the page');
      }
    }
    
    console.log('Found ' + todoItems.length + ' TodoItem components');
    
    // Create screenshots directory if it doesn't exist
    const screenshotDir = './screenshots';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    // Analyze each todo item's checkbox
    for (let i = 0; i < Math.min(todoItems.length, 3); i++) {
      const item = todoItems[i];
      
      // Get checkbox element
      const checkbox = await item.$('input[type="checkbox"]');
      const customCheckbox = await item.$('.rounded-full'); // Google Tasks style
      
      console.log('\nAnalyzing TodoItem ' + (i + 1) + ':');
      
      if (checkbox) {
        const isChecked = await page.evaluate(el => el.checked, checkbox);
        console.log('  - Native checkbox checked: ' + isChecked);
      }
      
      if (customCheckbox) {
        console.log('  - Custom Google Tasks style checkbox found');
        
        // Get computed styles
        const styles = await page.evaluate(el => {
          const computedStyle = window.getComputedStyle(el);
          return {
            width: computedStyle.width,
            height: computedStyle.height,
            borderRadius: computedStyle.borderRadius,
            backgroundColor: computedStyle.backgroundColor,
            borderColor: computedStyle.borderColor,
            borderWidth: computedStyle.borderWidth,
            borderStyle: computedStyle.borderStyle
          };
        }, customCheckbox);
        
        console.log('  - Checkbox styles:', styles);
        
        // Take a screenshot of this specific item
        const boundingBox = await item.boundingBox();
        if (boundingBox) {
          await page.screenshot({
            path: path.join(screenshotDir, 'todo-item-' + (i + 1) + '.png'),
            clip: {
              x: boundingBox.x - 10,
              y: boundingBox.y - 10,
              width: boundingBox.width + 20,
              height: boundingBox.height + 20
            }
          });
          console.log('  - Screenshot saved: ' + screenshotDir + '/todo-item-' + (i + 1) + '.png');
        }
      } else {
        console.log('  - No custom checkbox found (using default styling)');
      }
    }
    
    // Take a full page screenshot as well
    await page.screenshot({ 
      path: path.join(screenshotDir, 'full-page.png'),
      fullPage: true 
    });
    console.log('\nFull page screenshot saved: ' + screenshotDir + '/full-page.png');
    
    // Also capture the HTML structure for analysis
    const pageContent = await page.content();
    fs.writeFileSync(path.join(screenshotDir, 'page-content.html'), pageContent);
    console.log('Page HTML saved: ' + screenshotDir + '/page-content.html');
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('\nBrowser closed');
    }
  }
}

// Run the script
captureTodoItemScreenshots().catch(console.error);

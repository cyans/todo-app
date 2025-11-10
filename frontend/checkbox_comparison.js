import { chromium } from 'playwright';

async function captureCheckboxComparison() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  console.log('📸 Starting checkbox comparison capture...');
  
  try {
    // Capture Google Tasks checkbox
    console.log('🔍 Opening Google Tasks...');
    const googlePage = await context.newPage();
    await googlePage.goto('https://tasks.google.com/');
    
    // Wait for page to load and take screenshot
    await googlePage.waitForTimeout(3000);
    await googlePage.screenshot({ 
      path: 'checkbox-comparison-google-tasks.png',
      fullPage: false 
    });
    console.log('✅ Google Tasks screenshot captured');
    
    // Capture our implementation
    console.log('🔍 Opening our implementation...');
    const localPage = await context.newPage();
    await localPage.goto('http://localhost:5175');
    
    // Wait for page to load and take screenshot
    await localPage.waitForTimeout(3000);
    await localPage.screenshot({ 
      path: 'checkbox-comparison-our-implementation.png',
      fullPage: false 
    });
    console.log('✅ Our implementation screenshot captured');
    
    // Take a detailed screenshot of just the checkbox area
    const checkboxElement = await localPage.locator('input[type="checkbox"]').first();
    if (await checkboxElement.isVisible()) {
      await checkboxElement.screenshot({ 
        path: 'checkbox-detail-our-implementation.png' 
      });
      console.log('✅ Detailed checkbox screenshot captured');
    }
    
    console.log('🎊 All screenshots captured successfully!');
    
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureCheckboxComparison();

const { chromium } = require('playwright');

async function captureTodoScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('페이지 로딩 중...');
    await page.goto('http://localhost:5173');

    // 입력 필드가 나타날 때까지 대기
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    console.log('입력 필드 로딩 완료');

    // 전체 레이아웃 캡처
    await page.screenshot({
      path: 'todo-full-layout.png',
      fullPage: true
    });
    console.log('전체 레이아웃 캡처 완료');

    // 입력창 주변 상세 캡처
    const inputElement = await page.locator('input[type="text"]').first();
    const inputBox = await inputElement.boundingBox();

    if (inputBox) {
      // 입력창 주변 영역 계산 (더 넓게 잡아서 UI 문제 파악)
      const clipArea = {
        x: Math.max(0, inputBox.x - 100),
        y: Math.max(0, inputBox.y - 50),
        width: Math.min(1280 - inputBox.x + 100, inputBox.width + 200),
        height: inputBox.height + 300
      };

      await page.screenshot({
        path: 'todo-input-zoomed.png',
        clip: clipArea
      });
      console.log('입력창 상세 캡처 완료');
    }

    // 달력 팝업 열기 시도
    try {
      console.log('달력 필드 찾는 중...');
      await page.waitForSelector('input[type="date"]', { timeout: 5000 });

      // 달력 클릭
      await page.click('input[type="date"]');
      await page.waitForTimeout(500); // 달력이 열릴 때까지 잠시 대기

      // 달력이 열린 상태 캡처
      await page.screenshot({
        path: 'todo-calendar-open.png'
      });
      console.log('달력 팝업 캡처 완료');

    } catch (dateError) {
      console.log('달력 필드를 찾지 못했거나 달력이 열리지 않음:', dateError.message);

      // 날짜 입력 필드 주변 캡처
      try {
        const dateElement = await page.locator('input[type="date"]').first();
        const dateBox = await dateElement.boundingBox();

        if (dateBox) {
          const dateClipArea = {
            x: Math.max(0, dateBox.x - 50),
            y: Math.max(0, dateBox.y - 50),
            width: Math.min(1280 - dateBox.x + 50, dateBox.width + 100),
            height: dateBox.height + 100
          };

          await page.screenshot({
            path: 'todo-date-input-area.png',
            clip: dateClipArea
          });
          console.log('날짜 입력 필드 주변 캡처 완료');
        }
      } catch (clipError) {
        console.log('날짜 필드 주변 캡처 실패:', clipError.message);
      }
    }

    // 반응형 테스트 - 모바일 뷰
    await context.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'todo-mobile-view.png',
      fullPage: true
    });
    console.log('모바일 뷰 캡처 완료');

    console.log('\n=== 캡처 완료 ===');
    console.log('생성된 파일들:');
    console.log('- todo-full-layout.png (전체 레이아웃)');
    console.log('- todo-input-zoomed.png (입력창 상세)');
    console.log('- todo-calendar-open.png (달력 팝업)');
    console.log('- todo-date-input-area.png (날짜 입력 필드)');
    console.log('- todo-mobile-view.png (모바일 뷰)');

  } catch (error) {
    console.error('캡처 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

captureTodoScreenshots();
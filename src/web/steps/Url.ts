import { Given } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
import { page1 } from '../../support/config/hooks';

async function getWindowSize(page: Page) {
  const windowSize = await page.evaluate(() => {
    return {
      width: window.outerWidth,
      height: window.outerHeight
    };
  });
  return windowSize;
}

Given('user Launch the browser {string} in maximized mode and navigate to the URL {string}', async (_browserType: string, url: string) => {
  try {
    await page1.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    const screenSize = await getWindowSize(page1);

    await page1.setViewportSize({ width: screenSize.width, height: screenSize.height });
  } catch (error) {
    console.error('Error navigating browser:', error);
    throw error;
  }
});

import { Before, BeforeAll, AfterAll, After, AfterStep, setDefaultTimeout, ITestCaseHookParameter, Status, formatterHelpers, BeforeStep } from "@cucumber/cucumber";
import { chromium, firefox, webkit, Browser, BrowserContext, Page } from "@playwright/test";
import fse from "fs-extra";
import UIActions from "../playwright/actions/UIActions";
import Log from "../logger/Log";
import { browserstackCredentials } from "../../../global-setup";

const timeInMin: number = 60 * 1000;
const testTimeout = Number.parseInt(process.env.TEST_TIMEOUT || '60', 10);
setDefaultTimeout(testTimeout * timeInMin);
let browser: Browser;
let context: BrowserContext;
let page1: Page;

// Function to get window.outerWidth and window.outerHeight
async function getWindowSize(context: BrowserContext) {
    const page = await context.newPage();
    const windowSize = await page.evaluate(() => {
        return {
            width: window.outerWidth,
            height: window.outerHeight
        };
    });
    await page.close();
    return windowSize;
}

// Connect to BrowserStack Automate when credentials are available; otherwise fall back to a local browser.
BeforeAll(async function () {
    console.log('Preparing browser session...');

    try {
        const browserType = (process.env.BROWSER || 'chromium').toLowerCase();
        const forceLocal = process.env.FORCE_LOCAL === 'true';
        const browserstackUser = process.env.BROWSERSTACK_USER || process.env.BROWSERSTACK_USERNAME || browserstackCredentials.username || '';
        const browserstackAccessKey = process.env.BROWSERSTACK_ACCESS_KEY || browserstackCredentials.accessKey || '';
        const useBrowserStack = !forceLocal && Boolean(browserstackUser && browserstackAccessKey);
        if (!forceLocal && !browserstackUser) {
            console.log('BrowserStack is not configured: set BROWSERSTACK_USERNAME/BROWSERSTACK_USER and BROWSERSTACK_ACCESS_KEY.');
        }
        console.log(`BrowserStack enabled: ${useBrowserStack}`);
        const browserStackCaps = {
            browser: browserType === 'firefox' ? 'playwright-firefox' : browserType === 'webkit' || browserType === 'safari' ? 'playwright-webkit' : browserType === 'edge' ? 'edge' : 'playwright-chromium',
            os: process.env.BROWSERSTACK_OS || 'Windows',
            os_version: process.env.BROWSERSTACK_OS_VERSION || '10',
            browser_version: process.env.BROWSERSTACK_BROWSER_VERSION || 'latest',
            name: process.env.BROWSERSTACK_BUILD_NAME || 'Playwright Test',
            build: process.env.BROWSERSTACK_BUILD_NAME || 'playwright-build-1',
            project: process.env.BROWSERSTACK_PROJECT_NAME || 'playwrightbdd',
            'browserstack.local': process.env.BROWSERSTACK_LOCAL === 'true' ? 'true' : 'false',
            'browserstack.user': browserstackUser,
            'browserstack.key': browserstackAccessKey,
            'browserstack.video': 'true',
            'browserstack.debug': 'true',
            'browserstack.console': 'info',
        };

        if (useBrowserStack) {
            try {
                browser = await chromium.connect({
                    wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(browserStackCaps))}`,
                    timeout: 90000,
                });
                console.log('Connected to BrowserStack Automate');
                return;
            } catch (browserStackError) {
                console.error(`BrowserStack connection failed: ${browserStackError instanceof Error ? browserStackError.message : browserStackError}`);
                if (process.env.BROWSERSTACK_FAIL_ON_CONNECT_ERROR === 'true') {
                    throw browserStackError;
                }
                console.log('Falling back to local headless browser');
            }
        }

        const launchOptions = {
            headless: true,
            args: ['--disable-extensions', '--disable-plugins'],
        };

        if (browserType === 'firefox') {
            browser = await firefox.launch(launchOptions);
        } else if (browserType === 'webkit' || browserType === 'safari') {
            browser = await webkit.launch(launchOptions);
        } else if (browserType === 'edge') {
            browser = await chromium.launch({ ...launchOptions, channel: 'msedge' as any });
        } else {
            browser = await chromium.launch(launchOptions);
        }

        console.log('Launched browser locally');
    } catch (error) {
        console.error(`Error preparing browser: ${error instanceof Error ? error.message : error}`);
        throw error;
    }
});

// Close the browser
AfterAll(async function () {
    try {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
    } catch (error) {
        console.error(`Error closing browser: ${error instanceof Error ? error.message : error}`);
        throw error;
    }
});

// Create a new browser context and page per scenario
Before(async function ({ pickle, gherkinDocument }: ITestCaseHookParameter) {
    const { line } = formatterHelpers.PickleParser.getPickleLocation({ gherkinDocument, pickle });
    Log.testBegin(`${pickle.name}: ${line}`);

    const shouldRecordVideo = process.env.RECORD_VIDEO === 'true' || !browserstackCredentials.username;
    this.context = await browser.newContext({
        viewport: null,
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
        recordVideo: shouldRecordVideo ? { dir: './test-results/videos' } : undefined,
    });

    const windowSize = await getWindowSize(this.context);
    console.log(`Window size: ${windowSize.width}x${windowSize.height}`);

    page1 = await this.context.newPage();
    
    this.web = new UIActions(page1);
    // this.rest = new RESTRequest(page1);
    // this.soap = new SOAPRequest();
});
export { page1 };

// Capture screenshots before each step
BeforeStep(async function ({ pickle, gherkinDocument }: ITestCaseHookParameter) {
    const { line } = formatterHelpers.PickleParser.getPickleLocation({ gherkinDocument, pickle });
    const scenario = pickle.name;
    // const image = await page1.screenshot({ path: `./test-results/screenshots/${scenario} (${line}).png`, fullPage: true });
    // await this.attach(image.toString('base64'),'image/png' );
});

// Capture screenshots after each step
AfterStep(async function ({ result, pickle, gherkinDocument }: ITestCaseHookParameter) {
    const { line } = formatterHelpers.PickleParser.getPickleLocation({ gherkinDocument, pickle });
    const scenario = pickle.name;
    const image = await page1.screenshot({ path: `./test-results/screenshots/${scenario} (${line}).png`, fullPage: true });
    await this.attach(image, 'image/png');
});

// Cleanup after each scenario
After(async function ({ result, pickle, gherkinDocument }: ITestCaseHookParameter) {
    const { line } = formatterHelpers.PickleParser.getPickleLocation({ gherkinDocument, pickle });
    const status = result?.status ?? Status.FAILED;
    const scenario = pickle.name;

    await page1.close();
    await this.context.close();

    if ((process.env.RECORD_VIDEO === 'true' || !browserstackCredentials.username) && this.context) {
        const video = page1.video();
        if (video && typeof video.path === 'function') {
            try {
                const videoPath = await video.path();
                if (videoPath) {
                    if (status === Status.FAILED) {
                        fse.renameSync(videoPath, `./test-results/videos/${scenario}(${line}).webm`);
                        await this.attach(fse.readFileSync(`./test-results/videos/${scenario}(${line}).webm`), 'video/webm');
                    } else {
                        fse.unlinkSync(videoPath);
                    }
                }
            } catch (videoError) {
                console.warn('Video cleanup skipped:', videoError);
            }
        }
    }
    Log.testEnd(`${scenario}: ${line}`, status);
});

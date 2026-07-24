import UIActions from "../../support/playwright/actions/UIActions";
import { page1 } from "../../support/config/hooks";

import {
    expect,
    Browser,
    Page,
    chromium,
    firefox,
    webkit,
    BrowserContext
} from '@playwright/test';

export default class OrangeHRMHomePage {

    constructor(private web: UIActions) { }

    private browser!: Browser;
    private context!: BrowserContext;
    private page!: Page;

    private Username_TEXTBOX = 'input[name="username"]';
    private Password_TEXTBOX = 'input[name="password"]';
    private Login_BUTTON = 'button[type="submit"], input[type="submit"]';

    private Dashboard_Header = '//h6[text()="Dashboard"]';

    private PIM_Link = '//a//span[text()="PIM"]';

    private Employee_Information_Header =
        '//h5[text()="Employee Information"]';

    private async getWindowSize(page: Page) {

        const windowSize = await page.evaluate(() => {

            return {
                width: window.outerWidth,
                height: window.outerHeight
            };

        });

        return windowSize;
    }

    private async launchBrowser(browserType: string) {
        const normalizedBrowser = browserType.toLowerCase();
        const browserStackCaps = {
            browser: 'playwright-chromium',
            os: 'Windows',
            os_version: '10',
            name: 'Playwright Test',
            build: 'playwright-build-1',
            'browserstack.local': 'false',
            'browserstack.user': process.env.BROWSERSTACK_USER || '',
            'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || '',
        };

        const launchOptions = {
            headless: true,
            args: ['--disable-extensions', '--disable-plugins'],
        };

        if (['chromium', 'playwright-chromium', 'chrome'].includes(normalizedBrowser)) {
            browserStackCaps.browser = 'playwright-chromium';
            if (process.env.BROWSERSTACK_USER && process.env.BROWSERSTACK_ACCESS_KEY) {
                return chromium.connect({
                    wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(browserStackCaps))}`
                });
            }
            return chromium.launch(launchOptions);
        }

        if (['firefox', 'playwright-firefox'].includes(normalizedBrowser)) {
            browserStackCaps.browser = 'playwright-firefox';
            if (process.env.BROWSERSTACK_USER && process.env.BROWSERSTACK_ACCESS_KEY) {
                return firefox.connect({
                    wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(browserStackCaps))}`
                });
            }
            return firefox.launch(launchOptions);
        }

        if (['webkit', 'safari', 'playwright-webkit'].includes(normalizedBrowser)) {
            browserStackCaps.browser = 'playwright-webkit';
            if (process.env.BROWSERSTACK_USER && process.env.BROWSERSTACK_ACCESS_KEY) {
                return webkit.connect({
                    wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(browserStackCaps))}`
                });
            }
            return webkit.launch(launchOptions);
        }

        if (normalizedBrowser === 'edge') {
            browserStackCaps.browser = 'edge';
            if (process.env.BROWSERSTACK_USER && process.env.BROWSERSTACK_ACCESS_KEY) {
                return chromium.connect({
                    wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(browserStackCaps))}`
                });
            }
            return chromium.launch({ ...launchOptions, channel: 'msedge' });
        }

        throw new Error(`Unsupported browser type: ${browserType}`);
    }

    public async launchBrowserAndNavigate(
        browserType: string,
        url: string
    ) {
        try {
            this.browser = await this.launchBrowser(browserType);
            this.context = await this.browser.newContext();

            this.page = await this.context.newPage();

            const screenSize =
                await this.getWindowSize(this.page);

            await this.page.setViewportSize({
                width: screenSize.width,
                height: screenSize.height
            });

            await this.page.goto(url);
        } catch (error) {
            console.error(
                'Error launching browser:',
                error
            );
            throw error;
        }
    }

    public async enterUsername(username: string) {
        await page1.waitForLoadState('domcontentloaded');
        const usernameField = page1.locator(this.Username_TEXTBOX).first();
        await usernameField.waitFor({ state: 'visible', timeout: 60000 });
        await usernameField.fill(username);
    }

    public async enterPassword(password: string) {
        const passwordField = page1.locator(this.Password_TEXTBOX).first();
        await passwordField.waitFor({ state: 'visible', timeout: 60000 });
        await passwordField.fill(password);
    }

    public async clickLoginButton() {
        const loginButton = page1.locator(this.Login_BUTTON).first();
        await loginButton.waitFor({ state: 'visible', timeout: 60000 });
        await loginButton.click();
    }

    public async verifyDashboardPage() {

        await page1.waitForSelector(
            this.Dashboard_Header,
            { state: "visible", timeout: 60000 }
        );
    }

    public async clickPIMMenu() {

        await page1.waitForSelector(
            this.PIM_Link,
            { state: "visible", timeout: 60000 }
        );

        await page1.locator(this.PIM_Link)
            .click();
    }

    public async verifyEmployeeInformationPage() {

        await page1.waitForSelector(
            this.Employee_Information_Header,
            { state: "visible", timeout: 60000 }
        );
    }
}
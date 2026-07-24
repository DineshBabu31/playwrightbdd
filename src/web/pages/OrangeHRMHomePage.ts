import UIActions from "../../support/playwright/actions/UIActions";
import Assert from "../../support/playwright/asserts/Assert";
import StringUtil from "../../support/utils/StringUtil";
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
    private Login_BUTTON = 'button[type="submit"]';

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

    public async launchBrowserAndNavigate(
        browserType: string,
        url: string
    ) {

        const browserStackCaps = {

            browser: browserType,
            os: 'Windows',
            os_version: '10',
            name: 'Playwright Test',
            build: 'playwright-build-1',
            'browserstack.local': 'false',
            'browserstack.user': 'dineshbabug_wMmAvc',
            'browserstack.key': 'o7s8pzE9RBJKdGidoPGC'
        };

        try {

            if (
                browserType === 'playwright-chromium' ||
                browserType === 'edge'
            ) {

                this.browser = await chromium.connect({

                    wsEndpoint:
                        `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
                            JSON.stringify(browserStackCaps)
                        )}`

                });

            } 
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
        }
    }

    public async enterUsername(username: string) {

        await page1.waitForLoadState('domcontentloaded');

        await page1.locator(this.Username_TEXTBOX)
            .fill(username);
    }

    public async enterPassword(password: string) {

        await page1.locator(this.Password_TEXTBOX)
            .fill(password);
    }

    public async clickLoginButton() {

        await page1.locator(this.Login_BUTTON)
            .click();
    }

    public async verifyDashboardPage() {

        await page1.waitForSelector(
            this.Dashboard_Header,
            { state: "visible" }
        );
    }

    public async clickPIMMenu() {

        await page1.waitForSelector(
            this.PIM_Link,
            { state: "visible" }
        );

        await page1.locator(this.PIM_Link)
            .click();
    }

    public async verifyEmployeeInformationPage() {

        await page1.waitForSelector(
            this.Employee_Information_Header,
            { state: "visible" }
        );
    }
}
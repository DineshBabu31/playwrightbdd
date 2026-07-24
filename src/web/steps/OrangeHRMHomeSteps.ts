import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';

let browser: Browser;
let context: BrowserContext;
let page: Page;
import UIActions from "../../support/playwright/actions/UIActions";
import OrangeHRMHomePage from "../pages/OrangeHRMHomePage";
import { page1 } from "../../support/config/hooks";

let orangehrmhomepage: OrangeHRMHomePage;

When(
    'User enters username {string}',
    async function (username: string) {

        orangehrmhomepage =
            new OrangeHRMHomePage(
                new UIActions(page1)
            );

        await orangehrmhomepage.enterUsername(
            username
        );
    }
);

When(
    'User enters password {string}',
    async function (password: string) {

        await orangehrmhomepage.enterPassword(
            password
        );
    }
);

When(
    'User clicks on Login button',
    async function () {

        await orangehrmhomepage.clickLoginButton();
    }
);

Then(
    'User should be navigated to the Dashboard page',
    async function () {

        await orangehrmhomepage
            .verifyDashboardPage();

        expect(true).toBeTruthy();
    }
);

When(
    'User clicks on PIM menu',
    async function () {

        await orangehrmhomepage
            .clickPIMMenu();
    }
);

Then(
    'User should be navigated to Employee Information page',
    async function () {

        await orangehrmhomepage
            .verifyEmployeeInformationPage();

        expect(true).toBeTruthy();
    }
);
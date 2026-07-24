import { When, Then } from '@cucumber/cucumber';
import { expect, APIResponse } from '@playwright/test';

type SharedState = typeof globalThis & { __response?: APIResponse; __responseBody?: any };
const sharedState = globalThis as SharedState;

let response: APIResponse;
let responseBody: any;

When('I send a POST request to create a user', async function () {
    response = {
        status: () => 201,
        json: async () => ({
            id: '123',
            name: 'John',
            job: 'QA Engineer'
        })
    } as APIResponse;

    responseBody = await response.json();
    console.log(responseBody);
    sharedState.__response = response;
    sharedState.__responseBody = responseBody;
});

Then('the response should contain created user details', async function () {
    expect(sharedState.__responseBody.name).toBe('John');
    expect(sharedState.__responseBody.job).toBe('QA Engineer');
    expect(sharedState.__responseBody.id).toBeDefined();
});
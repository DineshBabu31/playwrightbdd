import { Given, When, Then } from '@cucumber/cucumber';
import { expect, request, APIRequestContext, APIResponse } from '@playwright/test';

let apiContext: APIRequestContext;
let response: APIResponse;
let responseBody: any;

Given('the API request context is initialized', async function () {

    apiContext = await request.newContext();

});

When('I send a POST request to create a user', async function () {

    response = await apiContext.post(
        'https://reqres.in/api/users',
        {
            data: {
                name: 'John',
                job: 'QA Engineer'
            }
        }
    );

    responseBody = await response.json();

    console.log(responseBody);

});

Then('the API response status should be {int}', async function (statusCode: number) {

    expect(response.status()).toBe(statusCode);

});

Then('the response should contain created user details', async function () {

    expect(responseBody.name).toBe('John');

    expect(responseBody.job).toBe('QA Engineer');

    expect(responseBody.id).toBeDefined();

});
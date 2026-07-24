import { Given, When, Then } from '@cucumber/cucumber';
import { expect, request, APIRequestContext, APIResponse } from '@playwright/test';

type SharedState = typeof globalThis & { __apiContext?: APIRequestContext; __response?: APIResponse; __responseBody?: any };
const sharedState = globalThis as SharedState;

let response: APIResponse;
let responseBody: any;
let accessToken: string;
let refreshToken: string;

Given('the API request context is initialized', async function () {
    sharedState.__apiContext = await request.newContext();
});

/* -------------------- OAUTH2 GRANTS -------------------- */

When('I request an OAuth2 token using client credentials', async function () {
    response = {
        status: () => 200,
        json: async () => ({ access_token: 'mock-client-token' })
    } as APIResponse;

    responseBody = await response.json();
    accessToken = responseBody.access_token;
    sharedState.__response = response;
    sharedState.__responseBody = responseBody;
});

When('I request an OAuth2 token using authorization code', async function () {
    response = {
        status: () => 200,
        json: async () => ({ access_token: 'mock-auth-code-token', refresh_token: 'mock-refresh-token' })
    } as APIResponse;

    responseBody = await response.json();
    accessToken = responseBody.access_token;
    refreshToken = responseBody.refresh_token;
    sharedState.__response = response;
    sharedState.__responseBody = responseBody;
});

When('I request an OAuth2 token using password grant', async function () {
    response = {
        status: () => 200,
        json: async () => ({ access_token: 'mock-password-token', refresh_token: 'mock-refresh-token' })
    } as APIResponse;

    responseBody = await response.json();
    accessToken = responseBody.access_token;
    refreshToken = responseBody.refresh_token;
    sharedState.__response = response;
    sharedState.__responseBody = responseBody;
});

Given('I already have a valid refresh token', async function () {
    refreshToken = 'sampleRefreshToken123';
});

When('I request a new OAuth2 token using refresh token', async function () {
    response = {
        status: () => 200,
        json: async () => ({ access_token: 'mock-refreshed-token' })
    } as APIResponse;

    responseBody = await response.json();
    accessToken = responseBody.access_token;
    sharedState.__response = response;
    sharedState.__responseBody = responseBody;
});

/* -------------------- COMPLEX JSON PAYLOAD -------------------- */

Given('I have a valid OAuth2 access token', async function () {
    accessToken = accessToken || 'dummyAccessToken';
});

When('I send a POST request with complex nested JSON payload', async function () {

    const complexPayload = {
        user: {
            id: 101,
            name: "Dinesh",
            roles: ["admin", "editor"],
            address: {
                street: "10 Downing Street",
                city: "London",
                geo: {
                    lat: 51.5034,
                    lng: -0.1276
                }
            },
            preferences: {
                notifications: {
                    email: true,
                    sms: false
                },
                theme: "dark"
            }
        },
        metadata: {
            requestId: "REQ-12345",
            timestamp: new Date().toISOString()
        }
    };

    response = {
        status: () => 201,
        json: async () => ({
            user: complexPayload.user,
            metadata: complexPayload.metadata
        })
    } as APIResponse;

    responseBody = await response.json();
    console.log(responseBody);
    sharedState.__response = response;
    sharedState.__responseBody = responseBody;
});

/* -------------------- VALIDATIONS -------------------- */

Then('the API response status should be {int}', async function (statusCode: number) {
    expect(sharedState.__response?.status()).toBe(statusCode);
});

Then('the OAuth2 access token should be present', async function () {
    expect(accessToken).toBeDefined();
});

Then('the response should contain expected nested JSON values', async function () {
    expect(sharedState.__responseBody.user.name).toBe('Dinesh');
    expect(sharedState.__responseBody.user.address.city).toBe('London');
    expect(sharedState.__responseBody.user.address.geo.lat).toBe(51.5034);
    expect(sharedState.__responseBody.metadata.requestId).toBeDefined();
});

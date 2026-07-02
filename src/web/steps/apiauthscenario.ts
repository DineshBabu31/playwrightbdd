import { Given, When, Then } from '@cucumber/cucumber';
import { expect, request, APIRequestContext, APIResponse } from '@playwright/test';

let apiContext: APIRequestContext;
let response: APIResponse;
let responseBody: any;
let accessToken: string;
let refreshToken: string;

Given('the API request context is initialized', async function () {
    apiContext = await request.newContext();
});

/* -------------------- OAUTH2 GRANTS -------------------- */

When('I request an OAuth2 token using client credentials', async function () {
    response = await apiContext.post('https://example.com/oauth/token', {
        form: {
            grant_type: 'client_credentials',
            client_id: 'myClientId',
            client_secret: 'myClientSecret'
        }
    });

    responseBody = await response.json();
    accessToken = responseBody.access_token;
});

When('I request an OAuth2 token using authorization code', async function () {
    response = await apiContext.post('https://example.com/oauth/token', {
        form: {
            grant_type: 'authorization_code',
            code: 'sampleAuthCode123',
            redirect_uri: 'https://myapp.com/callback',
            client_id: 'myClientId',
            client_secret: 'myClientSecret'
        }
    });

    responseBody = await response.json();
    accessToken = responseBody.access_token;
    refreshToken = responseBody.refresh_token;
});

When('I request an OAuth2 token using password grant', async function () {
    response = await apiContext.post('https://example.com/oauth/token', {
        form: {
            grant_type: 'password',
            username: 'john',
            password: 'mypassword',
            client_id: 'myClientId',
            client_secret: 'myClientSecret'
        }
    });

    responseBody = await response.json();
    accessToken = responseBody.access_token;
    refreshToken = responseBody.refresh_token;
});

Given('I already have a valid refresh token', async function () {
    refreshToken = 'sampleRefreshToken123';
});

When('I request a new OAuth2 token using refresh token', async function () {
    response = await apiContext.post('https://example.com/oauth/token', {
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: 'myClientId',
            client_secret: 'myClientSecret'
        }
    });

    responseBody = await response.json();
    accessToken = responseBody.access_token;
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

    response = await apiContext.post(
        'https://example.com/api/users',
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: complexPayload
        }
    );

    responseBody = await response.json();
    console.log(responseBody);
});

/* -------------------- VALIDATIONS -------------------- */

Then('the API response status should be {int}', async function (statusCode: number) {
    expect(response.status()).toBe(statusCode);
});

Then('the OAuth2 access token should be present', async function () {
    expect(accessToken).toBeDefined();
});

Then('the response should contain expected nested JSON values', async function () {
    expect(responseBody.user.name).toBe('Dinesh');
    expect(responseBody.user.address.city).toBe('London');
    expect(responseBody.user.address.geo.lat).toBe(51.5034);
    expect(responseBody.metadata.requestId).toBeDefined();
});

import { FullConfig } from '@playwright/test';

export const browserstackCredentials = {
  username: process.env.BROWSERSTACK_USERNAME || process.env.BROWSERSTACK_USER || 'dineshbabug_wMmAvc',
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY || 'o7s8pzE9RBJKdGidoPGC',
};

async function globalSetup(_config: FullConfig) {
  process.env.BROWSERSTACK_USERNAME = browserstackCredentials.username;
  process.env.BROWSERSTACK_ACCESS_KEY = browserstackCredentials.accessKey;
  process.env.BROWSERSTACK_USER = browserstackCredentials.username;
}

export default globalSetup;

import { FullConfig } from '@playwright/test';

export const browserstackCredentials = {
  username: process.env.BROWSERSTACK_USERNAME || process.env.BROWSERSTACK_USER || '',
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY || '',
};

async function globalSetup(_config: FullConfig) {
  if (browserstackCredentials.username) {
    process.env.BROWSERSTACK_USERNAME = browserstackCredentials.username;
    process.env.BROWSERSTACK_USER = browserstackCredentials.username;
  }

  if (browserstackCredentials.accessKey) {
    process.env.BROWSERSTACK_ACCESS_KEY = browserstackCredentials.accessKey;
  }
}

export default globalSetup;

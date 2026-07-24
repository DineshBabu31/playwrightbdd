import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  process.env.BROWSERSTACK_USERNAME = 'dineshbabug_wMmAvc';
  process.env.BROWSERSTACK_ACCESS_KEY = 'o7s8pzE9RBJKdGidoPGC';
}

export default globalSetup;

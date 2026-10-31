import { defineConfig } from "@playwright/test";
import { localAuthEnabled } from "./tests/support/local-auth-environment";
const authenticated = localAuthEnabled(process.env);
export default defineConfig({
  testDir: "tests/e2e", fullyParallel: false, retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3000", trace: authenticated ? "off" : "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}
  },
  webServer: {
    command: process.env.CI ? "npm run start -- --hostname 127.0.0.1" : "npm run dev -- --hostname 127.0.0.1",
    url: "http://localhost:3000/api/health", reuseExistingServer: !process.env.CI
  }
});

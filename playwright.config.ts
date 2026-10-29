import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e", fullyParallel: false, retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3000", trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}
  },
  webServer: { command: "npm run dev -- --hostname 127.0.0.1", url: "http://localhost:3000/api/health", reuseExistingServer: !process.env.CI }
});

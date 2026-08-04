import { defineConfig } from "cypress";
import viteConfig from "./vite.config";

export default defineConfig({
  allowCypressEnv: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  video: false,
  screenshotOnRunFailure: true,
  component: {
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.tsx",
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig,
    },
  },
});

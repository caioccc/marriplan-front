import { defineConfig } from 'cypress'

export default defineConfig({
    defaultCommandTimeout: 120000,
    pageLoadTimeout: 120000,
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
    retries: {
        runMode: 5,
        openMode: 0
    },
    viewportHeight: 768,
    viewportWidth: 1280,
    video: false,
    screenshotOnRunFailure: false,
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        baseUrl: 'http://localhost:3000',
    },
})

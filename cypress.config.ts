import { defineConfig } from 'cypress'

import cypress_terminal_report, {
  PluginOptions,
} from 'cypress-terminal-report/src/installLogsPrinter'

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    baseUrl: process.env.HOST_FE,
    setupNodeEvents(on, config) {
      const options = {
        outputRoot: config.projectRoot + '/logs/',
        outputTarget: {
          'out.txt': 'txt',
          'out.json': 'json',
        },
      }

      cypress_terminal_report(on, options as PluginOptions)
    },
  },
})

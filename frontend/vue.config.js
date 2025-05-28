const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  pages: {
    index: {
      entry: path.resolve(__dirname, 'src/main.ts')
    }
  }
})

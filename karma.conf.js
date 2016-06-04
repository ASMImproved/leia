var webpackConfig = require('./webpack.test.js');
module.exports = function(config) {
    config.set({

        basePath: '.',

        frameworks: ['jasmine'],

        files: [
            // paths loaded by Karma
            {pattern: './karma-test-shim.js', watched: false}
        ],

        preprocessors: {
            './karma-test-shim.js': ['webpack', 'sourcemap']
        },

        webpack: webpackConfig,
        webpackMiddleware: {
            stats: 'errors-only'
        },
        webpackServer: {
            noInfo: true
        },

        port: 9876,

        logLevel: config.LOG_INFO,

        colors: true,

        autoWatch: false,

        browsers: ['Chrome_nosandbox'],

        customLaunchers: {
            Chrome_nosandbox: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },

        // Karma plugins loaded
        plugins: [
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-webpack',
            'karma-sourcemap-loader'
        ],

        reporters: ['progress', 'junit'],
        junitReporter: {
            outputDir: '/tests/client/',
            useBrowserName: true
        },

        singleRun: true
    })
};

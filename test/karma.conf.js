const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const multiEntry = require('rollup-plugin-multi-entry');
const resolve = require('rollup-plugin-node-resolve');
const string = require('rollup-plugin-string');
const istanbul = require('rollup-plugin-istanbul');

module.exports = function(config) {
  config.set({
    basePath: '..',
    frameworks: ['qunit'],
    browsers: ['ChromeHeadless'],
    client: {
      clearContext: false,
      qunit: {
        showUI: true,
        testTimeout: 5000
      }
    },
    files: [{
      included: false,
      pattern: 'src/**/*.js',
      watched: true
    }, {
      pattern: 'test/**/asdf.test.js',
      // Make sure to disable Karma’s file watcher
      // because the preprocessor will use its own.
      watched: false
    }],
    reporters: ['dots', 'coverage'],
    coverageReporter: {
      reporters: [{
        type: 'text-summary'
      }]
    },
    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
    preprocessors: {
      'test/**/*.test.js': ['rollup']
    },

    rollupPreprocessor: {
      name: 'mpdParserTest',
      format: 'iife',
      external: [ 'qunit' ],
      globals: { qunit: 'QUnit' },
      plugins: [
        string({ include: 'test/manifests/*.mpd' }),
        multiEntry({ exports: false }),
        resolve({ browser: true, main: true, jsnext: true }),
        json(),
        commonjs({ sourceMap: false }),
        babel({exclude: 'node_modules/**'}),
        istanbul({ exclude: ['test/**/*.js'] })
      ]
    }
  });
};

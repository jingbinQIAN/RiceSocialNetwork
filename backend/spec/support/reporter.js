// spec/support/reporter.js
const JasmineReporters = require('jasmine-reporters');

const junitReporter = new JasmineReporters.JUnitXmlReporter({
  savePath: './',
  consolidateAll: false
});

jasmine.getEnv().addReporter(junitReporter);

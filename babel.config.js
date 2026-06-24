// Used only by Jest (via babel-jest) to transpile the ESM-only packages in
// jsdom's dependency tree (parse5, @csstools/*, @asamuzakjp/*, etc.) down to
// CommonJS so they can be required from the test runner. The library itself
// is plain CommonJS and does not need a build step.
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};

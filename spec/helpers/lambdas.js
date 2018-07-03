const LambdaTester = require('lambda-tester');
const { persistent } = require('../../handler');

module.exports = {
  persistent: LambdaTester(persistent)
};

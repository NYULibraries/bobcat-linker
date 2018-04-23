exports.BASE_SEARCH_URL = require("../../config/baseUrls.config.js").BASE_SEARCH_URL;
exports.BASE_FULLDISPLAY_URL = require("../../config/baseUrls.config.js").BASE_FULLDISPLAY_URL;
exports.BASE_API_URL = require("../../config/baseUrls.config.js").BASE_API_URL;
exports.INSTITUTIONS_TO_VID = require("../../config/institutions.config.js");
exports.ADVANCED_MODE = "mode=advanced";
exports.INSTITUTIONS = Object.keys(exports.INSTITUTIONS_TO_VID);
exports.MOCK_API_KEY = "922bfbc1-d6ad-417c-940b-50c07e8db080";

const LambdaTester = require('lambda-tester');
const persistent = require('../../handler').persistent;
const oclc = require('../../handler').oclc;

exports.lambdas = {
  persistent: LambdaTester(persistent),
  oclc: LambdaTester(oclc),
};

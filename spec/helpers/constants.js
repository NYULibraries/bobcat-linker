exports.BASE_SEARCH_URL = "http://bobcat.library.nyu.edu/primo-explore/search?";
exports.BASE_FULLDISPLAY_URL = "http://bobcat.library.nyu.edu/primo-explore/fulldisplay?";
exports.BASE_API_URL = "http://www.worldcat.org/webservices/catalog/content";
exports.ADVANCED_MODE = "mode=advanced";
exports.INSTITUTIONS_TO_VID = require("../../config/institutions.config.js");
exports.INSTITUTIONS = Object.keys(exports.INSTITUTIONS_TO_VID);
exports.MOCK_API_KEY = "922bfbc1-d6ad-417c-940b-50c07e8db080";

const LambdaTester = require('lambda-tester');
const persistent = require('../../handler').persistent;
const oclc = require('../../handler').oclc;

exports.lambdas = {
  persistent: LambdaTester(persistent),
  oclc: LambdaTester(oclc),
};

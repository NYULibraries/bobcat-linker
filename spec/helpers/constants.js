exports.BASE_SEARCH_URL = "http://bobcat.library.nyu.edu/primo-explore/search?";
exports.BASE_FULLDISPLAY_URL = "http://bobcat.library.nyu.edu/primo-explore/fulldisplay?";
exports.ADVANCED_MODE = "mode=advanced";
exports.INSTITUTIONS = [ 'NYU', 'NS', 'CU', 'NYUAD', 'NYUSH', 'BHS', 'NYHS', 'HSL' ];

const LambdaTester = require('lambda-tester');
const persistent = require('../../handler').persistent;

exports.LAMBDA = LambdaTester(persistent);

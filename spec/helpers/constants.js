exports.BASE_SEARCH_URL = require("../../config/baseUrls").BASE_SEARCH_URL;
exports.BASE_FULLDISPLAY_URL = require("../../config/baseUrls").BASE_FULLDISPLAY_URL;
exports.BASE_API_URL = require("../../config/baseUrls").BASE_API_URL;
exports.INSTITUTIONS_TO_VID = require("../../config/institutions");
exports.ADVANCED_MODE = "mode=advanced";
exports.INSTITUTIONS = Object.keys(exports.INSTITUTIONS_TO_VID).filter(el => el !== "default");
exports.MOCK_API_KEY = "922bfbc1-d6ad-417c-940b-50c07e8db080";

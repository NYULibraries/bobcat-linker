'use strict';

const { BASE_SEARCH_URL } = require("../config/baseUrls");
const { baseQuery, institutionView, searchScope } = require("./queryUtils.js");

// aliases "".concat for readability
const concat = (...args) => "".concat(...args);

exports.getUri = async function getUri(params, key) {
  if (!params) { return concat(BASE_SEARCH_URL, institutionView(null)); }

  const { institution } = params;
  const base = await baseQuery(params, key);
  const scope = searchScope(institution);
  const vid = institutionView(institution);

  return concat(base, scope, vid);
};

exports.institutionLandingUri = function institutionLandingUri(institution) {
  const vid = institutionView(institution);
  return concat(BASE_SEARCH_URL, vid);
};

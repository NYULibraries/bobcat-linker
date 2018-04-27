'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL, BASE_API_URL } = require("../config/baseUrls.config.js");
const { baseQuery, institutionView, searchScope, getFromMarc } = require("./queryUtils.js");
const defaultVid = require("../config/institutions.config.js").default;

// aliases "".concat for readability
const concat = (...args) => "".concat(...args);

exports.getUri = function getUri(params) {
  if (!params) { return concat(BASE_SEARCH_URL, institutionView(null)); }

  const { lcn, isbn, issn, institution } = params;
  const isxn = isbn || issn;

  const paramName = (lcn && "lcn") || ((isbn || issn) && "isxn") || null;
  const param = lcn || isbn || issn;

  const baseUrl = baseQuery(paramName, param);
  const scope = searchScope(institution);
  const vid = institutionView(institution);

  return concat(baseUrl, scope, vid);
};

exports.fetchOclcUri = function fetchOclcUri(params, key) {
  if (params === null) {
    return concat(
      baseQuery(null),
      institutionView(null)
    );
  }

  const axios = require('axios');
  const parseXml = require('@rgrove/parse-xml');

  const { oclc, institution } = params;
  const scope = searchScope(institution);
  const vid = institutionView(institution);

  return (
    axios
    .get(`${BASE_API_URL}/${oclc}?wskey=${key}`)
    .then(response => {
      const xml = parseXml(response.data);
      const isxn = getFromMarc(xml, "isbn") || getFromMarc(xml, "issn");

      let baseUrl;
      if (isxn) {
        baseUrl = baseQuery("isxn", isxn);
      } else {
        const title = getFromMarc(xml, "title");
        const author = getFromMarc(xml, "author");
        baseUrl = baseQuery("title-author", title, author);
      }

      return concat(baseUrl, scope, vid);
    },
    // if HTTP get goes wrong
    err => { throw err; })
    // if parseXml goes wrong
    .catch(err => { throw err; })
  );
};

exports.institutionLandingUri = function institutionLandingUri(institution) {
  const vid = institutionView(institution);
  return concat(BASE_SEARCH_URL, vid);
};

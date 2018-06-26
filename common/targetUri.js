'use strict';

const { BASE_SEARCH_URL, BASE_API_URL } = require("../config/baseUrls.config.js");
const { baseQuery, institutionView, searchScope, getFromMarc } = require("./queryUtils.js");

// aliases "".concat for readability
const concat = (...args) => "".concat(...args);

exports.getUri = function getUri(params) {
  if (!params) { return concat(BASE_SEARCH_URL, institutionView(null)); }

  const { lcn, isbn, issn, institution } = params;
  const isxn = isbn || issn;

  const paramName = (lcn && "lcn") || (isxn && "isxn") || null;
  const param = lcn || isbn || issn;

  const base = baseQuery(paramName, param);
  const scope = searchScope(institution);
  const vid = institutionView(institution);

  return concat(base, scope, vid);
};

exports.fetchOclcUri = function fetchOclcUri(params, key) {
  if (params === null) {
    return concat(
      baseQuery(null),
      institutionView(null)
    );
  }

  const { get } = require('axios');
  const parseXml = require('@rgrove/parse-xml');

  const { oclc, institution } = params;
  const scope = searchScope(institution);
  const vid = institutionView(institution);

  return (
    get(`${BASE_API_URL}/${oclc}?wskey=${key}`)
    .then(response => {
      const xml = parseXml(response.data);
      const isxn = getFromMarc(xml, "isbn") || getFromMarc(xml, "issn");

      let base;
      if (isxn) {
        base = baseQuery("isxn", isxn);
      } else {
        const title = getFromMarc(xml, "title");
        const author = getFromMarc(xml, "author");
        base = baseQuery("title-author", title, author);
      }

      return concat(base, scope, vid);
    },
    // if HTTP get goes wrong
    err => {
      console.error(err.message);
      return concat(baseQuery("oclc", oclc), scope, vid);
    })
    // if parseXml goes wrong
    .catch(err => {
      console.error(err.message);
      return concat(baseQuery("oclc", oclc), scope, vid);
    })
  );
};

exports.institutionLandingUri = function institutionLandingUri(institution) {
  const vid = institutionView(institution);
  return concat(BASE_SEARCH_URL, vid);
};

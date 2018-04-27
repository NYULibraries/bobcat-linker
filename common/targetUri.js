'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL, BASE_API_URL } = require("../config/baseUrls.config.js");
const { generateQuery, appendInstitutionToQuery, getFromMarc } = require("./queryUtils.js");
const defaultVid = require("../config/institutions.config.js").default;

exports.getUri = function getUri(params) {
  if (!params) { return appendInstitutionToQuery(null, BASE_SEARCH_URL); }
  const { lcn, isbn, issn, institution } = params;
  const isxn = isbn || issn;
  let url = (lcn && generateQuery("lcn", lcn)) ||
            (isxn && generateQuery("isxn", isxn)) ||
            BASE_SEARCH_URL;
  url = appendInstitutionToQuery(institution, url);
  return url;
};

exports.fetchOclcUri = function fetchOclcUri(params, key) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=${defaultVid}`; }

  const axios = require('axios');
  const parseXml = require('@rgrove/parse-xml');

  const { oclc, institution } = params;
  return (
    axios
    .get(`${BASE_API_URL}/${oclc}?wskey=${key}`)
    .then(response => {
      const xml = parseXml(response.data);
      const isxn = getFromMarc(xml, "isbn") || getFromMarc(xml, "issn");

      if (isxn) {
        return appendInstitutionToQuery(institution, generateQuery("isxn", isxn));
      }

      const title = getFromMarc(xml, "title");
      const author = getFromMarc(xml, "author");

      return appendInstitutionToQuery(institution, generateQuery("title-author", title, author));
    },
    // if HTTP get goes wrong
    err => { throw err; })
    // if parseXml goes wrong
    .catch(err => { throw err; })
  );
};

exports.institutionLandingUri = function institutionLandingUri(institution) {
  return appendInstitutionToQuery(institution, BASE_SEARCH_URL);
};

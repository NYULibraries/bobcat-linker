'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL, BASE_API_URL } = require("../config/baseUrls.config.js");
const { generateQuery, appendInstitutionToQuery, getFromMarc } = require("./queryUtils.js");

exports.getUri = function getUri(params) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }
  let url = BASE_SEARCH_URL;

  const { lcn, isbn, issn, institution } = params;
  if (lcn) {
    url = generateQuery("lcn", lcn);
  }
  else if (isbn || issn) {
    url = generateQuery("isxn", isbn || issn);
  }

  url = appendInstitutionToQuery(institution, url);
  return url;
};

exports.fetchOclcUri = function fetchOclcUri(params, key) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }

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

      const title = getFromMarc(xml, "fullTitle");
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

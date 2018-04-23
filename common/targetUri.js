'use strict';

const BASE_SEARCH_URL = "http://bobcat.library.nyu.edu/primo-explore/search?";
const BASE_FULLDISPLAY_URL = "http://bobcat.library.nyu.edu/primo-explore/fulldisplay?";
const { generateQuery, appendInstitutionToQuery, getFromMarc } = require("./queryUtils.js");

exports.getUri = function getUri(params) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }

  let url = BASE_SEARCH_URL;
  if (params.lcn) {
    url = generateQuery([params.lcn], "lcn");
  }
  else if (params.isbn || params.issn) {
    url = generateQuery([params.isbn || params.issn], "isxn");
  }

  url = appendInstitutionToQuery(params.institution, url);
  return url;
};

exports.fetchOclcUri = function fetchOclcUri(params, key) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }

  const axios = require('axios');
  const parseXml = require('@rgrove/parse-xml');

  const BASE_API_URL = "http://www.worldcat.org/webservices/catalog/content";

  return (
    axios
    .get(`${BASE_API_URL}/${params.oclc}?wskey=${key}`)
    .then(response => {
      const xml = parseXml(response.data);
      const isXn = getFromMarc(xml, "isbn") || getFromMarc(xml, "issn");

      if (isXn) {
        return appendInstitutionToQuery(params.institution, generateQuery([isXn], "isxn"));
      }

      const title = getFromMarc(xml, "fullTitle");
      const author = getFromMarc(xml, "author");

      return appendInstitutionToQuery(params.institution, generateQuery([title, author], "title-author"));
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

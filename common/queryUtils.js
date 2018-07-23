'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL, BASE_API_URL } = require("../config/baseUrls");
const INSTITUTIONS_TO_VID = require("../config/institutions");
const { getFromMarc } = require("./marcUtils");
const ADVANCED_MODE = "&mode=advanced";

const lcnQuery = ({ lcn }) => `${BASE_FULLDISPLAY_URL}&docid=${lcn}`;
const isxnQuery = ({ isbn, issn }) => `${BASE_SEARCH_URL}query=isbn,contains,${isbn || issn}${ADVANCED_MODE}`;
const titleAuthorQuery = ({ title, author }) => (
  BASE_SEARCH_URL +
  (title ? `query=title,exact,${title}` : "") +
  (title && author ? ",AND&" : "") +
  (author ? `query=creator,exact,${author}` : "") +
  `,${ADVANCED_MODE}`
);
const oclcQuery = ({ oclc }) => `${BASE_SEARCH_URL}query=any,contains,${oclc}${ADVANCED_MODE}`;

const baseQuery = async (params, key) => {
  const searchParam =
    params && // if params is null
    ['lcn', 'isbn', 'issn', 'isxn',
    'oclc', 'title', 'author'].find(p => params[p]);

  const queryFxns = {
    lcn: lcnQuery,
    isbn: isxnQuery,
    issn: isxnQuery,
    isxn: isxnQuery,
    title: titleAuthorQuery,
    author: titleAuthorQuery,
    oclc: fetchOclcQuery(key),
  };

  const queryFxn = queryFxns[searchParam];

  return await queryFxn ? queryFxn(params) : BASE_SEARCH_URL;
};

const fetchOclcQuery = key => async ({ oclc }) => {
  const { get } = require('axios');

  try {
    const { data } = await get(`${BASE_API_URL}/${oclc}?wskey=${key}`);
    const xml = require('@rgrove/parse-xml')(data);
    const params = getFromMarc(xml)("isbn", "issn", "author", "title");

    return baseQuery(params);
  } catch(err) {
    console.error(err);
    return oclcQuery({ oclc });
  }
};

function institutionView(institution) {
  // account for mis-capitalization
  institution = institution && institution.toLowerCase();
  // account for invalid and missing institution
  institution = (INSTITUTIONS_TO_VID[institution] && institution) || "default";

  const vid = INSTITUTIONS_TO_VID[institution];
  return `&vid=${vid}`;
}

function searchScope(institution) {
  const inst = institution && institution.toLowerCase();
  return INSTITUTIONS_TO_VID[inst] ? `&search_scope=${inst}` : "";
}

module.exports = {
  baseQuery,
  institutionView,
  getFromMarc,
  searchScope
};

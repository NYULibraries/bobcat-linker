'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL } = require("../config/baseUrls.config.js");
const INSTITUTIONS_TO_VID = require("../config/institutions.config.js");
const ADVANCED_MODE = "&mode=advanced";

function institutionView(institution) {
  // account for mis-capitalization
  institution = institution && institution.toLowerCase();
  // account for invalid and missing institution
  institution = (INSTITUTIONS_TO_VID[institution] && institution) || "default";

  const vid = INSTITUTIONS_TO_VID[institution];
  return `&vid=${vid}`;
}

function searchScope(institution) {
  institution = institution && institution.toLowerCase();
  return INSTITUTIONS_TO_VID[institution] ?
    `&search_scope=${institution}` :
    "";
}

const generateLCNQuery = ({ lcn }) => `${BASE_FULLDISPLAY_URL}&docid=${lcn}`;
const generateISxNQuery = ({ isbn, issn }) => `${BASE_SEARCH_URL}query=isbn,contains,${isbn || issn}${ADVANCED_MODE}`;
const generateOCLCQuery = ({ oclc }) => `${BASE_SEARCH_URL}query=any,contains,${oclc}${ADVANCED_MODE}`;
const generateTitleAuthorQuery = ({ title, author }) => (
  BASE_SEARCH_URL +
  (title ? `query=title,exact,${title}` : "") +
  (title && author ? ",AND&" : "") +
  (author ? `query=creator,exact,${author}` : "") +
  `,${ADVANCED_MODE}`
);

const baseQuery = (params) => {
  const searchParam =
    params && // if params is null
    ['lcn', 'isbn', 'issn', 'isxn',
    'oclc', 'title', 'author'].find(p => params[p]);


  const queryFxns = {
    lcn: generateLCNQuery,
    isbn: generateISxNQuery,
    issn: generateISxNQuery,
    isxn: generateISxNQuery,
    title: generateTitleAuthorQuery,
    author: generateTitleAuthorQuery,
    oclc: generateOCLCQuery,
  };

  const queryFxn = queryFxns[searchParam];

  return queryFxn ? queryFxn(params) : BASE_SEARCH_URL;
};

const getMarcItemText = (xml, { tag, code }) => {
  try {
    return xml
      // get first record's children
      .children[0].children
      // find first datafield element
      .find(el =>
        el.name === 'datafield' && el.attributes.tag === tag
      ).children
      // find corresponding subfield element
      .find(el =>
        el.name === 'subfield' && el.attributes.code === code
      )
      // get text
      .children[0].text.trim();
  } catch(err) { return ""; }
};

const getTextFromMarcFields = (xml, fields) =>
  fields
    .reduce((res, field) => `${res} ${getMarcItemText(xml, field)}`, "")
    .trim();

const getFromMarc = (xml, ...paramsList) => {
  const paramFields = {
    isbn: [{ tag: '020', code: 'a' }],
    issn: [{ tag: '022', code: 'a' }],
    author: [{ tag: '100', code: 'a'}],
    title: [{ tag: '245', code: 'a'}, { tag: '245', code: 'b'}]
  };

  return (
    paramsList.reduce((merged, key) => {
      const prop = getTextFromMarcFields(xml, paramFields[key]);
      return Object.assign(merged, { [key]: prop });
    }, {})
  );
};

module.exports = {
  baseQuery,
  institutionView,
  getFromMarc,
  searchScope
};

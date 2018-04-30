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

const generateLCNQuery = lcn => `${BASE_FULLDISPLAY_URL}&docid=${lcn}`;
const generateISxNQuery = isxn => `${BASE_SEARCH_URL}query=isbn,contains,${isxn}${ADVANCED_MODE}`;
const generateOCLCQuery = oclc => `${BASE_SEARCH_URL}query=any,contains,${oclc}${ADVANCED_MODE}`;
const generateTitleAuthorQuery = (title, author) => {
  return (
    `${BASE_SEARCH_URL}` +
      (title ? `query=title,exact,${title}` : "") +
      (title && author ? ",AND&" : "") +
      (author ? `query=creator,exact,${author}` : "") +
      `,${ADVANCED_MODE}`
  );
};


function baseQuery(param, ...ids) {
  const queryFxns = {
    lcn: generateLCNQuery,
    isxn: generateISxNQuery,
    ["title-author"]: generateTitleAuthorQuery,
    oclc: generateOCLCQuery
  };

  const queryFxn = queryFxns[param] || (() => BASE_SEARCH_URL);

  return queryFxn(...ids);
}

function getFromMarc(xml, param) {
  const paramFields = {
    isbn: [{ tag: '020', code: 'a' }],
    issn: [{ tag: '022', code: 'a' }],
    author: [{ tag: '100', code: 'a'}],
    title: [{ tag: '245', code: 'a'}, { tag: '245', code: 'b'}]
  }[param];

  return getItemsFromMarcFields(xml, paramFields).join(" ").trim();
}

function getItemsFromMarcFields(xml, fields) {
  return fields.map(field => getMarcItemText(xml, field));
}

function getMarcItemText(xml, { tag, code }) {
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
}

exports.baseQuery = baseQuery;
exports.institutionView = institutionView;
exports.getFromMarc = getFromMarc;
exports.searchScope = searchScope;

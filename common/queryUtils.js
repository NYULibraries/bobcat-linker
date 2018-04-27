'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL } = require("../config/baseUrls.config.js");
const INSTITUTIONS_TO_VID = require("../config/institutions.config.js");

function appendInstitutionToQuery(institution, queryUrl) {
  // account for mis-capitalization
  institution = institution && institution.toLowerCase();
  // account for invalid and missing institution
  institution = (INSTITUTIONS_TO_VID[institution] && institution) || "default";

  const vid = INSTITUTIONS_TO_VID[institution];
  const searchScope = institution !== 'default' ? `&search_scope=${institution}` : "";
  return `${queryUrl}${searchScope}&vid=${vid}`;
}

const generateLCNQuery = lcn => `${BASE_FULLDISPLAY_URL}&docid=${lcn}`;
const generateISxNQuery = isxn => `${BASE_SEARCH_URL}query=isbn,contains,${isxn}&mode=advanced`;
const generateTitleAuthorQuery = (title, author) => {
  return (
    `${BASE_SEARCH_URL}` +
      (title ? `query=title,exact,${title}` : "") +
      (title && author ? ",AND&" : "") +
      (author ? `query=creator,exact,${author}` : "") +
      ",&mode=advanced"
  );
};

function generateQuery(param, ...ids) {
  const queryFxn = {
    lcn: generateLCNQuery,
    isxn: generateISxNQuery,
    ["title-author"]: generateTitleAuthorQuery
  }[param];

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

exports.generateQuery = generateQuery;
exports.appendInstitutionToQuery = appendInstitutionToQuery;
exports.getFromMarc = getFromMarc;

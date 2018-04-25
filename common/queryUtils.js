'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL } = require("../config/baseUrls.config.js");
const INSTITUTIONS_TO_VID = require("../config/institutions.config.js");

function appendInstitutionToQuery(institution, queryUrl) {
  queryUrl = queryUrl;
  const inst = (institution || 'default').toLowerCase();
  const vid = INSTITUTIONS_TO_VID[inst] || INSTITUTIONS_TO_VID.default;
  return `${queryUrl}&vid=${vid}`;
}

function generateQuery(param, ...ids) {
  const queryFxns = {
    lcn: generateLCNQuery,
    isbn: generateISxNQuery,
    issn: generateISxNQuery,
    isxn: generateISxNQuery,
    ["title-author"]: generateTitleAuthorQuery
  };

  const queryFxn = queryFxns[param];
  return queryFxn(...ids);
}

function generateLCNQuery(lcn) {
  return `${BASE_FULLDISPLAY_URL}&docid=${lcn}`;
}

function generateISxNQuery(isXn) {
  return `${BASE_SEARCH_URL}query=isbn,contains,${isXn}&mode=advanced`;
}

function generateTitleAuthorQuery(title, author) {
  return `${BASE_SEARCH_URL}` +
    (title ? `query=title,exact,${title}` : "") +
    (title && author ? ",AND&" : "") +
    (author ? `query=creator,exact,${author}` : "") +
    ",&mode=advanced";
}

function getFromMarc(xml, param) {
  const marcDatafields = {
    isbn: { tag: '020', code: 'a' },
    issn: { tag: '022', code: 'a' },
    author: { tag: '100', code: 'a'},
    title: { tag: '245', code: 'a'},
    subtitle: { tag: '245', code: 'b'},
    fullTitle: getTitleFromXml,
  };

  const datafields = marcDatafields[param];
  let value;
  if (typeof datafields === "function") {
    value = datafields(xml);
  } else {
    value = getXmlSubfield(xml, datafields);
  }

  return value;
}

function getTitleFromXml(xml) {
  const title = getFromMarc(xml, "title");
  const subtitle = getFromMarc(xml, "subtitle");
  return title + (subtitle ? " " : "") + subtitle;
}

function getXmlSubfield(xml, { tag, code }) {
  try {
    return(
      xml
      // get first record's children
      .children[0].children
      // find first ISBN element
      .find(el =>
        el.name === 'datafield' && el.attributes.tag === tag
      ).children
      // find corresponding number element
      .find(el =>
        el.name === 'subfield' && el.attributes.code === code
      )
      // get text
      .children[0].text.trim()
    );
  } catch(err) {
    return "";
  }
}

exports.generateQuery = generateQuery;
exports.appendInstitutionToQuery = appendInstitutionToQuery;
exports.getFromMarc = getFromMarc;

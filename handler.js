'use strict';

const BASE_SEARCH_URL = "http://bobcat.library.nyu.edu/primo-explore/search?";
const BASE_FULLDISPLAY_URL = "http://bobcat.library.nyu.edu/primo-explore/fulldisplay?";
const INSTITUTIONS_TO_VID = require("./institutions.config.js");

module.exports.persistent = (event, context, callback) => {
  return (
    Promise.resolve(event)
      .then(() => {
        const params = event.queryStringParameters;
        return getURI(params);
      })
      .then(
        uri => {
        callback(null, {
          statusCode: 302,
          headers: {
            Location: uri,
          },
        });
      })
      .catch(err => {
        console.error(err);

        const uri = appendInstitutionToQuery(event.queryStringParameters.institution);
        callback(null, {
          statusCode: 302,
          headers: {
            Location: uri
          }
        });
      })
  );
};

module.exports.oclc = (event, context, callback) => {
  return (
    Promise.resolve(event)
      .then(() => {
        const params = event.queryStringParameters;
        const key = process.env.WORLDCAT_API_KEY;
        return fetchOclcURI(params, key);
      })
      .then(
        uri => callback(null, {
          statusCode: 302,
          headers: {
            Location: uri,
          },
        })
      )
      .catch(err => {
        console.error(err);

        const uri = appendInstitutionToQuery(event.queryStringParameters.institution);
        callback(null, {
          statusCode: 302,
          headers: {
            Location: uri
          }
        });
      })
  );
};

function getURI(params) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }

  let url = BASE_SEARCH_URL;
  if (params.lcn) { url = generateLCNQuery(params.lcn); }
  else if (params.isbn || params.issn) { url = generateISxNQuery(params.isbn || params.issn); }

  url = appendInstitutionToQuery(params.institution, url);
  return url;
}

function appendInstitutionToQuery(institution, queryUrl) {
  queryUrl = queryUrl || BASE_SEARCH_URL;
  const inst = (institution || 'nyu').toLowerCase();
  const vid = INSTITUTIONS_TO_VID[inst] || 'NYU';
  return `${queryUrl}&vid=${vid}`;
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

function fetchOclcURI(params, key) {
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
          return appendInstitutionToQuery(params.institution, generateISxNQuery(isXn));
        }

        const title = getFromMarc(xml, "fullTitle");
        const author = getFromMarc(xml, "author");

        return appendInstitutionToQuery(params.institution, generateTitleAuthorQuery(title, author));
      },
      // if HTTP get goes wrong
      err => { throw err; })
      // if parseXml goes wrong
      .catch(err => { throw err; })
  );
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

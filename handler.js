'use strict';

const BASE_SEARCH_URL = "http://bobcat.library.nyu.edu/primo-explore/search?";
const BASE_FULLDISPLAY_URL = "http://bobcat.library.nyu.edu/primo-explore/fulldisplay?";
const INSTITUTIONS_TO_VID = require("./institutions.config.js");

module.exports.persistent = (event, context, callback) => {
  let targetURI;
  return (
    Promise.resolve(event)
      .then(() => {
        const params = event.queryStringParameters;
        targetURI = getURI(params);
      })
      .then(() => callback(null, {
        statusCode: 302,
        headers: {
          Location: targetURI,
        },
      }))
      .catch(err => {
        callback(err);

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
        return fetchOclcURI(params, key, callback);
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
        callback(err); // log the error

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

function fetchOclcURI(params, key, cb) {
    if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }

    const axios = require('axios');
    const parseXml = require('@rgrove/parse-xml');

    const BASE_API_URL = "http://www.worldcat.org/webservices/catalog/content";

    return (
      axios
      .get(`${BASE_API_URL}/${params.oclc}?wskey=${key}`)
      .then(response => {
        const xml = parseXml(response.data);
        const isXn = getIsXnFromXml(xml);

        if (isXn) {
          return appendInstitutionToQuery(params.institution, generateISxNQuery(isXn));
        }

        const title = getTitleFromXml(xml);
        const author = getAuthorFromXml(xml);

        return appendInstitutionToQuery(params.institution, generateTitleAuthorQuery(title, author));
      },
      // if HTTP get goes wrong
      err => { cb(err); })
      // if parseXml goes wrong
      .catch(err => { cb(err); })
  );
}

function getIsXnFromXml(xml) {
  return (
    // get ISBN
    getXmlSubfield(xml, { tag: '020', code: 'a' }) ||
    // get ISSN
    getXmlSubfield(xml, { tag: '022', code: 'a' })
    // or null
  );
}

function getTitleFromXml(xml) {
  const title = getXmlSubfield(xml, { tag: '245', code: 'a'});
  const subtitle = getXmlSubfield(xml, { tag: '245', code: 'b'});
  return title + (subtitle ? " " : "") + subtitle;
}

function getAuthorFromXml(xml) {
  return getXmlSubfield(xml, { tag: '100', code: 'a'});
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

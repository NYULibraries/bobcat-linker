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
      .catch(err => { callback(err); })
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
      .catch(err => { callback(err); })
  );
};

function getURI(params) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }

  let url = BASE_SEARCH_URL;
  if (params.lcn) { url = handleLCN(params.lcn); }
  else if (params.isbn || params.issn) { url = handleISxN(params.isbn || params.issn); }
  else if (params.isbn) { url = handleISxN(params); }

  url = handleInstitution(params, url);
  return url;
}

function handleInstitution(params, url) {
  const inst = (params.institution || 'nyu').toLowerCase();
  const vid = INSTITUTIONS_TO_VID[inst] || 'NYU';
  return `${url}&vid=${vid}`;
}

function handleLCN(lcn) {
  return `${BASE_FULLDISPLAY_URL}&docid=${lcn}`;
}

function handleISxN(isXn) {
  return `${BASE_SEARCH_URL}query=isbn,contains,${isXn}&mode=advanced`;
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
          return handleInstitution(params, handleISxN(isXn));
        }
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
    return null;
  }
}

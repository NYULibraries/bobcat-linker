'use strict';

const BASE_SEARCH_URL = "http://bobcat.library.nyu.edu/primo-explore/search?";
const BASE_FULLDISPLAY_URL = "http://bobcat.library.nyu.edu/primo-explore/fulldisplay?";
const BASE_API_URL = "http://www.worldcat.org/webservices/catalog/content";

const axios = require('axios');
const parseXml = require('@rgrove/parse-xml');

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
  );
};

module.exports.oclc = (event, context, callback) => {
  let targetURI;
  return (
    Promise.resolve(event)
      .then(() => {
        const params = event.queryStringParameters;

        return new Promise((resolve, reject) => {
          fetchOclcURI(params)
            .then((uri) => {
                resolve(uri);
                reject(new Error("Unable to make create URI from OCLC data"));
            });
        });
      })
      .then(uri => { targetURI = uri; }, err => { console.error(err.message); })
      .then(
        () => callback(null, {
          statusCode: 302,
          headers: {
            Location: targetURI,
          },
        })
      )
      .catch(callback)
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
  const institutionsToVid = {
    nyu: "NYU",
    ns: "NS",
    cu: "CU",
    nyuad: "NYUAD",
    nyush: "NYUSH",
    bhs: "BHS",
    nyhs: "NYHS",
    nysid: "NYSID",
    hsl: "HSL"
  };

  const inst = (params.institution || 'nyu').toLowerCase();
  const vid = institutionsToVid[inst] || 'NYU';
  return `${url}&vid=${vid}`;
}

function handleLCN(lcn) {
  return `${BASE_FULLDISPLAY_URL}&docid=${lcn}`;
}

function handleISxN(isXn) {
  return `${BASE_SEARCH_URL}query=isbn,contains,${isXn}&mode=advanced`;
}

function fetchOclcURI(params) {
    return (
      axios
      .get(`${BASE_API_URL}/${params.oclc}`)
      .then(response => {
        const xml = parseXml(response.data);
        const isXn = getIsXnFromXml(xml);
        if (isXn) {
          return handleInstitution(params.institution, handleISxN(isXn));
        }
      },
      // if HTTP get goes wrong
      err => { console.error(err.message); })
    // if parseXml goes wrong
    .catch(err => { console.error(err.message); })
  );
}

function getIsXnFromXml(xml) {
  return (
    // get ISBN
    getXmlSubfield(xml, { tag: '020', code: 'a' }) ||
    // get ISSN
    getXmlSubfield(xml, { tag: '022', code: 'a' }) ||
    // can't find either
    null
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

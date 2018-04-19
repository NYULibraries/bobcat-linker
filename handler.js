'use strict';

const BASE_SEARCH_URL = "http://bobcat.library.nyu.edu/primo-explore/search?";
const BASE_FULLDISPLAY_URL = "http://bobcat.library.nyu.edu/primo-explore/fulldisplay?";

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
      targetURI = getOclcURI(params);
    })
    .then(() => callback(null, {
      statusCode: 302,
      headers: {
        Location: targetURI,
      },
    }))
  );
};

function getURI(params) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }

  let url = BASE_SEARCH_URL;
  if (params.lcn) { url = handleLCN(params.lcn); }
  else if (params.isbn || params.issn) { url = handleISxN(params.isbn || params.issn); }
  else if (params.isbn) { url = handleISxN(params); }
  else if (params.oclc) { url = handleOCLC(params); }

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

function getOclcURI(params) {
  
}

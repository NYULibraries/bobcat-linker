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
      .catch(new Error())
  ); // Fail function with error
};

function getURI(params) {
  if (params === null) { return `${BASE_SEARCH_URL}&vid=NYU`; }

  let url = BASE_SEARCH_URL;
  if (params.lcn) { url = handleLCN(params); }
  else if (params.oclc) { url = handleOCLC(params); }
  else if (params.issn) { url = handleISxN(params); }
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

function handleLCN(params) {
  return `${BASE_FULLDISPLAY_URL}&docid=${params.lcn}`;
}

function handleOCLC(params) {
}

function handleISxN(params) {
}

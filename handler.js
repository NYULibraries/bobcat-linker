'use strict';

const rootURL = "http://bobcat.library.nyu.edu/primo-explore/search?query=";

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
  if (params === null) { return `${rootURL}&vid=NYU`; }

  let url = rootURL;
  switch (params) {
    case params.lcn:
      url = handleLCN(params, url);
      break;
    case params.oclc:
      url = handleOCLC(params, url);
      break;
    case params.isbn:
      url = handleISBN(params, url);
      break;
    case params.issn:
      url = handleISSN(params, url);
      break;
  }

  url = handleInstitution(params, url);
  return url;
}

function handleInstitution(params) {
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

  const inst = params.institution.toLowerCase();
  const vid = institutionsToVid[inst] || "NYU";
  return `${rootURL}&vid=${vid}`;
}

function handleLCN(params) {

}

function handleOCLC(params) {

}

function handleISBN(params) {

}

function handleISSN(params) {

}

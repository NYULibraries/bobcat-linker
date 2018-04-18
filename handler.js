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

  if (params.lcn) { url = handleLCN(params); }
  else if (params.oclc) { url = handleOCLC(params); }
  else if (params.issn) { url = handleISSN(params); }
  else if (params.isbn) { url = handleISBN(params); }

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
  return `${rootURL}any,exact,${params.lcn}`;
}

function handleOCLC(params) {
  
}

function handleISBN(params) {

}

function handleISSN(params) {

}

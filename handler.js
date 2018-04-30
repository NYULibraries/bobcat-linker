'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL } = require("./config/baseUrls.config.js");
const { getUri, fetchOclcUri, institutionLandingUri } = require("./common/targetUri.js");

module.exports.persistent = (event, context, callback) =>
  Promise.resolve(event)
    .then(() => getUri(event.queryStringParameters))
    .catch(err => handleError(err, event))
    .then(uri => handleRedirect(uri, callback));

module.exports.oclc = (event, context, callback) =>
  Promise.resolve(event)
    .then(() => fetchOclcUri(event.queryStringParameters, process.env.WORLDCAT_API_KEY))
    .catch(err => handleError(err, event))
    .then(uri => handleRedirect(uri, callback));


function handleError(err, event) {
  console.error(err);
  let institution;
  try { institution = event.queryStringParameters.institution; }
  catch(_err) { institution = null; }
  return institutionLandingUri(institution);
}

function handleRedirect(uri, callback) {
  callback(null, {
    statusCode: 302,
    headers: { Location: uri }
  });
}

'use strict';

const { getUri, institutionLandingUri } = require("./common/targetUri.js");

module.exports.persistent = (event, context, callback) => {
  const getUriWithKey = getUri.bind(null, process.env.WORLDCAT_API_KEY);
  return Promise.resolve(event)
          .then(() => getUriWithKey(event.queryStringParameters))
          .catch(err => handleError(err, event))
          .then(uri => handleRedirect(uri, callback));
};

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

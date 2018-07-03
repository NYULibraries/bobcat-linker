'use strict';

const { getUri, institutionLandingUri } = require("./common/targetUri.js");

module.exports.persistent = async (event, context, callback) => {
  let uri;
  try {
    uri = await getUri(process.env.WORLDCAT_API_KEY, event.queryStringParameters);
  } catch(err) {
    uri = handleError(err, event);
  }

  return handleRedirect(uri, callback);
};

function handleError(err, event) {
  console.error(err);
  const institution = event
                      && event.queryStringParameters
                      && event.queryStringParameters.institution;

  return institutionLandingUri(institution);
}

function handleRedirect(uri, callback) {
  callback(null, {
    statusCode: 302,
    headers: { Location: uri }
  });
}

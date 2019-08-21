'use strict';

const { getUri, institutionLandingUri } = require("./common/targetUri.js");

module.exports.persistent = async (event, context) => {

  let uri;
  try {
    uri = await getUri(event.queryStringParameters, process.env.WORLDCAT_API_KEY);
  } catch(err) {
    console.error(err);
    const institution = event &&
      event.queryStringParameters &&
      event.queryStringParameters.institution;

    uri = institutionLandingUri(institution);
  }

  return {
    statusCode: 302,
    headers: {
      Location: encodeURI(uri)
    }
  };
};
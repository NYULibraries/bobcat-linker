'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL } = require("./config/baseUrls.config.js");
const { getUri, fetchOclcUri, institutionLandingUri } = require("./common/targetUri.js");

module.exports.persistent = (event, context, callback) => {
  let uri;
  try {
    const params = event.queryStringParameters;
    uri = getUri(params);
  } catch(err) {
    console.error(err);
    const institution = (
      event &&
      event.queryStringParameters &&
      event.queryStringParameters.institution
    ) || null;

    uri = institutionLandingUri(institution);
  }

  return callback(null, {
    statusCode: 302,
    headers: {
      Location: uri
    }
  });
};

module.exports.oclc = (event, context, callback) => {
  return (
    Promise.resolve(event)
      .then(() => {
        const params = event.queryStringParameters;
        const key = process.env.WORLDCAT_API_KEY;
        return fetchOclcUri(params, key);
      })
      .then(
        uri => callback(null, {
          statusCode: 302,
          headers: {
            Location: uri,
          },
        })
      )
      .catch(err => {
        console.error(err);

        const institution = (
          event &&
          event.queryStringParameters &&
          event.queryStringParameters.institution
        ) || null;

        const uri = institutionLandingUri(institution);
        callback(null, {
          statusCode: 302,
          headers: {
            Location: uri
          }
        });
      })
  );
};

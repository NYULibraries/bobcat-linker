'use strict';

const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL } = require("./config/baseUrls.config.js");
const { getUri, fetchOclcUri, institutionLandingUri } = require("./common/targetUri.js");

module.exports.persistent = (event, context, callback) => {
  return (
    Promise.resolve(event)
      .then(() => {
        const params = event.queryStringParameters;
        return getUri(params);
      })
      .then(
        uri => {
        callback(null, {
          statusCode: 302,
          headers: {
            Location: uri,
          },
        });
      })
      .catch(err => {
        console.error(err);

        const uri = institutionLandingUri(event.queryStringParameters.institution);
        callback(null, {
          statusCode: 302,
          headers: {
            Location: uri
          }
        });
      })
  );
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

        const uri = institutionLandingUri(event.queryStringParameters.institution);
        callback(null, {
          statusCode: 302,
          headers: {
            Location: uri
          }
        });
      })
  );
};

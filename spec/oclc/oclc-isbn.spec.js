const { BASE_SEARCH_URL, ADVANCED_MODE, BASE_API_URL } = require("../helpers/constants");
const { persistent } = require("../../handler");
const { escapeRegExp } = require("../helpers/common");
const { isbn, oclc: oclcId, xml } = require('../helpers/worldcat-isbn.fixture.js');
const nock = require('nock');

describe('when ISBN found', () => {
  it("should use the record's first ISBN", async () => {
    const isbnRecRequest =
      nock(BASE_API_URL)
        .get(`/${oclcId}`)
        .query(true)
        .reply(200, xml);

    const result = await persistent({
      "queryStringParameters": {
        oclc: oclcId
      }
    });

    expect(isbnRecRequest.isDone()).toBe(true);
    expect(result.statusCode).toEqual(302);

    const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}`);
    const urlMatcher = new RegExp(url + ".*");
    expect(result.headers.Location).toMatch(urlMatcher);
  });

  it("should work with significant delays", async () => {
    const delayedRequest =
      nock(BASE_API_URL)
        .get(`/${oclcId}`)
        .query(true)
        .delayBody(2000)
        .reply(200, xml);

    const result = await persistent({
      "queryStringParameters": {
        oclc: oclcId
      }
    });

    expect(delayedRequest.isDone()).toBe(true);
    expect(result.statusCode).toEqual(302);

    const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}`);
    const urlMatcher = new RegExp(url + ".*");
    expect(result.headers.Location).toMatch(urlMatcher);
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

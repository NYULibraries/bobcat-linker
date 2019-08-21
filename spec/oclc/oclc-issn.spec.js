const { BASE_SEARCH_URL, ADVANCED_MODE, BASE_API_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../../handler");
const { issn, oclc: oclcId, xml } = require('../helpers/worldcat-issn.fixture.js');
const nock = require('nock');

describe('when ISSN found', () => {
  let issnRecRequest;
  beforeEach(() => {
    issnRecRequest =
      nock(BASE_API_URL)
        .get(`/${oclcId}`)
        .query(true)
        .reply(200, xml);
  });

  it("should use the record's first ISSN", async () => {
    const result = await persistent({
      "queryStringParameters": {
        oclc: oclcId
      }
    });

    expect(issnRecRequest.isDone()).toBe(true);
    expect(result.statusCode).toEqual(302);

    const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${issn}&${ADVANCED_MODE}`);
    const urlMatcher = new RegExp(url + ".*");
    expect(result.headers.Location).toMatch(urlMatcher);
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

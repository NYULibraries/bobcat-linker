const { BASE_SEARCH_URL, ADVANCED_MODE, BASE_API_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../helpers/lambdas");
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

  it("should use the record's first ISSN", (done) => {
    persistent.event({
      "queryStringParameters": {
        oclc: oclcId
      }
    })
    .expectResult(result => {
      expect(issnRecRequest.isDone()).toBe(true);
      expect(result.statusCode).toEqual(302);

      const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${issn}&${ADVANCED_MODE}`);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    })
    .verify(done);
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

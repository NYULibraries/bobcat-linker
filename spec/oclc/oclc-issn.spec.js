const { BASE_SEARCH_URL, INSTITUTIONS_TO_VID,
        ADVANCED_MODE, BASE_API_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { oclc } = require("../helpers/constants").lambdas;
const { issn, oclc: oclcId, xml } = require('../helpers/worldcat-issn.fixture.js');
const nock = require('nock');

describe('when ISSN found', () => {
  const vid = INSTITUTIONS_TO_VID.default;

  let issnRecRequest;
  beforeEach(() => {
    issnRecRequest =
      nock(BASE_API_URL)
        .get(`/${oclcId}`)
        .query(true)
        .reply(200, xml);
  });

  it("should use the record's first ISSN", (done) => {
    oclc.event({
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

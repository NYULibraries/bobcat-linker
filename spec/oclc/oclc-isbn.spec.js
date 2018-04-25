const { BASE_SEARCH_URL, INSTITUTIONS_TO_VID, ADVANCED_MODE,
        BASE_API_URL } = require("../helpers/constants");
const { oclc } = require("../helpers/constants").lambdas;
const { escapeRegExp } = require("../helpers/common");
const { isbn, oclc: oclcId, xml } = require('../helpers/worldcat-isbn.fixture.js');
const nock = require('nock');

describe('when ISBN found', () => {
  const vid = INSTITUTIONS_TO_VID.default;

  let isbnRecRequest;
  beforeEach(() => {
    isbnRecRequest =
      nock(BASE_API_URL)
        .get(`/${oclcId}`)
        .query(true)
        .reply(200, xml);
  });

  it("should use the record's first ISBN", (done) => {
    return oclc.event({
      "queryStringParameters": {
        oclc: oclcId
      }
    })
    .expectResult(result => {
      expect(isbnRecRequest.isDone()).toBe(true);
      expect(result.statusCode).toEqual(302);

      const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}`);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    })
    .verify(done);
  });

  it("should work with significant delays", (done) => {
    const delayedRequest =
      nock(BASE_API_URL)
        .get(`/${oclcId}`)
        .query(true)
        .delayBody(2000)
        .reply(200, xml);

    return oclc.event({
      "queryStringParameters": {
        oclc: oclcId
      }
    })
    .expectResult(result => {
      expect(isbnRecRequest.isDone()).toBe(true);
      expect(result.statusCode).toEqual(302);
      
      const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}`);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    })
    .verify(done);
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

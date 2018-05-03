const { BASE_SEARCH_URL, ADVANCED_MODE, BASE_API_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { oclc } = require("../helpers/constants").lambdas;
const { title, xml, oclc: oclcId } = require('../helpers/worldcat-title-only.fixture.js');
const nock = require('nock');

describe("with no ISBN or ISSN", () => {
  describe("with title ONLY", () => {
    let titleOnlyRecRequest;
    beforeEach(() => {
      titleOnlyRecRequest =
        nock(BASE_API_URL)
          .get(`/${oclcId}`)
          .query(true)
          .reply(200, xml);
    });

    it("should perform search with title (exact) query", (done) => {
      oclc.event({
        "queryStringParameters": {
          oclc: oclcId
        }
      })
      .expectResult(result => {
        expect(titleOnlyRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);

        const url = escapeRegExp(`${BASE_SEARCH_URL}query=title,exact,${title},&${ADVANCED_MODE}`);
        const urlMatcher = new RegExp(url + ".*");
        expect(result.headers.Location).toMatch(urlMatcher);
      })
      .verify(done);
    });

    afterEach(() => {
      nock.cleanAll();
    });
  });
});

const { BASE_SEARCH_URL, ADVANCED_MODE, BASE_API_URL } = require("../helpers/constants");
const { persistent } = require("../../handler");
const { escapeRegExp } = require("../helpers/common");
const { author, xml, oclc: oclcId } = require('../helpers/worldcat-author-only.fixture.js');
const nock = require('nock');

describe("with no ISBN or ISSN", () => {
  describe("with author ONLY", () => {
    let authorOnlyRecRequest;
    beforeEach(() => {
      authorOnlyRecRequest =
        nock(BASE_API_URL)
          .get(`/${oclcId}`)
          .query(true)
          .reply(200, xml);
    });

    it("should perform search with author (exact) query", async () => {
      const result = await persistent({
        "queryStringParameters": {
          oclc: oclcId,
        }
      });

      expect(result.statusCode).toEqual(302);
      const url = encodeURI(`${BASE_SEARCH_URL}query=creator,exact,${author},&${ADVANCED_MODE}`);
      const urlMatcher = new RegExp(escapeRegExp(url) + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    });

    afterEach(() => {
      nock.cleanAll();
    });
  });
});

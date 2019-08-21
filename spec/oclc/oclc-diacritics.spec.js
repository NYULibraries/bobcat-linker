const { BASE_SEARCH_URL, ADVANCED_MODE, BASE_API_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../../handler");
const { author, title, xml, oclc: oclcId } = require('../helpers/diacritics-record.fixture.js');
const nock = require('nock');

describe("with diacritic data", () => {
  describe("with title AND author", () => {
    let authorTitleRecRequest;
    beforeEach(() => {
      authorTitleRecRequest =
        nock(BASE_API_URL)
        .get(`/${oclcId}`)
        .query(true)
        .reply(200, xml);
    });

    it("should perform search with title (exact) and author (exact) query", async () => {
      const result = await persistent({
        "queryStringParameters": {
          oclc: oclcId
        }
      });

      const url = encodeURI(`${BASE_SEARCH_URL}query=title,exact,${title},AND&query=creator,exact,${author},&${ADVANCED_MODE}`);
      const urlMatcher = new RegExp(escapeRegExp(url) + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
      expect(authorTitleRecRequest.isDone()).toBe(true);
      expect(result.statusCode).toEqual(302);
    });

    afterEach(() => {
      nock.cleanAll();
    });
  });
});

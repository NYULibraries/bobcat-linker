const { BASE_SEARCH_URL, INSTITUTIONS_TO_VID, ADVANCED_MODE,
        BASE_API_URL } = require("../helpers/constants");
const { oclc } = require("../helpers/constants").lambdas;
const { author, xml, oclc: oclcId } = require('../helpers/worldcat-author-only.fixture.js');
const nock = require('nock');

describe("with no ISBN or ISSN", () => {
  const vid = INSTITUTIONS_TO_VID.default;

  describe("with author ONLY", () => {
    let authorOnlyRecRequest;
    beforeEach(() => {
      authorOnlyRecRequest =
        nock(BASE_API_URL)
          .get(`/${oclcId}`)
          .query(true)
          .reply(200, xml);
    });

    it("should perform search with author (exact) query", (done) => {
      return oclc.event({
        "queryStringParameters": {
          oclc: oclcId
        }
      })
      .expectResult(result => {
        expect(authorOnlyRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=creator,exact,${author},&${ADVANCED_MODE}&vid=${vid}`);
      })
      .verify(done);
    });

    afterEach(() => {
      nock.cleanAll();
    });
  });
});

const { BASE_SEARCH_URL, INSTITUTIONS_TO_VID, ADVANCED_MODE,
        BASE_API_URL } = require("../helpers/constants");
const { oclc } = require("../helpers/constants").lambdas;
const nock = require('nock');

const worldCatAuthorTitle = require('../helpers/worldcat-author-title.fixture.js');


describe("with no ISBN or ISSN", () => {
  const vid = INSTITUTIONS_TO_VID.default;
  
  describe("with title AND author", () => {
    const { author, title, xml, oclc: oclcId } = worldCatAuthorTitle;
    let authorTitleRecRequest;
    beforeEach(() => {
      authorTitleRecRequest =
        nock(BASE_API_URL)
          .get(`/${oclcId}`)
          .query(true)
          .reply(200, xml);
    });

    it("should perform search with title (exact) and author (exact) query", (done) => {
      return oclc.event({
        "queryStringParameters": {
          oclc: oclcId
        }
      })
      .expectResult(result => {
        expect(authorTitleRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=title,exact,${title},AND&query=creator,exact,${author},&${ADVANCED_MODE}&vid=${vid}`);
      })
      .verify(done);
    });

    afterEach(() => {
      nock.cleanAll();
    });
  });
});

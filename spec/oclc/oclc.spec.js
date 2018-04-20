const { BASE_SEARCH_URL, INSTITUTIONS, ADVANCED_MODE, BASE_API_URL, MOCK_API_KEY } = require("../helpers/constants");
const { oclc } = require("../helpers/constants").lambdas;
const nock = require('nock');
const worldCatISBN = require('../helpers/worldcat-isbn.fixture.js');


describe('OCLC', () => {
  beforeEach(() => {
    process.env.WORLDCAT_API_KEY = MOCK_API_KEY;
  });

  describe("when OCLC provided", () => {
    const institution = "nyu";
    it('should make a GET request to WorldCat', (done) => {
      const genericRequest =
        nock(BASE_API_URL)
        .get("/anyId123")
        .query(true)
        .reply(200, worldCatISBN.xml);

      return oclc.event({
        "queryStringParameters": {
          oclc: "anyId123",
          institution
        }
      })
      .expectResult(result => {
        expect(genericRequest.isDone()).toBe(true);
      })
      .verify(done);
    });

    it("should utilize API key", (done) => {
      const reqWithApiKey =
        nock(BASE_API_URL)
          .get("/anyId123")
          .query({ wskey: MOCK_API_KEY })
          .reply(200, worldCatISBN.xml);

      return oclc.event({
        "queryStringParameters": {
          oclc: "anyId123",
          institution
        }
      })
      .expectResult(result => {
        expect(reqWithApiKey.isDone()).toBe(true);
      })
      .verify(done);
    });
  });

  describe('on failure', () => {
    const institution = "nyu";

    describe('of xml parsing', () => {
      let genericRequest;
      const mockId = "anyId123";
      beforeEach(() => {
        genericRequest =
          nock(BASE_API_URL)
            .get(`/${mockId}`).query(true)
            .reply(200, 'Welcome to WorldCat');
      });

      it('should return xml parsing error', (done) => {
        return oclc.event({
          "queryStringParameters": {
            oclc: mockId,
            institution
          }
        })
        .expectError(error => {
          expect(error.message).toContain('Root element is missing or invalid');
        })
        .verify(done);
      });
    });

    describe('of WorldCat fetch', () => {
      let genericRequest;
      const mockId = "anyId123";
      beforeEach(() => {
        genericRequest =
          nock(BASE_API_URL)
            .get(`/${mockId}`).query(true)
            .reply(404);
      });
      it("should show corresponding status error", (done) => {
        return oclc.event({
          "queryStringParameters": {
            oclc: mockId,
            institution
          }
        })
        .expectError(error => {
          expect(error.response.status).toEqual(404);
        })
        .verify(done);
      });
    });

  });

  afterEach(() => {
    nock.cleanAll();
  });
});

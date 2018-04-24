const { BASE_SEARCH_URL, INSTITUTIONS_TO_VID, ADVANCED_MODE, BASE_API_URL, MOCK_API_KEY } = require("../helpers/constants");
const { oclc } = require("../helpers/constants").lambdas;
const nock = require('nock');
const worldCatISBN = require('../helpers/worldcat-isbn.fixture.js');


describe('OCLC', () => {
  beforeEach(() => {
    process.env.WORLDCAT_API_KEY = MOCK_API_KEY;
  });

  describe("null query", () => {
    it('should redirect to default view\'s search', (done) => {
      const defaultVid = INSTITUTIONS_TO_VID.default;
      return oclc.event({
        "queryStringParameters": null
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
      })
      .verify(done);
    });
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
    const defaultVid = INSTITUTIONS_TO_VID.default;

    beforeEach(() => {
      spyOn(console, 'error');
    });

    describe('of xml parsing', () => {
      let genericRequest;
      const mockId = "anyId123";
      beforeEach(() => {
        genericRequest =
          nock(BASE_API_URL)
            .get(`/${mockId}`).query(true)
            .reply(200, 'Welcome to WorldCat');
      });

      it('should log xml parsing error in Lambda', (done) => {
        return oclc.event({
          "queryStringParameters": {
            oclc: mockId
          }
        })
        .expectResult(result => {
          expect(console.error.calls.mostRecent().args[0]).toMatch(/Root element is missing or invalid/);
        })
        .verify(done);
      });

      it('should redirect to institution\'s search page', (done) => {
        return oclc.event({
          "queryStringParameters": {
            oclc: mockId
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
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

      it("should log the status error in Lambda", (done) => {
        return oclc.event({
          "queryStringParameters": {
            oclc: mockId
          }
        })
        .expectResult(result => {
          expect(console.error.calls.mostRecent().args[0]).toMatch(/Request failed with status code 404/);
        })
        .verify(done);
      });

      Object.keys(INSTITUTIONS_TO_VID).forEach(institution => {
        const vid = INSTITUTIONS_TO_VID[institution];

        it(`should redirect to ${institution}'s search page`, (done) => {
          return oclc.event({
            "queryStringParameters": {
              oclc: mockId,
              institution
            }
          })
          .expectResult(result => {
            expect(result.statusCode).toEqual(302);
            expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${vid}`);
          })
          .verify(done);
        });
      });
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

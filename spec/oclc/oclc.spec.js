const { BASE_SEARCH_URL, BASE_API_URL, MOCK_API_KEY } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../helpers/lambdas");
const nock = require('nock');
const worldCatISBN = require('../helpers/worldcat-isbn.fixture.js');


describe('OCLC', () => {
  beforeEach(() => {
    process.env.WORLDCAT_API_KEY = MOCK_API_KEY;
  });

  describe("null query", () => {
    it('should redirect to default view\'s search', (done) => {
      persistent.event({
        queryStringParameters: null
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);

        const url = escapeRegExp(BASE_SEARCH_URL);
        const urlMatcher = new RegExp(url + ".*");
        expect(result.headers.Location).toMatch(urlMatcher);
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

      persistent.event({
        queryStringParameters: {
          oclc: "anyId123",
          institution
        }
      })
      .expectResult(() => {
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

      persistent.event({
        queryStringParameters: {
          oclc: "anyId123",
          institution
        }
      })
      .expectResult(() => {
        expect(reqWithApiKey.isDone()).toBe(true);
      })
      .verify(done);
    });
  });

  describe('on failure', () => {
    beforeEach(() => {
      spyOn(console, 'error');
    });

    describe('of xml parsing', () => {
      const mockId = "anyId123";
      beforeEach(() => {
        nock(BASE_API_URL)
          .get(`/${mockId}`).query(true)
          .reply(200, 'Welcome to WorldCat');
      });

      it('should log xml parsing error in Lambda', (done) => {
        persistent.event({
          "queryStringParameters": {
            oclc: mockId
          }
        })
        .expectResult(() => {
          expect(console.error.calls.mostRecent().args[0]).toMatch(/Root element is missing or invalid/);
        })
        .verify(done);
      });

      it('should redirect to search page', (done) => {
        persistent.event({
          "queryStringParameters": {
            institution: "nyu",
            oclc: mockId
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);

          const url = escapeRegExp(`${BASE_SEARCH_URL}query=any,contains,${mockId}`);
          const urlMatcher = new RegExp(url + ".*");
          expect(result.headers.Location).toMatch(urlMatcher);
          expect(result.headers.Location).toMatch(".*" + "&search_scope=" + ".*" + "&vid=");
        })
        .verify(done);
      });
    });

    describe('of WorldCat fetch', () => {
      const mockId = "anyId123";
      beforeEach(() => {
        nock(BASE_API_URL)
          .get(`/${mockId}`).query(true)
          .reply(404);
      });

      it('should log the status error in Lambda', (done) => {
        persistent.event({
          "queryStringParameters": {
            oclc: mockId
          }
        })
        .expectResult(() => {
          expect(console.error.calls.mostRecent().args[0]).toMatch(/Request failed with status code 404/);
        })
        .verify(done);
      });

      it('should redirect to search page', (done) => {
        persistent.event({
          "queryStringParameters": {
            institution: "nyu",
            oclc: mockId
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);

          const url = escapeRegExp(`${BASE_SEARCH_URL}query=any,contains,${mockId}`);
          const urlMatcher = new RegExp(url + ".*");
          expect(result.headers.Location).toMatch(urlMatcher);
          expect(result.headers.Location).toMatch(".*" + "&search_scope=" + ".*" + "&vid=");
        })
        .verify(done);
      });
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

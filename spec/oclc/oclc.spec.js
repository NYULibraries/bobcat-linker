const { BASE_SEARCH_URL, BASE_API_URL, MOCK_API_KEY } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../../handler");
const nock = require('nock');
const worldCatISBN = require('../helpers/worldcat-isbn.fixture.js');


describe('OCLC', () => {
  describe("null query", () => {
    it('should redirect to default view\'s search', async () => {
      const result = await persistent({
        queryStringParameters: null
      });

      expect(result.statusCode).toEqual(302);

      const url = escapeRegExp(BASE_SEARCH_URL);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    });
  });


  describe("when OCLC provided", () => {
    const institution = "nyu";
    it('should make a GET request to WorldCat', async () => {
      const genericRequest =
        nock(BASE_API_URL)
        .get("/anyId123")
        .query(true)
        .reply(200, worldCatISBN.xml);

      const result = await persistent({
        queryStringParameters: {
          oclc: "anyId123",
          institution
        }
      });

      expect(genericRequest.isDone()).toBe(true);
    });

    it("should utilize API key", async () => {
      const reqWithApiKey =
        nock(BASE_API_URL)
          .get("/anyId123")
          .query({ wskey: MOCK_API_KEY })
          .reply(200, worldCatISBN.xml);

      const result = await persistent({
        queryStringParameters: {
          oclc: "anyId123",
          institution
        }
      });

      expect(reqWithApiKey.isDone()).toBe(true);
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

      it('should log xml parsing error in Lambda', async () => {
        const result = await persistent({
          "queryStringParameters": {
            oclc: mockId
          }
        });

        expect(console.error.calls.mostRecent().args[0]).toMatch(/Root element is missing or invalid/);
      });

      it('should redirect to search page', async () => {
        const result = await persistent({
          "queryStringParameters": {
            institution: "nyu",
            oclc: mockId
          }
        });

        expect(result.statusCode).toEqual(302);

        const url = escapeRegExp(`${BASE_SEARCH_URL}query=any,contains,${mockId}`);
        const urlMatcher = new RegExp(url + ".*");
        expect(result.headers.Location).toMatch(urlMatcher);
        expect(result.headers.Location).toMatch(".*" + "&search_scope=" + ".*" + "&vid=");
      });
    });

    describe('of WorldCat fetch', () => {
      const mockId = "anyId123";
      beforeEach(() => {
        nock(BASE_API_URL)
          .get(`/${mockId}`).query(true)
          .reply(404);
      });

      it('should log the status error in Lambda', async () => {
        const result = await persistent({
          "queryStringParameters": {
            oclc: mockId
          }
        });

        expect(console.error.calls.mostRecent().args[0]).toMatch(/Request failed with status code 404/);
      });

      it('should redirect to search page', async () => {
        const result = await persistent({
          "queryStringParameters": {
            institution: "nyu",
            oclc: mockId
          }
        });

        expect(result.statusCode).toEqual(302);

        const url = escapeRegExp(`${BASE_SEARCH_URL}query=any,contains,${mockId}`);
        const urlMatcher = new RegExp(url + ".*");
        expect(result.headers.Location).toMatch(urlMatcher);
        expect(result.headers.Location).toMatch(".*" + "&search_scope=" + ".*" + "&vid=");
      });
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

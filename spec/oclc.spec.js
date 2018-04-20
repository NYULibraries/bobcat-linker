const { BASE_SEARCH_URL, INSTITUTIONS, ADVANCED_MODE } = require("./helpers/constants");
const { oclc } = require("./helpers/constants").lambdas;
const nock = require('nock');

const worldCatISBN = require('./helpers/worldcat-isbn.fixture.js');
const worldCatISSN = require('./helpers/worldcat-issn.fixture.js');

describe('OCLC', () => {
  const BASE_API_URL = "http://www.worldcat.org/webservices/catalog/content";
  const MOCK_API_KEY = "922bfbc1-d6ad-417c-940b-50c07e8db080";

  beforeEach(() => {
    process.env.WORLDCAT_API_KEY = MOCK_API_KEY;
  });

  // spies
  beforeEach(() => {
    spyOn(console, 'error');
  });

  describe("when OCLC provided", () => {
    const institution = "nyu";
    it('should make a GET request to WorldCat', (done) => {
      const genericRequest =
        nock(BASE_API_URL)
        .get("/anyId123")
        .query(true)
        .reply(200, "Welcome to WorldCat!");

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
          .reply(200, "Welcome to WorldCat!");

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
      beforeEach(() => {
        genericRequest =
          nock(BASE_API_URL)
            .get("/anyId123").query(true)
            .reply(200, "Welcome to WorldCat!");
      });

      it('should log xml parsing error', (done) => {
        return oclc.event({
          "queryStringParameters": {
            oclc: "anyId123",
            institution
          }
        })
        .expectResult(result => {
          expect(console.error).toHaveBeenCalled();
        })
        .verify(done);
      });
    });
  });

  describe('when ISBN found', () => {

    let isbnRecRequest;
    beforeEach(() => {
      isbnRecRequest =
        nock(BASE_API_URL)
          .get(`/${worldCatISBN.oclc}`)
          .query(true)
          .reply(200, worldCatISBN.xml);
    });

    const isbn = worldCatISBN.isbn;
    const oclcId = worldCatISBN.oclc;
    const institution = "NYU";

    it("should use the record's first ISBN", (done) => {
      return oclc.event({
        "queryStringParameters": {
          oclc: oclcId,
          institution
        }
      })
      .expectResult(result => {
        expect(isbnRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });

    it("should work with significant delays", (done) => {
      const delayedRequest =
        nock(BASE_API_URL)
          .get(`/${worldCatISBN.oclc}`)
          .query(true)
          .delayBody(2000)
          .reply(200, worldCatISBN.xml);

      return oclc.event({
        "queryStringParameters": {
          oclc: oclcId,
          institution
        }
      })
      .expectResult(result => {
        expect(isbnRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });
  });

  describe('when ISSN found', () => {
    const issn = worldCatISSN.issn;
    const oclcId = worldCatISSN.oclc;
    const institution = "nyu";

    let issnRecRequest;
    beforeEach(() => {
      issnRecRequest =
        nock(BASE_API_URL)
          .get(`/${worldCatISSN.oclc}`)
          .query(true)
          .reply(200, worldCatISSN.xml);
    });

    it("should use the record's first ISSN", (done) => {
      return oclc.event({
        "queryStringParameters": {
          oclc: oclcId,
          institution
        }
      })
      .expectResult(result => {
        expect(issnRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${issn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

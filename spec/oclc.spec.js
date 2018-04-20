const { BASE_SEARCH_URL, INSTITUTIONS, ADVANCED_MODE } = require("./helpers/constants");
const { oclc } = require("./helpers/constants").lambdas;
const nock = require('nock');

const worldCatISBN = require('./helpers/worldcat-isbn.fixture.js');

describe('OCLC', () => {
  const BASE_API_URL = "http://www.worldcat.org/webservices/catalog/content";

  let genericRequest, isbnRecRequest;
  describe("when OCLC provided", () => {

    beforeEach(() => {
      genericRequest =
        nock(BASE_API_URL)
          .get("/anyId123")
          .reply(200, "Welcome to WorldCat!");
    });

    const institution = "nyu";
    it('should make a GET request to WorldCat', (done) => {
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
  });

  describe('when ISBN found', () => {
    beforeEach(() => {
      isbnRecRequest =
        nock(BASE_API_URL)
          .get(`/${worldCatISBN.oclc}`)
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
  });

  // describe('when ISSN found', () => {
  //   const issn = "0028-0836";
  //   const oclcId = "1586310";
  //   const institution = "NYU";
  //
  //   it("should use the record's first ISSN", (done) => {
  //     return oclc.event({
  //       "queryStringParameters": {
  //         oclc: oclcId,
  //         institution
  //       }
  //     })
  //     .expectResult(result => {
  //       expect(result.statusCode).toEqual(302);
  //       expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${issn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
  //     })
  //     .verify(done);
  //   });
  // });

  afterEach(() => {
    nock.cleanAll();
  });
});

const { BASE_SEARCH_URL, INSTITUTIONS, ADVANCED_MODE } = require("./helpers/constants");
const { oclc } = require("./helpers/constants").lambdas;
const nock = require('nock');

const worldCatISBN = require('./helpers/worldcat-isbn.fixture.js');

describe('OCLC', () => {
  const BASE_API_URL = "http://www.worldcat.org/webservices/catalog/content";

  describe("when OCLC provided", () => {
    const oclcId = "82671871";
    const institution = "nyu";

    it('should make a GET request to WorldCat', (done) => {
      const req = nock(BASE_API_URL)
                    .get(`/${oclcId}`)
                    .reply(200, 'Hello from Webcat!');

      return oclc.event({
        "queryStringParameters": {
          oclc: oclcId,
          institution
        }
      })
      .expectResult(result => {
        expect(req.isDone()).toBe(true);
      })
      .verify(done);
    });
  });

  describe('when ISBN found', () => {
    const isbn = worldCatISBN.isbn;
    const oclcId = worldCatISBN.oclc;
    const institution = "NYU";
    const req = nock(BASE_API_URL)
                  .get(`/${oclcId}`)
                  .reply(200, worldCatISBN.xml, {
                    'Content-Type': 'application/xml'
                  });

    it("should use the record's first ISBN", (done) => {
      return oclc.event({
        "queryStringParameters": {
          oclc: oclcId,
          institution
        }
      })
      .expectResult(result => {
        expect(req.isDone()).toBe(true);
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
});

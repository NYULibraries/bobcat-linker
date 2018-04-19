const { BASE_SEARCH_URL, INSTITUTIONS, ADVANCED_MODE } = require("./helpers/constants");
const { oclc } = require("./helpers/constants").lambdas;
const nock = require('nock');

describe('oclc', () => {
  const BASE_API_URL = "http://www.worldcat.org/webservices/catalog/content/";

  describe("when http request made", () => {
    const req = nock(new RegExp(`${BASE_API_URL}`));

    it('should make a GET request to appropriate URL', () => {
      const oclcId = "82671871";
      const url = BASE_API_URL + oclcId;
    });
  });

  describe('when ISBN found', (done) => {
    const isbn = "9780596529260";
    const oclcId = "82671871";
    const institution = "NYU";

    it("should use the record's first ISBN", () => {
      return oclc.event({
        "queryStringParameters": {
          oclcId,
          institution
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });
  });

  describe('when ISSN found', (done) => {
    const issn = "0028-0836";
    const oclcId = "1586310";
    const institution = "NYU";

    it("should use the record's first ISSN", () => {
      return oclc.event({
        "queryStringParameters": {
          oclcId,
          institution
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${issn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });
  });
});

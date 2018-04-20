const { BASE_SEARCH_URL, INSTITUTIONS, ADVANCED_MODE,
        BASE_API_URL } = require("../helpers/constants");
const { oclc } = require("../helpers/constants").lambdas;
const worldCatISBN = require('../helpers/worldcat-isbn.fixture.js');
const nock = require('nock');

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

  afterEach(() => {
    nock.cleanAll();
  });
});

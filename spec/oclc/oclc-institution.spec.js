const { BASE_SEARCH_URL, INSTITUTIONS, ADVANCED_MODE,
        BASE_API_URL } = require("../helpers/constants");
const { oclc } = require("../helpers/constants").lambdas;
const worldCatISBN = require('../helpers/worldcat-isbn.fixture.js');
const nock = require('nock');

describe('institution parameter', () => {
  let isbnRecRequest;
  beforeEach(() => {
    isbnRecRequest =
      nock(BASE_API_URL)
        .get(`/${worldCatISBN.oclc}`)
        .query(true)
        .reply(200, worldCatISBN.xml);
  });

  describe('with a valid institution', () => {
    INSTITUTIONS.forEach(institution => {
      it(`should redirect to ${institution}\'s fulldisplay page`, (done) => {
        const isbn = worldCatISBN.isbn;
        const oclcId = worldCatISBN.oclc;

        return oclc.event({
          "queryStringParameters": {
            institution,
            oclc: oclcId
          }
        })
        .expectResult(result => {
          expect(isbnRecRequest.isDone()).toBe(true);
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution}`);
        })
        .verify(done);
      });
    });
  });

  describe('with an invalid institution', () => {
    it(`should account for mis-capitalization`, (done) => {
      const institution = "nYu";
      const isbn = worldCatISBN.isbn;
      const oclcId = worldCatISBN.oclc;

      return oclc.event({
        "queryStringParameters": {
          institution,
          oclc: oclcId
        }
      })
      .expectResult(result => {
        expect(isbnRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });

    it("should redirect to NYU's fulldisplay view of record", (done) => {
      const institution = "banana";
      const isbn = worldCatISBN.isbn;
      const oclcId = worldCatISBN.oclc;

      return oclc.event({
        "queryStringParameters": {
          institution,
          oclc: oclcId
        }
      })
      .expectResult(result => {
        expect(isbnRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=NYU`);
      })
      .verify(done);
    });

    describe('without an institution', () => {
      const oclcId = worldCatISBN.oclc;
      const isbn = worldCatISBN.isbn;

      it("should redirect to NYU's fulldisplay view of record", (done) => {
        return oclc.event({
          "queryStringParameters": {
            oclc: oclcId
          }
        })
        .expectResult(result => {
          expect(isbnRecRequest.isDone()).toBe(true);
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=NYU`);
        })
        .verify(done);
      });
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

const { BASE_SEARCH_URL, INSTITUTIONS, INSTITUTIONS_TO_VID,
        ADVANCED_MODE, BASE_API_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
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
      it(`should redirect to ${institution.toUpperCase()}\'s fulldisplay page`, (done) => {
        const vid = INSTITUTIONS_TO_VID[institution];
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

          const urlMatcher = new RegExp(
            escapeRegExp(BASE_SEARCH_URL) +
            ".*" +
            escapeRegExp(`&vid=${vid}`)
          );

          expect(result.headers.Location).toMatch(urlMatcher);
        })
        .verify(done);
      });
    });
  });

  describe('with an invalid institution', () => {
    const defaultVid = INSTITUTIONS_TO_VID.default;

    it(`should account for mis-capitalization`, (done) => {
      const institution = "nYu";
      const vid = INSTITUTIONS_TO_VID[institution.toLowerCase()];
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

        const urlMatcher = new RegExp(
          escapeRegExp(BASE_SEARCH_URL) +
          ".*" +
          escapeRegExp(`&vid=${vid}`)
        );

        expect(result.headers.Location).toMatch(urlMatcher);
      })
      .verify(done);
    });

    it(`should redirect to ${defaultVid}'s fulldisplay view of record`, (done) => {
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

        const urlMatcher = new RegExp(
          escapeRegExp(BASE_SEARCH_URL) +
          ".*" +
          escapeRegExp(`&vid=${defaultVid}`)
        );

        expect(result.headers.Location).toMatch(urlMatcher);
      })
      .verify(done);
    });

    describe('without an institution', () => {
      const oclcId = worldCatISBN.oclc;
      const isbn = worldCatISBN.isbn;

      it(`should redirect to ${defaultVid}'s fulldisplay view of record`, (done) => {
        return oclc.event({
          "queryStringParameters": {
            oclc: oclcId
          }
        })
        .expectResult(result => {
          expect(isbnRecRequest.isDone()).toBe(true);
          expect(result.statusCode).toEqual(302);
          
          const urlMatcher = new RegExp(
            escapeRegExp(BASE_SEARCH_URL) +
            ".*" +
            escapeRegExp(`&vid=${defaultVid}`)
          );

          expect(result.headers.Location).toMatch(urlMatcher);
        })
        .verify(done);
      });
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

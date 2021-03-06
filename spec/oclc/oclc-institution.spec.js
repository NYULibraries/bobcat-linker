const { BASE_SEARCH_URL, INSTITUTIONS, INSTITUTIONS_TO_VID, BASE_API_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../helpers/lambdas");
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
      it(`should redirect to ${institution.toUpperCase()}'s search page`, (done) => {
        const vid = INSTITUTIONS_TO_VID[institution];
        const oclcId = worldCatISBN.oclc;

        persistent.event({
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
            escapeRegExp(`&search_scope=${institution}&vid=${vid}`)
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
      const oclcId = worldCatISBN.oclc;

      persistent.event({
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
          escapeRegExp(`&search_scope=${institution.toLowerCase()}&vid=${vid}`)
        );

        expect(result.headers.Location).toMatch(urlMatcher);
      })
      .verify(done);
    });

    it(`should redirect to ${defaultVid}'s fulldisplay view of record`, (done) => {
      const institution = "banana";
      const oclcId = worldCatISBN.oclc;

      persistent.event({
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

      it(`should redirect to ${defaultVid}'s fulldisplay view of record`, (done) => {
        persistent.event({
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

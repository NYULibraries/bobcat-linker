const { BASE_SEARCH_URL, INSTITUTIONS, INSTITUTIONS_TO_VID, BASE_API_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../../handler");
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
      it(`should redirect to ${institution.toUpperCase()}'s search page`, async () => {
        const vid = INSTITUTIONS_TO_VID[institution];
        const oclcId = worldCatISBN.oclc;

        const result = await persistent({
          "queryStringParameters": {
            institution,
            oclc: oclcId
          }
        })
        expect(isbnRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);

        const urlMatcher = new RegExp(
          escapeRegExp(BASE_SEARCH_URL) +
          ".*" +
          escapeRegExp(`&search_scope=${institution}&vid=${vid}`)
        );

        expect(result.headers.Location).toMatch(urlMatcher);
      });
    });
  });

  describe('with an invalid institution', () => {
    const defaultVid = INSTITUTIONS_TO_VID.default;

    it(`should account for mis-capitalization`, async () => {
      const institution = "nYu";
      const vid = INSTITUTIONS_TO_VID[institution.toLowerCase()];
      const oclcId = worldCatISBN.oclc;

      const result = await persistent({
        "queryStringParameters": {
          institution,
          oclc: oclcId
        }
      });

      expect(isbnRecRequest.isDone()).toBe(true);
      expect(result.statusCode).toEqual(302);

      const urlMatcher = new RegExp(
        escapeRegExp(BASE_SEARCH_URL) +
        ".*" +
        escapeRegExp(`&search_scope=${institution.toLowerCase()}&vid=${vid}`)
      );

      expect(result.headers.Location).toMatch(urlMatcher);
    });

    it(`should redirect to ${defaultVid}'s fulldisplay view of record`, async () => {
      const institution = "banana";
      const oclcId = worldCatISBN.oclc;

      const result = await persistent({
        "queryStringParameters": {
          institution,
          oclc: oclcId
        }
      })
      expect(isbnRecRequest.isDone()).toBe(true);
      expect(result.statusCode).toEqual(302);

      const urlMatcher = new RegExp(
        escapeRegExp(BASE_SEARCH_URL) +
        ".*" +
        escapeRegExp(`&vid=${defaultVid}`)
      );

      expect(result.headers.Location).toMatch(urlMatcher);
    });

    describe('without an institution', () => {
      const oclcId = worldCatISBN.oclc;

      it(`should redirect to ${defaultVid}'s fulldisplay view of record`, async () => {
        const result = await persistent({
          "queryStringParameters": {
            oclc: oclcId
          }
        });
        expect(isbnRecRequest.isDone()).toBe(true);
        expect(result.statusCode).toEqual(302);

        const urlMatcher = new RegExp(
          escapeRegExp(BASE_SEARCH_URL) +
          ".*" +
          escapeRegExp(`&vid=${defaultVid}`)
        );

        expect(result.headers.Location).toMatch(urlMatcher);
      });
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });
});

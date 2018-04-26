const { BASE_SEARCH_URL, INSTITUTIONS, INSTITUTIONS_TO_VID } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../helpers/constants").lambdas;

describe('institution view ONLY', () => {
  INSTITUTIONS.forEach((institution) => {
    const vid = INSTITUTIONS_TO_VID[institution];
    it(`should redirect to ${institution.toUpperCase()}'s search`, (done) => {
      persistent.event({
        "queryStringParameters": {
          institution
        }
      })
      .expectResult(result => {
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

  it(`should account for mis-capitalization`, (done) => {
    const institution = 'nYu';
    const vid = INSTITUTIONS_TO_VID[institution.toLowerCase()];
    persistent.event({
      "queryStringParameters": {
        institution
      }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);
      expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&search_scope=${institution.toLowerCase()}&vid=${vid}`);
    })
    .verify(done);
  });

  const defaultVid = INSTITUTIONS_TO_VID.default;
  it(`should redirect to ${defaultVid} search if institution invalid`, (done) => {
    persistent.event({
      "queryStringParameters": {
        institution: "banana"
      }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);
      expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
    })
    .verify(done);
  });

  it(`should redirect to ${defaultVid} search if no institution`, (done) => {
    persistent.event({
      "queryStringParameters": { }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);
      expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
    })
    .verify(done);
  });
}); // end institution view

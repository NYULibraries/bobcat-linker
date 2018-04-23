const { BASE_SEARCH_URL, INSTITUTIONS, INSTITUTIONS_TO_VID } = require("../helpers/constants");
const { persistent } = require("../helpers/constants").lambdas;

describe('institution view ONLY', () => {
  it(`should account for mis-capitalization`, (done) => {
    const institution = 'nYu';
    return persistent.event({
      "queryStringParameters": {
        institution
      }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);
      expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=NYU`);
    })
    .verify(done);
  });

  INSTITUTIONS.forEach((institution) => {
    const vid = INSTITUTIONS_TO_VID[institution];
    it(`should redirect to ${institution.toUpperCase()}'s search`, (done) => {
      return persistent.event({
        "queryStringParameters": {
          institution
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${vid}`);
      })
      .verify(done);
    });
  });

  const defaultVid = INSTITUTIONS_TO_VID.default;
  it(`should redirect to ${defaultVid} search if institution invalid`, (done) => {
    return persistent.event({
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
}); // end institution view

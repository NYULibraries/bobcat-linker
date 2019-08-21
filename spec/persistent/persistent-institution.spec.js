const { BASE_SEARCH_URL, INSTITUTIONS, INSTITUTIONS_TO_VID } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../../handler");

describe('institution view ONLY', () => {
  INSTITUTIONS.forEach((institution) => {
    const vid = INSTITUTIONS_TO_VID[institution];
    it(`should redirect to ${institution.toUpperCase()}'s search`, async () => {
      const result = await persistent({
        "queryStringParameters": {
          institution
        }
      });

      expect(result.statusCode).toEqual(302);

      const urlMatcher = new RegExp(
        escapeRegExp(BASE_SEARCH_URL) +
        ".*" +
        escapeRegExp(`&search_scope=${institution}&vid=${vid}`)
      );

      expect(result.headers.Location).toMatch(urlMatcher);
    });
  });

  it(`should account for mis-capitalization`, async () => {
    const institution = 'nYu';
    const vid = INSTITUTIONS_TO_VID[institution.toLowerCase()];
    const result = await persistent({
      "queryStringParameters": {
        institution
      }
    });

    expect(result.statusCode).toEqual(302);
    expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&search_scope=${institution.toLowerCase()}&vid=${vid}`);
  });

  const defaultVid = INSTITUTIONS_TO_VID.default;
  it(`should redirect to ${defaultVid} search if institution invalid`, async () => {
    const result = await persistent({
      "queryStringParameters": {
        institution: "banana"
      }
    });

    expect(result.statusCode).toEqual(302);
    expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
  });

  it(`should redirect to ${defaultVid} search if no institution`, async () => {
    const result = await persistent({
      "queryStringParameters": { }
    });

    expect(result.statusCode).toEqual(302);
    expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
  });
}); // end institution view

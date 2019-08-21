const { BASE_SEARCH_URL, ADVANCED_MODE } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../../handler");

describe('ISBN', () => {
  it(`should redirect to fulldisplay page with ISBN record`, async () => {
    const isbn = "abcd123456789";

    const result = await persistent({
      "queryStringParameters": {
        isbn
      }
    });

    expect(result.statusCode).toEqual(302);

    const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}`);
    const urlMatcher = new RegExp(url + ".*");
    expect(result.headers.Location).toMatch(urlMatcher);
  });

  it(`should redirect to fulldisplay page with ISSN record`, async () => {
    const issn = "abcd123456789";
    const result = await persistent({
      "queryStringParameters": {
        issn
      }
    });

    expect(result.statusCode).toEqual(302);

    const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${issn}&${ADVANCED_MODE}`);
    const urlMatcher = new RegExp(url + ".*");
    expect(result.headers.Location).toMatch(urlMatcher);
  });

  it('should prioritize ISBN over non-LCN', async () => {
    const institution = "nyu";
    const isbn = "12345678isbn";
    const result = await persistent({
      "queryStringParameters": {
        institution,
        isbn,
        oclc: "1234oclc",
        issn: "1234issn"
      }
    });

    expect(result.statusCode).toEqual(302);

    const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}`);
    const urlMatcher = new RegExp(url + ".*");
    expect(result.headers.Location).toMatch(urlMatcher);
  });
});

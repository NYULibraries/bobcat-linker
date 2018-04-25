const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL,
        INSTITUTIONS, INSTITUTIONS_TO_VID,
        ADVANCED_MODE } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");

const { persistent } = require("../helpers/constants").lambdas;

describe('ISBN', () => {
  it(`should redirect to fulldisplay page with ISBN record`, (done) => {
    const isbn = "abcd123456789";
    return persistent.event({
      "queryStringParameters": {
        isbn
      }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);

      const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}`);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    })
    .verify(done);
  });

  it(`should redirect to fulldisplay page with ISSN record`, (done) => {
    const issn = "abcd123456789";
    return persistent.event({
      "queryStringParameters": {
        issn
      }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);

      const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${issn}&${ADVANCED_MODE}`);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    })
    .verify(done);
  });

  it('should prioritize ISBN over non-LCN', (done) => {
    const institution = "nyu";
    const isbn = "12345678isbn";
    return persistent.event({
      "queryStringParameters": {
        institution,
        isbn,
        oclc: "1234oclc",
        issn: "1234issn"
      }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);

      const url = escapeRegExp(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}`);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    })
    .verify(done);
  });
});

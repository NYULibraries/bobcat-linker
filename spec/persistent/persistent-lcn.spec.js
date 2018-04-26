const { BASE_FULLDISPLAY_URL, INSTITUTIONS, INSTITUTIONS_TO_VID } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../helpers/constants").lambdas;

describe('LCN', () => {
  it(`should redirect to fulldisplay page with LCN record`, (done) => {
    const lcn = "abcd123456789";
    persistent.event({
      "queryStringParameters": {
        lcn
      }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);

      const url = escapeRegExp(`${BASE_FULLDISPLAY_URL}&docid=${lcn}`);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    })
    .verify(done);
  });

  it('should ignore non-lcn parameters', (done) => {
    const institution = "nyu";
    const lcn = "abcd123456789";
    persistent.event({
      "queryStringParameters": {
        institution,
        lcn,
        oclc: "1234oclc",
        isbn: "12345678isbn",
        issn: "1234issn"
      }
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);

      const url = escapeRegExp(`${BASE_FULLDISPLAY_URL}&docid=${lcn}`);
      const urlMatcher = new RegExp(url + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    })
    .verify(done);
  });
});

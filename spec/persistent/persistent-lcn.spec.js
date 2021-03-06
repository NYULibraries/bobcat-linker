const { BASE_FULLDISPLAY_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../helpers/lambdas");

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

  const prependExpectations = {
    '123456789': true,
    '37.37': false,
    '123ABC': false,
    '37,5': false,
    ' ': false,
    // '': false,: not necessary to test, since will not use lcn if ''
  };

  for (let lcn in prependExpectations) {
    const isPrepended = prependExpectations[lcn];
    it(`should ${isPrepended ? '' : 'not'} prepend nyu_aleph if lcn is "${lcn}"`, (done) => {
      const institution = 'nyu';

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

        const url = encodeURI(`${BASE_FULLDISPLAY_URL}&docid=${isPrepended ? 'nyu_aleph' : ''}${lcn}`);
        const urlMatcher = new RegExp(escapeRegExp(url) + ".*");
        expect(result.headers.Location).toMatch(urlMatcher);
      })
      .verify(done);
    });
  }
});

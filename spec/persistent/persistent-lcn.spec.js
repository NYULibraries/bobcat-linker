const { BASE_FULLDISPLAY_URL } = require("../helpers/constants");
const { escapeRegExp } = require("../helpers/common");
const { persistent } = require("../../handler");

describe('LCN', () => {
  it(`should redirect to fulldisplay page with LCN record`, async () => {
    const lcn = "abcd123456789";
    const result = await persistent({
      "queryStringParameters": {
        lcn
      }
    });

    expect(result.statusCode).toEqual(302);

    const url = escapeRegExp(`${BASE_FULLDISPLAY_URL}&docid=${lcn}`);
    const urlMatcher = new RegExp(url + ".*");
    expect(result.headers.Location).toMatch(urlMatcher);
  });

  it('should ignore non-lcn parameters', async () => {
    const institution = "nyu";
    const lcn = "abcd123456789";

    const result = await persistent({
      "queryStringParameters": {
        institution,
        lcn,
        oclc: "1234oclc",
        isbn: "12345678isbn",
        issn: "1234issn"
      }
    });

    expect(result.statusCode).toEqual(302);

    const url = escapeRegExp(`${BASE_FULLDISPLAY_URL}&docid=${lcn}`);
    const urlMatcher = new RegExp(url + ".*");
    expect(result.headers.Location).toMatch(urlMatcher);
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
    it(`should ${isPrepended ? '' : 'not'} prepend nyu_aleph if lcn is "${lcn}"`, async () => {
      const institution = 'nyu';

      const result = await persistent({
        "queryStringParameters": {
          institution,
          lcn,
          oclc: "1234oclc",
          isbn: "12345678isbn",
          issn: "1234issn"
        }
      });

      expect(result.statusCode).toEqual(302);

      const url = encodeURI(`${BASE_FULLDISPLAY_URL}&docid=${isPrepended ? 'nyu_aleph' : ''}${lcn}`);
      const urlMatcher = new RegExp(escapeRegExp(url) + ".*");
      expect(result.headers.Location).toMatch(urlMatcher);
    });
  }
});

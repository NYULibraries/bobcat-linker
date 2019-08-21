const { BASE_SEARCH_URL, INSTITUTIONS_TO_VID } = require("../helpers/constants");
const { persistent } = require("../../handler");

describe("null query", () => {
  const defaultVid = INSTITUTIONS_TO_VID.default;

  it(`should redirect to ${defaultVid} search`, async () => {
    const result = await persistent({
      "queryStringParameters": null
    })
    expect(result.statusCode).toEqual(302);
    expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
  });

  describe("on failure", () => {
    beforeEach(() => {
      spyOn(console, 'error');
    });

    it(`should redirect to ${defaultVid} search page`, async () => {
      // forces a TypeError: Cannot read property 'queryStringParameters' of undefined
      const result = await persistent();
      expect(result.statusCode).toEqual(302);
      expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
    });

    it('should log error in Lambda', async () => {
      const result = await persistent(); // forces a TypeError: Cannot read property 'queryStringParameters' of undefined
      expect(console.error.calls.mostRecent().args[0]).toMatch(/TypeError: Cannot read/);
    });
  });
});

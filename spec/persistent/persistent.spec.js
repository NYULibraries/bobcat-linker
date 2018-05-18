const { BASE_SEARCH_URL, INSTITUTIONS_TO_VID } = require("../helpers/constants");
const { persistent } = require("../helpers/constants").lambdas;

describe("null query", () => {
  const defaultVid = INSTITUTIONS_TO_VID.default;

  it(`should redirect to ${defaultVid} search`, (done) => {
    persistent.event({
      "queryStringParameters": null
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);
      expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
    })
    .verify(done);
  });

  describe("on failure", () => {
    beforeEach(() => {
      spyOn(console, 'error');
    });

    it(`should redirect to ${defaultVid} search page`, (done) => {
      persistent.event() // forces a TypeError: Cannot read property 'queryStringParameters' of undefined
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=${defaultVid}`);
      })
      .verify(done);
    });

    it('should log error in Lambda', (done) => {
      persistent.event() // forces a TypeError: Cannot read property 'queryStringParameters' of undefined
      .expectResult(() => {
        expect(console.error.calls.mostRecent().args[0]).toMatch(/TypeError: Cannot read/);
      })
      .verify(done);
    });
  });
});

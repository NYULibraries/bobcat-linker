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
});

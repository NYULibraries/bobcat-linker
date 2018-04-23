const { BASE_SEARCH_URL, INSTITUTIONS } = require("../helpers/constants");
const { persistent } = require("../helpers/constants").lambdas;

describe("null query", () => {
  it('should redirect to NYU search', (done) => {
    return persistent.event({
      "queryStringParameters": null
    })
    .expectResult(result => {
      expect(result.statusCode).toEqual(302);
      expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}&vid=NYU`);
    })
    .verify(done);
  });
});

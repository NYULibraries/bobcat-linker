const { BASE_FULLDISPLAY_URL, INSTITUTIONS, INSTITUTIONS_TO_VID } = require("../helpers/constants");
const { persistent } = require("../helpers/constants").lambdas;

describe('LCN', () => {
  describe('with a valid institution', () => {
    INSTITUTIONS.forEach(institution => {
      const vid = INSTITUTIONS_TO_VID[institution];
      it(`should redirect to ${institution.toUpperCase()}\'s fulldisplay page with LCN record`, (done) => {
        const lcn = "abcd123456789";
        return persistent.event({
          "queryStringParameters": {
            institution,
            lcn
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${BASE_FULLDISPLAY_URL}&docid=${lcn}&vid=${vid}`);
        })
        .verify(done);
      });
    });

  });

  describe('with an invalid institution', () => {
    it(`should account for mis-capitalization`, (done) => {
      const institution = "nYu";
      const lcn = "abcd123456789";
      return persistent.event({
        "queryStringParameters": {
          institution,
          lcn
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_FULLDISPLAY_URL}&docid=${lcn}&vid=NYU`);
      })
      .verify(done);
    });

    it("should redirect to NYU's fulldisplay view of record", (done) => {
      const institution = "banana";
      const lcn = "abcd123456789";
      return persistent.event({
        "queryStringParameters": {
          institution,
          lcn
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_FULLDISPLAY_URL}&docid=${lcn}&vid=NYU`);
      })
      .verify(done);
    });
  });

  describe('without an institution', () => {
    it("should redirect to NYU's fulldisplay view of record", (done) => {
      const lcn = "abcd123456789";
      return persistent.event({
        "queryStringParameters": {
          lcn
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_FULLDISPLAY_URL}&docid=${lcn}&vid=NYU`);
      })
      .verify(done);
    });
  });

  describe('with extra non-LCN parameters', () => {
    it('should ignore non-lcn parameters', (done) => {
      const institution = "nyu";
      const lcn = "abcd123456789";
      return persistent.event({
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
        expect(result.headers.Location).toEqual(`${BASE_FULLDISPLAY_URL}&docid=${lcn}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });
  });
});

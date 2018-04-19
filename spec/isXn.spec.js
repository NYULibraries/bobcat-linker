const { LAMBDA, BASE_SEARCH_URL, BASE_FULLDISPLAY_URL, INSTITUTIONS, ADVANCED_MODE } = require("./helpers/constants");

describe('ISBN/ISSN', () => {
  describe('with a valid institution', () => {
    INSTITUTIONS.forEach(institution => {
      it(`should redirect to ${institution}\'s fulldisplay page with ISBN record`, (done) => {
        const isbn = "abcd123456789";
        return LAMBDA.event({
          "queryStringParameters": {
            institution,
            isbn
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution}`);
        })
        .verify(done);
      });
    });

  });

  describe('with an invalid institution', () => {
    it(`should account for mis-capitalization`, (done) => {
      const institution = "nYu";
      const isbn = "abcd123456789";
      return LAMBDA.event({
        "queryStringParameters": {
          institution,
          isbn
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });

    it("should redirect to NYU's search page with ISBN search", (done) => {
      const institution = "banana";
      const isbn = "abcd123456789";
      return LAMBDA.event({
        "queryStringParameters": {
          institution,
          isbn
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=NYU`);
      })
      .verify(done);
    });
  });

  describe('without an institution', () => {
    it("should redirect to NYU's search page with ISBN search", (done) => {
      const isbn = "abcd123456789";
      return LAMBDA.event({
        "queryStringParameters": {
          isbn
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=NYU`);
      })
      .verify(done);
    });
  });

  describe('with extra non-ISBN parameters', () => {
    it('should prioritize LCN parameter over all others', (done) => {
      const institution = "nyu";
      const lcn = "abcd123456789";
      return LAMBDA.event({
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

    it('should prioritize ISBN over non-LCN', (done) => {
      const institution = "nyu";
      const isbn = "12345678isbn";
      return LAMBDA.event({
        "queryStringParameters": {
          institution,
          isbn,
          oclc: "1234oclc",
          issn: "1234issn"
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });
  });
});

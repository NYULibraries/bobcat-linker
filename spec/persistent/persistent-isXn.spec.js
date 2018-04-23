const { BASE_SEARCH_URL, BASE_FULLDISPLAY_URL,
        INSTITUTIONS, INSTITUTIONS_TO_VID,
        ADVANCED_MODE } = require("../helpers/constants");
const { persistent } = require("../helpers/constants").lambdas;

describe('ISBN/ISSN', () => {
  describe('with a valid institution', () => {
    INSTITUTIONS.forEach(institution => {
      it(`should redirect to ${institution.toUpperCase()}\'s fulldisplay page with ISBN record`, (done) => {
        const isbn = "abcd123456789";
        const vid = INSTITUTIONS_TO_VID[institution];

        return persistent.event({
          "queryStringParameters": {
            institution,
            isbn
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${vid}`);
        })
        .verify(done);
      });
    });

  });

  describe('with an invalid institution', () => {
    const defaultVid = INSTITUTIONS_TO_VID.default;

    it(`should account for mis-capitalization`, (done) => {
      const institution = "nYu";
      const isbn = "abcd123456789";
      return persistent.event({
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

    it(`should redirect to ${defaultVid}'s search page with ISBN search`, (done) => {
      const institution = "banana";
      const isbn = "abcd123456789";
      return persistent.event({
        "queryStringParameters": {
          institution,
          isbn
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${defaultVid}`);
      })
      .verify(done);
    });
  });

  describe('without an institution', () => {
    const defaultVid = INSTITUTIONS_TO_VID.default;

    it(`should redirect to ${defaultVid}'s search page with ISBN search`, (done) => {
      const isbn = "abcd123456789";
      return persistent.event({
        "queryStringParameters": {
          isbn
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${defaultVid}`);
      })
      .verify(done);
    });
  });

  describe('with extra non-ISBN parameters', () => {
    it('should prioritize LCN parameter over all others', (done) => {
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
        expect(result.headers.Location).toEqual(`${BASE_SEARCH_URL}query=isbn,contains,${isbn}&${ADVANCED_MODE}&vid=${institution.toUpperCase()}`);
      })
      .verify(done);
    });
  });
});

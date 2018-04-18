const LambdaTester = require('lambda-tester');
const persistent = require('../handler').persistent;

const rootURL = "http://bobcat.library.nyu.edu/primo-explore/search?query=";

const institutions = [ 'NYU', 'NS', 'CU', 'NYUAD', 'NYUSH', 'BHS', 'NYHS', 'HSL' ];

describe('persistent', () => {

  let lambda;
  beforeEach(() => {
    lambda = LambdaTester(persistent);
  });

  describe("null query", () => {
    it('should redirect to nyu search', (done) => {
      lambda.event({
        "queryStringParameters": null
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${rootURL}&vid=NYU`);
      })
      .verify(done);
    });
  });

  describe('institution view', () => {
    institutions.forEach((institution) => {
      it(`should redirect to ${institution} search`, (done) => {
        lambda.event({
          "queryStringParameters": {
            institution
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${rootURL}&vid=${institution}`);
        })
        .verify(done);
      });
    });

    it('should redirect to nyu if institution invalid', (done) => {
      lambda.event({
        "queryStringParameters": {
          institution: "banana"
        }
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${rootURL}&vid=NYU`);
      })
      .verify(done);
    });
  });

  describe('lcn', () => {
    describe('with a valid institution', () => {
      institutions.forEach(institution => {
        it(`should redirect to ${institution}\'s search page with lcn query`, (done) => {
          const lcn = "abcd123456789";
          lambda.event({
            "queryStringParameters": {
              institution,
              lcn
            }
          })
          .expectResult(result => {
            expect(result.statusCode).toEqual(302);
            expect(result.headers.Location).toEqual(`${rootURL}any,exact,${lcn}&vid=${institution}`);
          })
          .verify(done);
        });
      });

    });

    describe('with an invalid institution', () => {
      it(`should account for mis-capitalization`, (done) => {
        const institution = "nYu";
        const lcn = "abcd123456789";
        lambda.event({
          "queryStringParameters": {
            institution,
            lcn
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${rootURL}any,exact,${lcn}&vid=NYU`);
        })
        .verify(done);
      });

      it(`should redirect to NYU's search page with lcn query`, (done) => {
        const institution = "banana";
        const lcn = "abcd123456789";
        lambda.event({
          "queryStringParameters": {
            institution,
            lcn
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${rootURL}any,exact,${lcn}&vid=NYU`);
        })
        .verify(done);
      });
    });

    describe('without an institution', () => {
      it(`should redirect to NYU's search page with lcn query`, (done) => {
        const lcn = "abcd123456789";
        lambda.event({
          "queryStringParameters": {
            lcn
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${rootURL}any,exact,${lcn}&vid=NYU`);
        })
        .verify(done);
      });
    });

    describe('with extra non-lcn parameters', () => {
      
    });
  });

});
